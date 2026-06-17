import { useEffect, useState } from 'react';
import type { Piece } from '../lib/pieces';

type Props = {
  piece: Piece;
  onClose: () => void;
};

// Detail view: photo(s) + name / size / price / status / blurb. A gentle
// fade+scale on open; no clever animations to misread or break. Multi-photo
// pieces (the phase-2 idea) get a thumbnail strip for free.
export default function Lightbox({ piece, onClose }: Props) {
  const [active, setActive] = useState(0);
  const sold = piece.status === 'sold';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={piece.name}
    >
      {/* Click-anywhere-to-close backdrop. A real button so it's keyboard- and
          screen-reader-accessible; Escape and the × button close too. */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out bg-ink/70 backdrop-blur-sm"
      />

      <div className="relative grid max-h-full w-full max-w-4xl animate-rise-in overflow-y-auto rounded-xl bg-marble shadow-2xl md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col bg-paper-deep/40">
          {piece.photos[active] && (
            <img
              src={piece.photos[active]}
              alt={piece.name}
              decoding="async"
              onContextMenu={(e) => e.preventDefault()}
              className="block w-full"
            />
          )}
          {piece.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {piece.photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`size-14 shrink-0 overflow-hidden rounded ring-2 ${
                    i === active ? 'ring-honey' : 'ring-transparent'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="size-full object-cover"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid content-start gap-4 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">{piece.name}</h2>
            {piece.price && (
              <p className="shrink-0 font-display text-2xl text-ink">
                {piece.price}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-steel-deep">
            {piece.size && <span>Size {piece.size}</span>}
            <span
              className={
                sold ? 'font-semibold text-ink' : 'font-semibold text-honey'
              }
            >
              {sold ? 'Sold' : 'Available'}
            </span>
          </div>

          {piece.blurb && (
            <p className="text-[0.95rem] leading-relaxed text-ink/80">
              {piece.blurb}
            </p>
          )}

          <hr className="border-steel/25" />
          <p className="text-sm text-ink/60">
            It&apos;s there if it&apos;s there when you come — see it in person
            at the next event.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-marble/90 text-ink shadow-md transition-colors hover:bg-marble sm:right-4 sm:top-4"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
