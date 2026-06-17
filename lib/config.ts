// Site-level copy and pointers. Edited in git (unlike piece data, which lives
// on tower and is fetched at runtime). These are the bits the hero carries.

export const SITE = {
  wordmark: 'The Rack',
  about: `
I love having my friends over to try on clothes.
Clothes that I made, found or transformed.
When they come home with them it's even better.
I've decided to host an event to do just that.
`,

  // The next event. Date locked by 26 June (18 vs 19 July 2026); placeholder
  // until then — update this line and rebuild.
  nextEvent: {
    name: 'Birthday / CSD Edition',
    // Human-readable; intentionally not a parsed Date — one source of truth.
    date: 'Saturday 18 July 2026',
    blurb:
      'An afternoon of trying things on, styling, and champagne — at the flat.',
  },

  // The single call to action: come see it in person. DM to get on the list.
  dm: {
    label: 'DM me',
    href: 'https://instagram.com/thesoft.emperor',
  },
} as const;
