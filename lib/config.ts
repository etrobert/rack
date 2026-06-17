// Site-level copy and pointers. Edited in git (unlike piece data, which lives
// on tower and is fetched at runtime). These are the bits the hero carries.

export const SITE = {
  wordmark: 'The Rack',
  tagline: 'A curated secondhand rail, browsed online — pulled in person.',

  // The next event. Date locked by 26 June (18 vs 19 July 2026); placeholder
  // until then — update this line and rebuild.
  nextEvent: {
    name: 'The Rack — Birthday / CSD Edition',
    // Human-readable; intentionally not a parsed Date — one source of truth.
    date: 'Saturday 18 July 2026',
    blurb:
      'An afternoon of trying things on, styling, and champagne — at the flat.',
  },

  // The single call to action: come see it in person. DM to get on the list.
  dm: {
    label: 'DM to come by',
    href: 'https://instagram.com/etiennerobert',
  },
} as const;
