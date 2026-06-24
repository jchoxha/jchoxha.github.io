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
| `styles.css` | Shared dark/glass styling. |

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
- [HappyPrism](https://jchoxha.github.io/HappyPrism-Canvas/) — interactive canvas ([main repo](https://github.com/jchoxha/HappyPrism-beta))
