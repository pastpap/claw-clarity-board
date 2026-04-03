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

V1 tracks:
- EthicFlow
- Pathlizr

## External build-time data model

The app is prepared for external project data.

### Default behavior
By default, the build script reads YAML files from:
- `./projects`

and generates:
- `src/generated/projects.json`

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

## Data format

See `projects/README.md` for the summary file convention.
