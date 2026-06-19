import type { Piece } from '../lib/pieces';

type Props = {
  piece: Piece;
  onOpen: () => void;
};

// One piece on the rail: in-situ photo leads, with name, size, sold
// status, and the one-line POV blurb (the curation voice). Sold pieces stay
// visible, dimmed and marked.
export default function PieceCard({ piece, onOpen }: Props) {
  const sold = piece.status === 'sold';
  // `found` is the catalog default, so only the hands-on provenances earn a badge.
  const showProvenance = piece.provenance !== 'found';
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full break-inside-avoid text-left"
    >
      <figure className="overflow-hidden rounded-lg bg-marble shadow-sm ring-1 ring-steel/15 transition-shadow group-hover:shadow-md">
        <div className="relative">
          {piece.cover && (
            <img
              src={piece.cover}
              alt={piece.name}
              loading="lazy"
              decoding="async"
              onContextMenu={(e) => e.preventDefault()}
              className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                sold ? 'opacity-80 saturate-50' : ''
              }`}
            />
          )}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {sold && (
              <span className="rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-paper">
                Sold
              </span>
            )}
            {showProvenance && (
              <span className="rounded-full bg-walnut/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-paper">
                {piece.provenance}
              </span>
            )}
          </div>
        </div>

        <figcaption className="grid gap-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg leading-tight text-ink">
                {piece.name}
              </h2>
              {piece.size && (
                <p className="mt-0.5 text-xs uppercase tracking-wider text-steel-deep">
                  {piece.size}
                </p>
              )}
            </div>
          </div>
          {piece.blurb && (
            <p className="text-sm leading-snug text-ink/70">{piece.blurb}</p>
          )}
        </figcaption>
      </figure>
    </button>
  );
}
