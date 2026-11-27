# XAMI Lab Website

Website of the XAMI Lab (Explainable Analytics for Machine Intelligence) at QUT, live at [www.xami-lab.org](https://www.xami-lab.org).

Built with React and Vite (React Router writes every page out as a real HTML file at build time), written in TypeScript, managed with pnpm, and hosted on Cloudflare Workers. Everything the site says lives in the `content/` folder; the code only decides how it looks.

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
pnpm dev
```

`pnpm dev` opens the site at http://localhost:5173 and reloads as you edit.

Use **pnpm** for every command. `npm` and `npx` refuse to run in this repo because the project pins pnpm.

## Common Tasks

Most updates are content edits; no React knowledge is needed. Every file in `content/` starts with a short comment explaining its fields.

| I want to...                                  | Edit this                                          |
| --------------------------------------------- | -------------------------------------------------- |
| Add or update a lab member                    | `content/people.yaml` (photo in `public/photos/`)  |
| Add a publication                             | `content/publications.bib`                         |
| Edit a research theme                         | `content/themes.yaml`                              |
| Edit the mission, join us or acknowledgements | `content/site.yaml`                                |
| Add an institution logo                       | `content/site.yaml` (logo file in `public/logos/`) |
| Edit the privacy policy                       | `content/privacy-policy.md`                        |
| Describe a page for search engines            | `content/site.yaml` (`descriptions`)               |
| Redirect an old address                       | `public/_redirects`                                |
| Change the menu or the list of pages          | `app/content/pages.ts`                             |
| Change colours or shared styles               | `app/styles/site.css`                              |

The site checks the content every time it is built. A mistake (a person id that does not exist, a missing photo file, a misspelt field) stops the build with a message naming the file and the entry, so a broken link never reaches the live site.

### Add or update a lab member

Add an entry to `content/people.yaml`. People appear in the order they are written.

```yaml
- id: jane-doe # lower-case words joined by hyphens; themes refer to people by this
  name: "Jane Doe (JD)" # as shown on the site; a nickname goes in brackets
  title: Dr. # optional
  groups: [member] # leader, member, collaborator or alumni; more than one is allowed
  position: "PhD Student" # optional
  affiliations: # up to two lines
    - "School of Information Systems, QUT"
  photo: jane-doe.jpg # optional; a file in public/photos/
  links: # all optional: email, website, linkedin, scholar, github
    email: jane.doe@qut.edu.au
    scholar: https://scholar.google.com/citations?user=...
```

- Alumni also take `graduated`, with a `degree` (for example `PhD`) and a `year`. They are listed newest first.
- Lab people are shown darker in author lists. Papers are matched by the name without the part in brackets; add `aliases` (a list of other spellings) when a paper spells the name differently.
- Photos work best square and around 600 pixels wide.

### Add a publication

Append a BibTeX entry to `content/publications.bib`.

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
  code    = {https://github.com/...},
}
```

- Include `date` (`YYYY-MM-DD`): papers of the same year are ordered by it.
- `doi` or `url` links the title; `arxiv`, `code`, `code2` and `demo` add further links; `abstract` adds the Abstract panel.
- The kind shown beside the venue comes from the entry: `inproceedings` is a conference paper, a venue starting with "arXiv" is a preprint, one starting with "PhysioNet" is a dataset, anything else is a journal article.
- Write a percent sign as `\%`. Titles and venues appear exactly as written, so write them in the capitals you want.

### Edit a research theme

Each theme is an entry in `content/themes.yaml`: its `title`, a short `summary` for the home page, the full `description` (a list of paragraphs) for the Research themes page, its `people` (ids from `people.yaml`) and its selected `publications` (keys from `publications.bib`). `scene` names the animated example shown with the theme; the five examples are components in `app/scenes/`.

## Project Structure

```
.
├── content/                # Everything the site says
│   ├── people.yaml
│   ├── themes.yaml
│   ├── site.yaml           # Lab name, mission, join us, acknowledgements, page descriptions
│   ├── publications.bib
│   └── privacy-policy.md
├── public/                 # Copied as-is to the site root
│   ├── photos/  logos/  brand/
│   ├── share.png           # The picture shown when a link to the site is shared
│   └── _redirects          # Old addresses sent to their new pages
├── app/
│   ├── content/            # Reads, checks and links the content; the list of pages; page metadata
│   ├── components/         # Menu, footer, page title, network background and other shared pieces
│   ├── scenes/             # The five animated examples of the research themes
│   ├── routes/             # One file per page, plus the generated files (sitemap, robots, llms)
│   ├── styles/             # site.css is shared; each page has its own file
│   ├── root.tsx            # The page shell
│   └── routes.ts           # Which address shows which page
├── scripts/finish-build.mjs
├── static/sketches/        # The approved static design sketches (reference only, not part of the site)
├── react-router.config.ts  # Every page is pre-built to HTML; no server at runtime
├── wrangler.jsonc          # Cloudflare Workers deployment
├── pnpm-workspace.yaml     # pnpm settings: the 3-day rule for new package versions
└── package.json
```

Generated folders (`build/`, `.react-router/`, `node_modules/`) are not committed; never edit them.

Besides the pages, the build writes `sitemap.xml`, `robots.txt`, `llms.txt` (a short guide for AI readers) and `llms-full.txt` (the whole site as one Markdown file) from the same content.

## Scripts

| Command           | What it does                                                      |
| ----------------- | ----------------------------------------------------------------- |
| `pnpm dev`        | Dev server with live reload at http://localhost:5173              |
| `pnpm build`      | Production build into `build/client/`                             |
| `pnpm typecheck`  | TypeScript check                                                  |
| `pnpm check`      | TypeScript check, then the production build                       |
| `pnpm format`     | Prettier over the whole repo                                      |
| `pnpm preview`    | Build, then serve the result locally the way Cloudflare will      |
| `pnpm run deploy` | Build and deploy to Cloudflare from your machine (see Deployment) |

## Before You Push

```bash
pnpm format
pnpm check
```

`pnpm check` is the definitive test: it type-checks the code, reads and checks all content, and builds every page.

## Git Workflow

- `master` is production: every push to it deploys the live site.
- `preview` deploys to preview.xami-lab.org for review before merging into `master`.
- Work on a branch and open a pull request into `master`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat: add a page` or `fix(people): correct photo link`.

## Deployment

Cloudflare Workers Builds deploys one Worker, `xami-website`, from this repository. It serves the static `build/client/` folder as configured in `wrangler.jsonc`.

| Branch    | Deployed as                                 | Address                                              |
| --------- | ------------------------------------------- | ---------------------------------------------------- |
| `master`  | Production                                  | [www.xami-lab.org](https://www.xami-lab.org)         |
| `preview` | A Cloudflare Preview named after the branch | [preview.xami-lab.org](https://preview.xami-lab.org) |

Build settings in the Cloudflare dashboard:

| Setting                              | Value                       |
| ------------------------------------ | --------------------------- |
| Production branch                    | `master`                    |
| Build command                        | `pnpm build`                |
| Deploy command                       | `pnpm dlx wrangler deploy`  |
| Non-production branch deploy command | `pnpm dlx wrangler preview` |
| Build variable                       | `PNPM_VERSION=12.6.0`       |

`wrangler preview` requires the `previews` block in `wrangler.jsonc` (it can stay empty).

Each page is built as a flat file (`people.html`), which Cloudflare serves without a trailing slash (`/people`; `/people/` is sent there). Unknown addresses get the site's own not-found page on the live site; a branch preview answers them with a bare "Not found", which is how Cloudflare's previews behave. Old addresses (for example `/members` or `/bibliography`) redirect to current pages through `public/_redirects`.

To deploy by hand, run `pnpm dlx wrangler login` once, then `pnpm run deploy`.

## Notes for AI Coding Agents

These apply to human contributors too, but they are the mistakes agents make most often here.

- Use `pnpm` only. `npm` and `npx` fail because `package.json` pins pnpm through `devEngines`.
- Run pnpm from the repository root. The repo has its own `pnpm-workspace.yaml`, which keeps pnpm from treating a parent folder as the project.
- New package versions must be at least 3 days old (`minimumReleaseAge` in `pnpm-workspace.yaml`). Do not bypass it; an urgent security fix gets a one-off entry under `minimumReleaseAgeExclude`.
- Only packages whose code reaches visitors go in `dependencies`; build tools go in `devDependencies`. The Third-party licences page is generated from `dependencies`.
- Content belongs in `content/`, never hard-coded in components. If a page needs something the content files lack, add a field to the file and to `app/content/schema.ts`.
- `app/content/*.server.ts` runs only while the site is built. Pages import types and helpers from `app/content/model.ts`, never from `schema.ts`, so the checking code is not sent to visitors.
- Each page's styles are nested under one class on its `<main>` (for example `.p-people`), because visitors move between pages without a reload.
- Keep page addresses stable. A new page goes in both `app/routes.ts` and `app/content/pages.ts`; a removed or renamed one needs a line in `public/_redirects`.
- Verify with `pnpm check`. Do not edit generated folders (`build/`, `.react-router/`, `node_modules/`).

## Troubleshooting

| Problem                                                    | Fix                                                       |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| `npm error EBADDEVENGINES ... "pnpm" does not match "npm"` | Use `pnpm` instead of `npm` or `npx`                      |
| The build stops with `ContentError: content/...`           | Fix the entry it names in that content file               |
| pnpm refuses a package version as too new                  | Wait until it is 3 days old, or pick the previous version |
| Engine error about the Node.js version                     | Install Node.js 22.22.1 or newer                          |
| `Command "dev" not found`                                  | Run the command from the repository root                  |
