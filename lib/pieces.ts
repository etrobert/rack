import { parse } from 'smol-toml';
import { z } from 'zod';

// Pieces are discovered at runtime, not committed. Originals live on tower under
// files.etiennerobert.com/rack/, served by caddy as a JSON directory listing;
// each piece is a subdir holding its photo(s) + an info.toml. Photos are routed
// through the self-hosted imgproxy for on-the-fly resizing. Adding / replacing a
// piece = drop files on tower, no rebuild, no commit. Mark sold = edit
// info.toml's `status`.

const BASE_URL = 'https://files.etiennerobert.com/rack/';
const FILES_ORIGIN = 'https://files.etiennerobert.com';
const IMGPROXY_BASE = 'https://images.etiennerobert.com';

// Card images stay light; the lightbox detail loads a larger resize.
const CARD_WIDTH = 800;
const DETAIL_WIDTH = 1600;

interface CaddyItem {
  name: string;
  is_dir: boolean;
  url: string;
}

export type Status = 'available' | 'sold';

export interface Piece {
  slug: string;
  name: string;
  size: string;
  price: string;
  status: Status;
  blurb: string;
  /** Card-sized resize of the lead photo. */
  cover: string;
  /** Detail-sized resizes of every photo, lead first. */
  photos: string[];
}

// info.toml is hand-edited over SSH, so validate it at runtime rather than
// trusting a cast. Every field is optional — a piece with a half-written sidecar
// still renders what it has (downstream fills the gaps). A wrong *type*
// (e.g. price written as a number) fails parsing and the piece is skipped.
const PieceInfoSchema = z.object({
  name: z.string().optional(),
  size: z.string().optional(),
  price: z.string().optional(),
  status: z.string().optional(),
  blurb: z.string().optional(),
  /** Optional explicit lead photo filename; otherwise the first image wins. */
  cover: z.string().optional(),
  /** Optional sort key; lower sorts first. Falls back to slug order. */
  order: z.number().optional(),
});
type PieceInfo = z.infer<typeof PieceInfoSchema>;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);

function isImageFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.has(ext);
}

// Caddy returns directory names with a trailing slash, e.g. "linen-shirt/".
function dirSlug(name: string): string {
  return name.replace(/\/$/, '');
}

function imgproxyUrl(fileUrl: string, width: number): string {
  const path = fileUrl.replace(FILES_ORIGIN, '');
  return `${IMGPROXY_BASE}/insecure/w:${width}/plain/local://${path}`;
}

async function listDir(url: string): Promise<CaddyItem[]> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to list ${url}: ${res.status}`);
  return res.json();
}

function normalizeStatus(raw: string | undefined): Status {
  return raw?.trim().toLowerCase() === 'sold' ? 'sold' : 'available';
}

async function fetchPieceInfo(slug: string): Promise<PieceInfo> {
  const res = await fetch(`${BASE_URL}${encodeURIComponent(slug)}/info.toml`);
  if (!res.ok)
    throw new Error(`Missing info.toml for "${slug}": ${res.status}`);
  return PieceInfoSchema.parse(parse(await res.text()));
}

async function fetchPiece(slug: string): Promise<Piece> {
  const items = await listDir(`${BASE_URL}${encodeURIComponent(slug)}/`);
  const info = await fetchPieceInfo(slug);

  const imageNames = items
    .filter((i) => !i.is_dir && isImageFile(i.name))
    .map((i) => i.name)
    .sort();

  // Honour an explicit cover; otherwise the first (alphabetical) image leads.
  const ordered = info.cover
    ? [
        ...imageNames.filter((n) => n === info.cover),
        ...imageNames.filter((n) => n !== info.cover),
      ]
    : imageNames;

  const fileUrl = (name: string) =>
    `${BASE_URL}${encodeURIComponent(slug)}/${encodeURIComponent(name)}`;

  return {
    slug,
    name: info.name ?? slug,
    size: info.size ?? '',
    price: info.price ?? '',
    status: normalizeStatus(info.status),
    blurb: info.blurb ?? '',
    cover: ordered.length ? imgproxyUrl(fileUrl(ordered[0]), CARD_WIDTH) : '',
    photos: ordered.map((name) => imgproxyUrl(fileUrl(name), DETAIL_WIDTH)),
  };
}

export async function getPieces(): Promise<Piece[]> {
  const items = await listDir(BASE_URL);
  const slugs = items.filter((i) => i.is_dir).map((i) => dirSlug(i.name));

  const settled = await Promise.allSettled(slugs.map(fetchPiece));
  const pieces: Piece[] = [];
  for (const result of settled) {
    // A malformed piece (missing info.toml, etc.) shouldn't blank the whole
    // rail — skip it and surface the rest.
    if (result.status === 'fulfilled') pieces.push(result.value);
    else console.warn('Skipping piece:', result.reason);
  }
  return pieces;
}
