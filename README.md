# Claw Clarity Board

Claw Clarity Board is a lightweight dashboard for visualizing structured project knowledge.

Instead of turning project state into another disconnected tool, it reads structured project summaries and renders:
- project identity
- current phase
- current focus
- recent milestones
- roadmap groups
- source-of-truth document references
- sync/confidence state

## Concept

This project is built around a simple layered model:
- repo docs = deep project truth
- daily memory = fresh/raw context
- `projects/*.yml` = structured current snapshot
- dashboard = visual reader

## Current scope

### Public mode
The public GitHub Pages version currently tracks:
- Claw Clarity Board itself

### Private mode
Real internal project summaries such as EthicFlow and Pathlizr belong in private mode and should be supplied from a private data source or local private hosting.

## External build-time data model

The app is prepared for external project data.

### Default behavior
By default, the build script reads YAML files from:
- `./projects`

and generates:
- `src/generated/projects.json`

In this public repository, the default local `projects/` directory should contain only public-mode data.

### External data source
You can override the source directory with:

```bash
CLARITY_DATA_DIR=../claw-clarity-data/projects npm run build
```

or for development:

```bash
CLARITY_DATA_DIR=../claw-clarity-data/projects npm run dev
```

This allows the app code to stay public while project data can come from a separate private repo at build time.

## Development

```bash
npm install
npm run dev
```

## GitHub Pages

This repo is prepared for GitHub Pages deployment from `main` via GitHub Actions.

The Pages build uses the local `projects/` directory, which means GitHub Pages is appropriate for:
- public demo data
- sanitized/sample project summaries
- open-source preview deployments

It is not appropriate for private project data because anything bundled into the static build becomes public.

## Data format

See `projects/README.md` for the summary file convention.
