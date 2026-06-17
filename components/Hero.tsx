import { SITE } from '../lib/config';

// The hero carries the wordmark, the parti-pris in one line, and the single
// call to action: the next event's date + a DM link. No payments, no accounts.
export default function Hero() {
  const { name, date, blurb } = SITE.nextEvent;
  return (
    <header className="px-6 pt-8 pb-12 text-center sm:pt-12 sm:pb-16 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:px-10 lg:py-12">
      <h1 className="font-display text-5xl font-semibold tracking-tight text-walnut sm:text-7xl">
        {SITE.wordmark}
      </h1>
      <p className="mx-auto mt-4 max-w-prose whitespace-pre-line text-base leading-relaxed text-ink/70">
        {SITE.about.trim()}
      </p>

      <div className="mx-auto mt-10 max-w-md rounded-lg border border-steel/30 bg-marble/70 px-6 py-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-steel-deep">
          next event
        </p>
        <p className="mt-2 font-display text-xl text-ink sm:text-2xl">{name}</p>
        <p className="mt-1 text-sm font-medium text-honey">{date}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink/65">{blurb}</p>
        <a
          href={SITE.dm.href}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-full bg-walnut px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink"
        >
          {SITE.dm.label}
        </a>
      </div>
    </header>
  );
}
