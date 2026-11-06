/* The library holds two separate series: the first ends at story 9 and the
   second begins at story 10, with different people and no link between them.
   Inside a series the stories run in order; across series they do not, which
   is why these are series rather than chapters of one book — and why they are
   not numbered.

   Which series a story belongs to is in stories.json, as a `series` field.
   The titles live here because they belong to the series rather than to any
   one story, and both the grid and the reader need them. */

export const SERIES = {
  1: {
    title: 'Visiting Grandma',
    hanzi: '去四川看奶奶',
    blurb: 'A family trip to Sichuan, from the morning the bus leaves to the goodbye at the end.',
  },
  2: {
    title: 'The Photograph',
    hanzi: '旧书里的照片',
    blurb: 'A photograph falls out of a second-hand book in Beijing, and Mr Chen sets out to find the family in it.',
  },
};

export function seriesOf(story) {
  return (story && story.series) || 1;
}

export function seriesMeta(n) {
  return SERIES[n] || { title: 'Series ' + n };
}
