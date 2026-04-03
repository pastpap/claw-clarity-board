# Claw Clarity Board

Claw Clarity Board is a lightweight dashboard for visualizing structured project knowledge.

Instead of turning project state into another disconnected tool, it reads human-maintained YAML summaries from `projects/*.yml` and renders:
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

## Development

```bash
npm install
npm run dev
```

## Data format

See `projects/README.md` for the summary file convention.
