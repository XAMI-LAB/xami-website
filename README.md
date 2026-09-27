# XAMI Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Refactor Plan

> **Note:** This is a work in progress. The goal is to refactor the current website to use Docusaurus.

- [x] Use `create-docusaurus` to create a new template website
- [x] Add pages for each of the main sections from the current website
- [ ] Add content to each of the pages
  - [x] Config Home page
  - [x] Add Our Mission page
  - [x] Add People page
  - [x] Add Research Projects page (with subpages)
    - [x] Add subpage for project 1
    - [x] Add subpage for project 2
    - [x] Add subpage for project 3
    - [x] Add subpage for project 4
  - [x] Add Publications page (BibTeX-driven via bibliodocus)
    - [ ] Populate `static/bibtex/publications.bib` (currently 3 entries)
  - [x] Add XAMI-Tube page

## Getting Started

### Installation

```
$ pnpm install
```

### Local Development

```
$ pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

The site is hosted on Cloudflare Workers (static assets, configured in `wrangler.jsonc`). Cloudflare Workers Builds deploys automatically on push, with `PNPM_VERSION=12.6.0` set in the build environment.

To deploy manually from your machine:

```
$ pnpm run deploy
```

This builds the site and uploads `build/` with `wrangler deploy` (run `pnpm wrangler login` first).

### File Structure

```
.
├── README.md
├── blog
│   ├── 2019-05-28-first-blog-post.md
│   ├── 2019-05-29-long-blog-post.md
│   ├── 2021-08-01-mdx-blog-post.mdx
│   ├── 2021-08-26-welcome
│   ├── authors.yml
│   └── tags.yml
├── docs
│   ├── intro.md
│   ├── tutorial-basics
│   └── tutorial-extras
├── docusaurus.config.ts # website config
├── package.json
├── sidebars.ts # sidebar config
├── src
│   ├── components
│   ├── css
│   └── pages
├── static
│   └── img
├── tsconfig.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml

12 directories, 12 files
```

### Publication List

The publication list is generated from a BibTeX file. To update the publication list, edit the `publications.bib` file in the `bibtex` directory.
Please refer to https://github.com/ZhipengHe/bibliodocus for more information on how the component works.
