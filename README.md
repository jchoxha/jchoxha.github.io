# jchoxha.github.io

A directory of my live GitHub Pages sites, served at the root:
**https://jchoxha.github.io/**

Static, no build step. Dark, playful look — a glowing animated gradient backdrop,
frosted-glass cards, and a per-project accent color that glows on hover. Push to
`main` and GitHub Pages redeploys automatically.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Home grid. Each card links to that project's detail page. |
| `project.html` | Reusable detail page (`project.html?p=<id>`) with nav buttons. |
| `projects.js` | The project registry — single source of truth for the site. |
| `buildstatus.js` | Live build tracker (reads the public GitHub Actions API). |
| `styles.css` | Shared dark/glass styling. |

## Build tracker

Every card and project page shows a live build-status pill so you can tell when
a fresh build is ready to test. It reads the latest GitHub Actions run for each
repo straight from the public API (`api.github.com/repos/…/actions/runs`) —
client-side, no auth, no build step. States: **Passing**, **Failing**,
**Building…** / **Queued** (pulsing, auto-refreshes every 30s until it settles),
**Cancelled**, **No builds**, and **Not tracked** (private repos like
`HappyPrism-v3`). Each project page lists every repo with its latest commit and
a "View runs" link; use the **↻ Refresh** button to force an update.

> Anonymous API calls are capped at 60/hr per IP, so results are cached for 45s.
> If you ever see "Unavailable · rate-limited", wait a minute and refresh.

## Adding or editing a project

Edit the `PROJECTS` array in `projects.js`. Each entry:

```js
{
  id: "chimera",                                   // used in project.html?p=chimera
  emoji: "🃏",
  title: "Chimera Cards",
  desc: "A card game project.",
  color: "#ff5c8a",                                // optional; palette auto-assigns
  repo: "https://github.com/jchoxha/chimera_cards",// main repo (always linked)
  pages: "https://jchoxha.github.io/chimera_cards/",// live site (always linked)
  repos: [ { label: "Canvas repo", url: "…" } ],   // optional: extra repos
  links: [ { label: "Launch app", url: "app.html", primary: true } ] // fallback pages
}
```

Every detail page **always** shows a "Visit site" button (`pages`) and a
"Source code" button (`repo`), plus any extra `repos`.

## Declaring which pages appear (`directory.json`)

Extra in-project pages are declared **inside each project's own repo** so the
project owns its link list. Publish a `directory.json` at the repo's Pages root
(e.g. `https://jchoxha.github.io/chimera_cards/directory.json`). The detail page
fetches it at runtime (same-origin, no build) and renders a button per link:

```json
{
  "links": [
    { "label": "Launch the app", "url": "app.html", "primary": true },
    { "label": "Changelog", "url": "changelog.html" }
  ]
}
```

- `url` may be relative (resolved against the Pages root) or absolute.
- `primary: true` highlights a link with the accent color.
- If a repo hasn't published `directory.json` yet, the inline `links` array in
  `projects.js` is used as a fallback.

> Repo-side `directory.json` files aren't committed here — add one to each
> project repo. Until then the inline `links` fallback is shown.

## Listed projects
- [str.rest](https://jchoxha.github.io/str-rest/) — digital guidebooks for short-term rental hosts
- [Chimera Cards](https://jchoxha.github.io/chimera_cards/) — card game (`/app.html`)
- [HappyPrism](https://happyprism.com) — interactive canvas; live at happyprism.com (main repo `HappyPrism-v3`, private), with public [beta](https://github.com/jchoxha/HappyPrism-beta) and [Canvas](https://jchoxha.github.io/HappyPrism-Canvas/) repos
