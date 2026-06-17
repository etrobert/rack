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

### `info.toml` schema

```toml
name   = "Cropped Linen Shirt"   # display name
size   = "M"                      # free text (S / M / 48 / …)
price  = "€35"                    # free text; shown as-is on the card
status = "available"              # "available" | "sold"
blurb  = "Boxy, sun-bleached, made for a hot CSD afternoon."  # one-line POV

# optional
cover  = "front.jpg"   # which image leads; defaults to first alphabetically
order  = 10            # lower sorts first (reserved; rail currently slug-ordered)
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
