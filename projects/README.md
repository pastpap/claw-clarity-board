# Projects Summary Layer

This folder contains structured, dashboard-friendly project summaries.

## Purpose

These files are the stable summary layer that sits between:
- repo docs
- daily memory notes
- long-term memory
- the Claw Clarity Board dashboard UI

Think of it like this:
- repo docs = deep project truth
- daily memory = fresh/raw context
- `projects/*.yml` = current structured snapshot
- dashboard = visual reader of the snapshot

## Update rules

Update a project YAML file when project state changes meaningfully.
That includes:
- a feature or milestone is merged
- roadmap direction changes
- current phase changes
- current focus changes
- a meaningful blocker appears or is removed
- a new canonical doc becomes important
- an important branch/track of work starts
- a project is paused, resumed, or blocked

Do not update these files for tiny implementation noise or one-off experiments that do not change the real project state.

## Maintenance workflow

Preferred assistant workflow after meaningful project work:
1. update repo docs
2. update `projects/<project>.yml`
3. update daily memory if needed
4. promote durable conclusions into long-term memory when appropriate

## File format

- One file per project
- YAML
- Human-editable
- Git-friendly
- Stable enough for dashboards and automation

## Required sections

Each project file should normally include:
- `version`
- `project`
- `identity`
- `current_state`
- `done`
- `next`
- `sources`
- `sync`

## Status values

Recommended `project.status` values:
- `active`
- `paused`
- `blocked`
- `incubating`
- `shipped`

Recommended roadmap-group `status` values:
- `planned`
- `exploring`
- `active`
- `blocked`
- `later`
- `done`
