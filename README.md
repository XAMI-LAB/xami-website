# XAMI Lab Website

Website of the XAMI Lab (Explainable Analytics for Machine Intelligence) at QUT, live at [www.xami-lab.org](https://www.xami-lab.org).

Built with [Docusaurus](https://docusaurus.io/) 3 (React, TypeScript), managed with pnpm, and hosted on Cloudflare Workers.

## Prerequisites

You need three tools, installed once per machine.

| Tool    | Version          | Why                                    |
| ------- | ---------------- | -------------------------------------- |
| Git     | any recent       | Clone the repository and commit        |
| Node.js | 22.22.1 or newer | Runs the build tools (24 LTS works)    |
| pnpm    | 12.6.0 (pinned)  | Package manager used for every command |

Do not use Corepack to provide pnpm; install pnpm directly as shown below.

### 1. Check what you already have

Run these in a terminal (PowerShell on Windows):

```bash
git --version
node -v
pnpm -v
```

Skip any step below that you already satisfy:

- **Git**: any version prints, skip the Git step.
- **Node.js**: `node -v` prints `v22.22.1` or newer, skip the Node.js step.
- **pnpm**: `pnpm -v` prints `12.x`, skip the pnpm step. An older pnpm (11 or earlier) only needs `pnpm self-update latest-12`.

### 2. Install the missing tools

#### macOS

```bash
# Git (skip if installed): installs the Xcode Command Line Tools, which include Git
xcode-select --install

# Node.js via nvm (skip if node -v is v22.22.1 or newer)
touch ~/.zshrc   # nvm's installer writes its setup here; the file may not exist on a new Mac
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
# Close and reopen the terminal, then:
nvm install 24
nvm alias default 24

# pnpm 12 (skip if pnpm -v is 12.x)
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=12.6.0 sh -
```

#### Linux

```bash
# Git (skip if installed): use your distribution's package manager, for example
sudo apt install git        # Debian / Ubuntu
sudo dnf install git        # Fedora

# Node.js via nvm (skip if node -v is v22.22.1 or newer)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
# Close and reopen the terminal (or run: source ~/.bashrc), then:
nvm install 24
nvm alias default 24

# pnpm 12 (skip if pnpm -v is 12.x)
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=12.6.0 sh -
```

#### Windows (PowerShell)

```powershell
# Git (skip if installed)
winget install --id Git.Git -e

# Node.js via fnm (skip if node -v is v22.22.1 or newer)
winget install Schniz.fnm
# Load fnm in every PowerShell session (creates your profile if needed, then appends one line)
if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -Force }
Add-Content $PROFILE 'fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression'
# Close and reopen PowerShell, then:
fnm install 24
fnm default 24

# pnpm 12 (skip if pnpm -v is 12.x)
npm install -g pnpm@latest-12
```

The pnpm docs recommend npm on Windows because Windows Defender sometimes blocks pnpm's standalone installer. pnpm installed this way belongs to the current fnm Node version, so run the `npm install -g` line again if you switch the default Node version.

### 3. Confirm

Open a new terminal and run the three commands from step 1 again. You should see a Git version, Node.js `v22.22.1` or newer, and pnpm `12.x`.

## Quick Start

```bash
git clone git@github.com:XAMI-LAB/xami-website.git
cd xami-website
pnpm install
pnpm start
```

`pnpm start` opens the site at http://localhost:3000 and reloads as you edit.

Use **pnpm** for every command. `npm` and `npx` refuse to run in this repo because the project pins pnpm.

## Common Tasks

Most updates are content edits; no React knowledge is needed.

| I want to...                    | Edit this                                                          |
| ------------------------------- | ------------------------------------------------------------------ |
| Add or update a lab member      | `src/data/members.ts`                                              |
| Add a publication               | `static/bibtex/publications.bib`                                   |
| Add a video                     | `src/pages/xami-tube.mdx`                                          |
| Edit a research theme           | `docs/themes/<theme>.md`                                           |
| Edit the mission page           | `src/pages/mission.md`                                             |
| Edit the homepage               | `src/pages/index.tsx`, `src/components/HomepageFeatures/index.tsx` |
| Change the navbar or footer     | `docusaurus.config.ts` (`themeConfig`)                             |
| Change colours or global styles | `src/css/custom.css`                                               |

### Add or update a lab member

Add an entry to the `authors` object in `src/data/members.ts`. The key (for example `chunouyang`) is the member's ID and must be unique; videos refer to members by this key.

```ts
janedoe: {
  name: "Dr. Jane Doe",
  title: "School of Information Systems @QUT", // shown under the name
  occupation: OccupationSection.Researchers,
  selected: true,          // false hides the member from the People page
  url: "https://...",      // profile link on the name; "" for none
  image_url: "https://...",
  idx: 3,                  // order within the section, lowest first
  email: "jane.doe@qut.edu.au",
  scholar: "https://scholar.google.com/citations?user=...",
  linkedin: "https://www.linkedin.com/in/...",
},
```

The People page shows these sections: `Leader`, `Collaborators`, `Researchers`, `ExternalResearchers`, `Alumni`. Members in `Presenters` or `Deprecated` are not shown there but can still be credited on videos. All social fields are optional; see the `Author` interface at the top of the file for the full list.

### Add a publication

Append a BibTeX entry to `static/bibtex/publications.bib`. The Publications page reads this file directly.

```bibtex
@article{doe2026example,
  author  = {Jane Doe and Chun Ouyang},
  title   = {An Example Paper},
  journal = {Example Journal},
  volume  = {12},
  pages   = {1--10},
  year    = {2026},
  date    = {2026-03-15},
  doi     = {10.1000/example},
}
```

- Include `date` (`YYYY-MM-DD`): the page sorts by it by default.
- `doi` or `url` adds a link to the paper.
- The type filter recognises `article`, `inproceedings`/`conference`, `phdthesis`/`mastersthesis` and `misc`.

### Add a video

Add a `VideoEmbed` block under the right heading in `src/pages/xami-tube.mdx`:

```mdx
### _Conference Name 2026_

<VideoEmbed
  id="YouTubeVideoId"
  venue="Conference Name 2026"
  title="Talk Title"
  contributors={["chunouyang", "janedoe"]}
/>
```

`id` is the part after `watch?v=` in the YouTube link. `contributors` are member keys from `src/data/members.ts`.

### Edit a research theme

Each theme is a Markdown file in `docs/themes/`, served under `/research/themes/<slug>`. Its images live in `docs/themes/img/`. To add a theme, copy an existing file and change its front matter (`slug`, `title`, `sidebar_position`, `description`, `image`).

## Project Structure

```
.
├── docs/                   # Research pages (/research)
│   ├── index.md            # Research overview
│   └── themes/             # One Markdown file per research theme
├── src/
│   ├── components/
│   │   ├── bibliodocus/    # BibTeX loading, formatting and filters (Publications page)
│   │   ├── HomepageFeatures/
│   │   └── PeopleFeatures/ # People page, member cards, video embeds
│   ├── css/                # Global styles (custom.css imports the rest)
│   ├── data/members.ts     # All lab members
│   ├── pages/              # Standalone pages: home, mission, people, publications, XAMI-Tube, legal
│   ├── theme/              # Overrides of Docusaurus theme components
│   └── types/              # Type declarations for untyped packages
├── static/                 # Copied as-is to the site root
│   ├── bibtex/publications.bib
│   └── img/
├── docusaurus.config.ts    # Site config: URL, navbar, footer, plugins
├── sidebars.ts             # Research sidebar
├── wrangler.jsonc          # Cloudflare Workers deployment
├── pnpm-workspace.yaml     # pnpm settings: allowed install scripts, security overrides
└── package.json
```

Generated folders (`build/`, `.docusaurus/`, `node_modules/`) are not committed; never edit them.

## Scripts

| Command           | What it does                                                      |
| ----------------- | ----------------------------------------------------------------- |
| `pnpm start`      | Dev server with live reload at http://localhost:3000              |
| `pnpm build`      | Production build into `build/`                                    |
| `pnpm serve`      | Serve the production build locally                                |
| `pnpm typecheck`  | TypeScript check                                                  |
| `pnpm lint:all`   | ESLint over `src/`, fixing what it can                            |
| `pnpm format:all` | Prettier over the whole repo                                      |
| `pnpm clear`      | Clear the Docusaurus cache (try this if the dev server acts up)   |
| `pnpm run deploy` | Build and deploy to Cloudflare from your machine (see Deployment) |

`generate-publications` and `update-publications` are left over from an earlier setup and do not currently work.

## Before You Push

Run these three checks; all must pass:

```bash
pnpm typecheck
pnpm exec eslint 'src/**/*.{js,jsx,ts,tsx}'
pnpm build
```

`pnpm build` fails on broken internal links, so it also catches wrong page paths.

A pre-commit hook (husky + lint-staged) runs ESLint and Prettier on the files you stage, so formatting is fixed automatically when you commit.

## Git Workflow

- `master` is production: every push to it deploys the live site.
- `preview` deploys to preview.xami-lab.org for review before merging into `master`.
- Work on a branch and open a pull request into `master`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat: add news page` or `fix(people): correct photo link`.

## Deployment

Cloudflare Workers Builds builds and deploys two Workers from this repository. Each serves the static `build/` folder as configured in `wrangler.jsonc`.

| Branch    | Worker                 | Address                                                                          |
| --------- | ---------------------- | -------------------------------------------------------------------------------- |
| `master`  | `xami-website`         | [www.xami-lab.org](https://www.xami-lab.org)                                     |
| `preview` | `xami-website-preview` | [preview.xami-lab.org](https://preview.xami-lab.org), hidden from search engines |

Build settings in the Cloudflare dashboard:

| Setting         | `xami-website`             | `xami-website-preview`                    |
| --------------- | -------------------------- | ----------------------------------------- |
| Build command   | `pnpm build`               | `pnpm build`                              |
| Deploy command  | `pnpm dlx wrangler deploy` | `pnpm dlx wrangler deploy --env preview`  |
| Build variables | `PNPM_VERSION=12.6.0`      | `PNPM_VERSION=12.6.0`, `SITE_ENV=preview` |

`SITE_ENV=preview` makes the build use the preview address and mark every page `noindex` (see `docusaurus.config.ts`).

Old-site URLs (for example `/members`) redirect to current pages through `static/_redirects`.

To deploy by hand, run `pnpm wrangler login` once, then `pnpm run deploy`.

## Notes for AI Coding Agents

These apply to human contributors too, but they are the mistakes agents make most often here.

- Use `pnpm` only. `npm` and `npx` fail because `package.json` pins pnpm through `devEngines`.
- Run pnpm from the repository root. The repo has its own `pnpm-workspace.yaml`, which keeps pnpm from treating a parent folder as the project.
- A new dependency with an install script must be listed under `allowBuilds` in `pnpm-workspace.yaml` (`true` to run it, `false` to skip it). Otherwise `pnpm install` exits with `ERR_PNPM_IGNORED_BUILDS` and the Cloudflare build fails.
- Keep page URLs stable. The site uses `trailingSlash: false`, so pages are served at `/people`, not `/people/`.
- Content belongs in the data and Markdown files listed under Common Tasks, not hard-coded in components.
- Verify with the three commands in Before You Push. `pnpm build` is the definitive check.
- Do not edit generated folders (`build/`, `.docusaurus/`, `node_modules/`).

## Troubleshooting

| Problem                                                    | Fix                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `npm error EBADDEVENGINES ... "pnpm" does not match "npm"` | Use `pnpm` instead of `npm` or `npx`                            |
| `ERR_PNPM_IGNORED_BUILDS`                                  | Add the named package to `allowBuilds` in `pnpm-workspace.yaml` |
| Engine error about the Node.js version                     | Install Node.js 22.22.1 or newer                                |
| Dev server shows stale content                             | `pnpm clear`, then `pnpm start`                                 |
