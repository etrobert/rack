import { useState } from 'react';
import type { Piece } from '../lib/pieces';
import PieceCard from './PieceCard';
import Lightbox from './Lightbox';

// The rail itself: a responsive photo grid you scroll to browse — one column on
// mobile, reflowing into a masonry of columns on wider screens (CSS columns, so
// the in-situ photos keep their natural aspect ratios). It fills whatever column
// it's placed in (full width on mobile, the right column on desktop). One
// interaction: tap a piece to open its detail.
export default function Rail({ pieces }: { pieces: Piece[] }) {
  const [open, setOpen] = useState<Piece | null>(null);

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 [&>*]:mb-5">
        {pieces.map((piece) => (
          <PieceCard
            key={piece.slug}
            piece={piece}
            onOpen={() => setOpen(piece)}
          />
        ))}
      </div>

      {open && <Lightbox piece={open} onClose={() => setOpen(null)} />}
    </>
  );
}
