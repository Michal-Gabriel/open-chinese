/* Voice Stories — the story grid, built from the same data the reader uses.
 *
 * The old landing page hand-wrote all 19 cards, and the titles had already
 * drifted from the data (it said "A Trip to Sichuan" where stories.json says
 * "Visiting Grandma in Sichuan"). Rendering from the JSON means they cannot
 * disagree again, and a new story needs no HTML edit.
 */

import { SERIES, seriesMeta, seriesOf } from './series.js?v=25';

const root = document.getElementById('story-sections');

/* `number` counts within the series, so each series starts again at one.
   The link still uses story.id, which is the stable key the data, the audio
   folders and the old story1.html…story19.html stubs are all keyed on. */
function card(story, number) {
  const a = document.createElement('a');
  a.className = 'story-card';
  a.href = './story.html?story=' + encodeURIComponent(story.id);

  const num = document.createElement('span');
  num.className = 'story-number';
  num.textContent = 'Story ' + number;
  a.appendChild(num);

  const h3 = document.createElement('h3');
  h3.textContent = story.englishTitle || story.title;
  a.appendChild(h3);

  const hanzi = document.createElement('p');
  hanzi.className = 'story-hanzi';
  hanzi.textContent = story.title;
  a.appendChild(hanzi);

  const p = document.createElement('p');
  p.textContent = story.summary || '';
  a.appendChild(p);

  const link = document.createElement('span');
  link.className = 'story-link';
  link.textContent = 'Read story';
  a.appendChild(link);
  return a;
}

function section(series, stories) {
  const meta = seriesMeta(series);
  const name = meta.title || ('Series ' + series);
  const levels = Array.from(new Set(stories.map(st => st.level)));

  const s = document.createElement('section');
  s.className = 'story-section';
  s.setAttribute('aria-label', name);

  const h2 = document.createElement('h2');
  h2.textContent = name;
  s.appendChild(h2);

  if (meta.hanzi) {
    const hz = document.createElement('p');
    hz.className = 'story-section-hanzi';
    hz.textContent = meta.hanzi;
    s.appendChild(hz);
  }

  const range = document.createElement('p');
  range.className = 'story-section-meta';
  range.textContent = 'Series · ' + stories.length + ' stories · ' + levels.join(', ');
  s.appendChild(range);

  const intro = document.createElement('p');
  intro.className = 'story-intro';
  intro.textContent = meta.blurb || (stories.length + ' stories.');
  s.appendChild(intro);

  const grid = document.createElement('div');
  grid.className = 'story-grid';
  stories.forEach((st, i) => grid.appendChild(card(st, i + 1)));
  s.appendChild(grid);
  return s;
}

async function build() {
  let stories;
  try {
    const res = await fetch('./data/stories.json?v=25');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    stories = await res.json();
  } catch (e) {
    root.textContent = '';
    const s = document.createElement('section');
    s.className = 'story-section';
    const p = document.createElement('p');
    p.className = 'loading-note';
    p.textContent = 'Could not load the story list. Please reload the page.';
    s.appendChild(p);
    root.appendChild(s);
    return;
  }

  // keep the order the data is in, but group by series
  const groups = [];
  for (const st of stories) {
    const sr = seriesOf(st);
    let g = groups.find(x => x.series === sr);
    if (!g) { g = { series: sr, items: [] }; groups.push(g); }
    g.items.push(st);
  }

  root.textContent = '';
  groups.forEach(g => root.appendChild(section(g.series, g.items)));
}

build();
