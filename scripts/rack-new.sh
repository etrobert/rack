#!/usr/bin/env bash
# rack-new SLUG PHOTO... — stage a new piece (photos numbered, first = cover,
# plus a template info.toml you fill in $EDITOR) and rsync it to tower, where
# The Rack picks it up at runtime. No rebuild, no commit. See README.
#
#   rack-new linen-shirt ~/shoot/linen/*.jpg
#
# Destination defaults to tower:/srv/files/rack; override via RACK_HOST/RACK_PATH.

dest="${RACK_HOST:-tower}:${RACK_PATH:-/srv/files/rack}/$1"
shift

stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

n=0
for photo in "$@"; do
  n=$((n + 1))
  printf -v i '%02d' "$n"
  cp "$photo" "$stage/$i.${photo##*.}"
done

cat >"$stage/info.toml" <<'EOF'
name   = ""
size   = ""
price  = ""
status = "available"
blurb  = ""
# materials  = ""
# source     = ""
# provenance = "handmade"  # or "modified"; omit for found pieces
EOF

"${EDITOR:-vi}" "$stage/info.toml"
# Don't preserve perms: mktemp -d makes the stage dir 0700, which would copy a
# private (un-servable) mode to the destination. --no-perms lets tower's umask
# (0022 → 0755/0644) decide, matching how the files server is set up.
rsync -a --no-perms "$stage/" "$dest/"
echo "Pushed $n photo(s) → $dest/ (live on next render)"
