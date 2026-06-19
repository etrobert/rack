# The Rack

A curated secondhand clothing catalog. You browse the rail online, then come
pull pieces in person at the next event. Lookbook + "sold" marking only — no
payments, accounts, or reservations.

Vite + React + TypeScript + Tailwind v4 SPA. Built to static files and served by
the existing caddy on `tower` (currently at `rack.etiennerobert.com` — the
domain lives in the deployment config, not here, so it can move later).

## Develop

```sh
npm install
npm run dev      # vite dev server
npm run lint
npm run build    # tsc + vite build → dist/
```

The flake builds the same static output (`nix build`) and exposes a caddy
`nixosModules.default`. The consumer (the `setup` repo) imports it and sets the
domain — the project itself never hardcodes one:

```nix
services.rack = {
  enable = true;
  hostName = "rack.etiennerobert.com";
};
```

## How pieces work (no rebuild, no commit)

Pieces are **not** in this repo. They're discovered at runtime from tower:

- Originals live under `files.etiennerobert.com/rack/`, served by caddy as a
  JSON directory listing (CORS-enabled).
- Each piece is a **subdir** holding its photo(s) + an `info.toml` sidecar.
- Photos are routed through the self-hosted imgproxy
  (`images.etiennerobert.com`) for on-the-fly resizing.

To add or replace a piece: drop files on tower. To mark one sold:
`vim info.toml`, set `status = "sold"`. Live instantly.

### Cataloging with `rack-new`

The manual drop is fine for one piece; for batches use the bundled helper. Give
it a slug and some photos — it numbers the photos (first = cover), drops in a
template `info.toml`, opens `$EDITOR` so you fill the fields, then rsyncs the
folder to tower. One command per piece, no rebuild:

```sh
nix run .#rack-new -- linen-shirt ~/shoot/linen-shirt/*.jpg
```

Destination defaults to `tower:/srv/files/rack`; override with `RACK_HOST` /
`RACK_PATH`. The dev shell (`nix develop`) puts `rack-new` on `$PATH` directly.

### Bulk add from a photo dump (Claude-driven)

When a whole shoot lands in one folder with several pieces mixed together,
`rack-new` (one slug per call) is slow and you'd have to pre-sort the photos.
Instead, hand the folder to Claude Code and let it do the grouping by **looking**
at the photos. Run it straight on tower (the rack dir is local there, so no
rsync). The flow we use:

1. **Point Claude at the folder**, e.g. _"add the pieces in `~/sync/Rack
photos`"_. Claude lists the images.
2. **Convert HEIC → JPG first.** iPhone shoots `.HEIC`, but `lib/pieces.ts` only
   recognizes `jpg/jpeg/png/webp/avif` — a `.heic` piece renders **photoless**.
   Convert with libheif: `nix shell nixpkgs#libheif -c heif-dec --quality 92
in.HEIC out.jpg`.
3. **Claude views every photo and groups them** into pieces (which shots are the
   same garment), best-effort including stray/ambiguous frames and flagging the
   uncertain ones. For each piece it picks the **best cover** and a display
   **name** only — it invents no other field.
4. **Dedupe against what's already live** — visually, not just by slug. Compare
   each candidate against the existing pieces' photos; skip anything that's the
   same garment (and skip slug collisions), leaving those source files in place.
5. **Stage each new piece** directly under `/srv/files/rack/<slug>/`: photos
   copied in as `01.<ext>`, `02.<ext>`, … (cover first) + an `info.toml` with
   only `name` set and every other field **commented out** (see schema below).
6. **Delete the source photos** only once they're placed; keep the originals of
   anything skipped (duplicate / collision).
7. **Verify + report.** Check the served listing and a couple of imgproxy cover
   renders return `200`; new folders lead the rail automatically (mod-time
   order). Claude finishes with a short summary of pieces, covers, flags, and
   skips.

Pieces are staged name-only on purpose; you fill `price`, `size`, `blurb`, etc.
afterward by editing each `info.toml` (live instantly). **Claude must not
overwrite a field you've already set** — when re-running or renaming, it only
touches `name`/`price`/… if they still match the value it originally wrote.

### `info.toml` schema

```toml
name      = "Cropped Linen Shirt"   # display name
size      = "M"                      # free text (S / M / 48 / …)
price     = "€35"                    # free text; shown as-is on the card
status    = "available"              # "available" | "sold"
blurb     = "Boxy, sun-bleached, made for a hot CSD afternoon."  # one-line POV

# optional
materials = "100% linen"   # shown as a "Materials" section in the detail view
cover     = "front.jpg"    # which image leads; defaults to first alphabetically
order     = 10             # lower sorts first (reserved; rail currently slug-ordered)
```

A piece with multiple photos gets a thumbnail strip in the detail view for free
(the phase-2 multi-photo / multi-model idea).

## Layout on tower

```
/srv/files/rack/
  cropped-linen-shirt/
    info.toml
    front.jpg
    back.jpg
  silk-scarf/
    info.toml
    01.jpg
```
