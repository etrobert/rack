# CLAUDE.md

The Rack — a curated secondhand clothing catalog. React 19 + Vite +
Tailwind v4 + TypeScript.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint

## Verify

Before committing, run `npm run build` and `npm run lint`.

## Adding pieces from a photo dump

When handed a folder of shoot photos, group them into pieces by looking at the
images and stage each into `/srv/files/rack/<slug>/`. Full runbook in the README
("Bulk add from a photo dump"). Project-specific rules that bite:

- **Convert HEIC → JPG first** (`heif-dec`). `lib/pieces.ts` only recognizes
  `jpg/jpeg/png/webp/avif`, so a `.heic` piece renders photoless.
- **Set `name` only**; leave every other `info.toml` field **commented out**, not
  `= ""` (empty strings are noise).
- **Never overwrite a field the user has set.** They edit prices/names live —
  only touch `name`/`price`/… if it still matches the value you originally wrote.
  (Renaming a folder must not clobber a `name`.)
- **Dedupe visually against live pieces**, not just by slug; skip same-garment
  duplicates and slug collisions, leaving their source files in place.
- **Delete source photos only after placing them**; keep originals of anything
  skipped.

## Context

Project background and planning notes live outside the repo:

- `~/sync/doc/projects/rack-edition-1-birthday-csd.md`
- `~/sync/doc/projects/curated-clothing-events.md`
