/*
 * Live build status from the public GitHub Actions API (unauthenticated).
 *
 * Anonymous requests are rate-limited to 60/hr per IP, so results are cached
 * in sessionStorage for a short TTL and only re-fetched on demand / while a
 * build is still running.
 */

function parseRepo(url) {
  const m = /github\.com\/([^\/]+)\/([^\/]+)/.exec(url || "");
  return m ? { owner: m[1], name: m[2].replace(/\.git$/, "") } : null;
}

// Every repo referenced by a project (main repo first, then extras).
function projectRepos(project) {
  const list = [];
  if (project.repo) list.push({ label: "Main repo", url: project.repo });
  (project.repos || []).forEach(r => list.push({ label: r.label, url: r.url }));
  return list
    .map(r => ({ ...r, ...parseRepo(r.url) }))
    .filter(r => r.owner && r.name);
}

const BUILD_STATES = {
  success:     { label: "Passing",     color: "#3ddc97", ready: true },
  failure:     { label: "Failing",     color: "#ff5c6c" },
  cancelled:   { label: "Cancelled",   color: "#a39fb8" },
  in_progress: { label: "Building…",   color: "#5b8cff", live: true },
  queued:      { label: "Queued",      color: "#ffd23f", live: true },
  none:        { label: "No builds",   color: "#a39fb8" },
  private:     { label: "Not tracked", color: "#a39fb8" },
  error:       { label: "Unavailable", color: "#a39fb8" }
};

const BUILD_CACHE_TTL = 45000; // ms

function buildCacheGet(key) {
  try {
    const v = JSON.parse(sessionStorage.getItem(key));
    if (v && Date.now() - v.t < BUILD_CACHE_TTL) return v.s;
  } catch (e) {}
  return null;
}
function buildCacheSet(key, s) {
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), s })); } catch (e) {}
}

async function fetchBuildStatus(owner, name, { force = false } = {}) {
  const key = `build:${owner}/${name}`;
  if (!force) {
    const cached = buildCacheGet(key);
    if (cached) return cached;
  }
  const api = `https://api.github.com/repos/${owner}/${name}/actions/runs?per_page=1`;
  let status;
  try {
    const res = await fetch(api, { headers: { Accept: "application/vnd.github+json" } });
    if (res.status === 404) status = { state: "private" };
    else if (res.status === 403) status = { state: "error", note: "rate-limited" };
    else if (!res.ok) status = { state: "error" };
    else {
      const data = await res.json();
      const run = (data.workflow_runs || [])[0];
      if (!run) status = { state: "none" };
      else {
        let state;
        if (run.status !== "completed") state = run.status === "queued" ? "queued" : "in_progress";
        else if (run.conclusion === "success") state = "success";
        else if (run.conclusion === "cancelled" || run.conclusion === "skipped") state = "cancelled";
        else state = "failure";
        status = {
          state,
          finishedAt: run.status === "completed" ? run.updated_at : run.run_started_at || run.created_at,
          runUrl: run.html_url,
          workflow: run.name,
          branch: run.head_branch,
          commit: run.head_commit
            ? { message: (run.head_commit.message || "").split("\n")[0], sha: (run.head_commit.id || "").slice(0, 7) }
            : null
        };
      }
    }
  } catch (e) {
    status = { state: "error" };
  }
  if (status.state !== "error") buildCacheSet(key, status);
  return status;
}

function relTime(iso) {
  if (!iso) return "";
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24); return `${d}d ago`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Compact status pill used on home cards and project build rows.
function buildPillHTML(status) {
  const meta = BUILD_STATES[status.state] || BUILD_STATES.error;
  const live = meta.live ? " live" : "";
  const when = status.finishedAt ? ` · ${relTime(status.finishedAt)}` : "";
  const note = status.note ? ` · ${status.note}` : "";
  return `<span class="build-pill${live}" style="--s:${meta.color}">` +
    `<span class="bdot"></span>${meta.label}${escapeHtml(when + note)}</span>`;
}

// True if any status is still running (used to decide whether to keep polling).
function anyBuildLive(statuses) {
  return statuses.some(s => (BUILD_STATES[s.state] || {}).live);
}
