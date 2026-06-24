/*
 * Central project registry for the directory site.
 *
 * Each project gets a detail page at  project.html?p=<id>
 *
 * Required fields: id, title, repo, pages.
 * The detail page ALWAYS renders a "Visit site" button (pages) and a
 * "Source code" button (repo).
 *
 * Extra in-project pages (e.g. an app entry point) are discovered at runtime
 * from a `directory.json` published at the project's Pages root — see
 * README.md for the format. The `links` array below is the inline fallback
 * used when a repo hasn't published its directory.json yet.
 */
const PROJECTS = [
  {
    id: "str-rest",
    emoji: "🏔️",
    title: "str.rest",
    desc: "Digital guidebooks and direct-booking pages for short-term rental hosts.",
    color: "#5b8cff",
    repo: "https://github.com/jchoxha/str-rest",
    pages: "https://jchoxha.github.io/str-rest/",
    links: []
  },
  {
    id: "chimera",
    emoji: "🃏",
    title: "Chimera Cards",
    desc: "A card game project.",
    color: "#ff5c8a",
    repo: "https://github.com/jchoxha/chimera_cards",
    pages: "https://jchoxha.github.io/chimera_cards/",
    links: [
      { label: "Launch the app", url: "app.html", primary: true }
    ]
  },
  {
    id: "happyprism",
    emoji: "🌈",
    title: "HappyPrism",
    desc: "An interactive canvas experience. The live app runs at happyprism.com; the work is split across several repos.",
    color: "#3ddc97",
    // Live site is a custom domain (Heroku), not GitHub Pages.
    repo: "https://github.com/jchoxha/HappyPrism-v3", // main repo (private)
    pages: "https://happyprism.com",                  // live site
    // Additional repos for this multi-repo project (the main repo is `repo`).
    repos: [
      { label: "Beta repo", url: "https://github.com/jchoxha/HappyPrism-beta" },
      { label: "Canvas repo", url: "https://github.com/jchoxha/HappyPrism-Canvas" }
    ],
    // Extra public pages. happyprism.com is cross-origin, so directory.json
    // can't be fetched from it — these inline links are always used here.
    links: [
      { label: "Canvas demo", url: "https://jchoxha.github.io/HappyPrism-Canvas/" },
      { label: "Beta demo", url: "https://jchoxha.github.io/HappyPrism-beta/" }
    ]
  }
];

// Fallback palette gives each card a distinct glow if `color` is omitted.
const PALETTE = ["#ff5c8a", "#5b8cff", "#3ddc97", "#b06bff", "#ffd23f", "#ff8c42"];

function projectColor(project, i = 0) {
  return project.color || PALETTE[i % PALETTE.length];
}

function findProject(id) {
  return PROJECTS.find(p => p.id === id);
}

/*
 * Resolve the link list for a project's detail page.
 * Tries <pages>/directory.json first (same-origin, no build step); falls back
 * to the inline `links` array. Relative `url`s resolve against the Pages root.
 */
async function resolveProjectLinks(project) {
  let links = project.links || [];
  try {
    const res = await fetch(new URL("directory.json", project.pages).href, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.links)) links = data.links;
    }
  } catch (e) {
    /* no manifest yet — use inline fallback */
  }
  return links.map(l => ({
    label: l.label,
    url: new URL(l.url, project.pages).href,
    primary: !!l.primary
  }));
}
