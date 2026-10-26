/* Voice Stories — the story grid, built from the same data the reader uses.
 *
 * The old landing page hand-wrote all 19 cards, and the titles had already
 * drifted from the data (it said "A Trip to Sichuan" where stories.json says
 * "Visiting Grandma in Sichuan"). Rendering from the JSON means they cannot
 * disagree again, and a new story needs no HTML edit.
 */

const LEVEL_BLURB = {
  'HSK 1-2': 'Short stories built on the first few hundred words. New vocabulary arrives slowly and repeats often.',
  'HSK 2': 'Longer stories with a wider vocabulary, for once the basics feel comfortable.',
};

const root = document.getElementById('story-sections');

function card(story) {
  const a = document.createElement('a');
  a.className = 'story-card';
  a.href = './story.html?story=' + encodeURIComponent(story.id);

  const num = document.createElement('span');
  num.className = 'story-number';
  num.textContent = 'Story ' + story.id;
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

function section(level, stories) {
  const s = document.createElement('section');
  s.className = 'story-section';
  s.setAttribute('aria-label', 'Stories for ' + level);

  const h2 = document.createElement('h2');
  h2.textContent = 'Read & Listen — ' + level;
  s.appendChild(h2);

  const intro = document.createElement('p');
  intro.className = 'story-intro';
  intro.textContent = LEVEL_BLURB[level] || (stories.length + ' stories at this level.');
  s.appendChild(intro);

  const grid = document.createElement('div');
  grid.className = 'story-grid';
  stories.forEach(st => grid.appendChild(card(st)));
  s.appendChild(grid);
  return s;
}

async function build() {
  let stories;
  try {
    const res = await fetch('./data/stories.json');
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

  // keep the order the data is in, but group by level
  const levels = [];
  for (const st of stories) {
    let g = levels.find(l => l.level === st.level);
    if (!g) { g = { level: st.level, items: [] }; levels.push(g); }
    g.items.push(st);
  }

  root.textContent = '';
  levels.forEach(g => root.appendChild(section(g.level, g.items)));
}

build();
