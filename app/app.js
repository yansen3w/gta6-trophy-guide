// Leonida Trophy Guide — tracker logic.
// Loads app/data/trophies.json, renders the roadmap, the checklist and the
// filters, and keeps earned ticks in localStorage with export/import.
// No network at run time beyond loading this app's own files.
const STORE_KEY = 'gta6-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';

// Roadmap stages, built from the official descriptions and PowerPyx's
// three-step roadmap (story, 100% checklist, strangers & cleanup), with a
// preparation step and a money step added so nothing is left blind.
const ROADMAP = [
  {
    title: 'Before you start — saves & the one missable',
    time: '5 minutes',
    text: 'Turn off cheats (they disable trophies and saving). Keep a manual save at the start of every chapter — there is no mission replay. In Chapter 1, do the Lucia balcony meditation for Positive Mental Attitude before the chapter ends.',
    trophyIds: [28],
  },
  {
    title: 'Step 1 — Story, Chapters 1–4 and the finale',
    time: '60–80 hours',
    text: 'Play the story in order and let the grinds tick up as you go: stunts, vehicles, WAiNK locations, challenges. Do the partner trophies when prompted, and the side-character strands (Andy, Kenton, Billy, Randy, Tyrone) as they appear.',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 33, 34, 37],
  },
  {
    title: 'Step 2 — Activities: ranges, races, fishing, bowling',
    time: '25 hours',
    text: 'Gold all 42 Shooting Range challenges, win the 14 Top Fun drone races and 20 different races, beat Cal at fishing, finish an arcade game, and bowl at the Kolt & Associates alley. One try at each activity type also earns Master of None.',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 36, 46],
  },
  {
    title: 'Step 3 — Robberies: vaults, trucks, gangs, shops',
    time: '10 hours',
    text: 'Rob 5 bank vaults and escape, rob an armored truck, rob one illegal operation of each of the 9 gangs, and rob a jewelry store without being detected. Launder the Marked Bills as you go — it feeds Dime on the Dollar.',
    trophyIds: [38, 39, 40, 41, 43, 52],
  },
  {
    title: 'Step 4 — Collectibles & exploration',
    time: '30 hours',
    text: 'Complete 3 card sets, WAiNK It at 100 locations, discover 100 vehicles, explore all 52 areas, meditate at every spot, hunt Bret’s unique animal, and buy all 8 garages. Sweep region by region so one road trip covers several lists at once.',
    trophyIds: [25, 29, 30, 31, 35, 42, 54, 55],
  },
  {
    title: 'Step 5 — Money, choices & the 100% checklist',
    time: '40 hours',
    text: 'Spend $100,000 in shops, launder $250,000 of Marked Bills, finish 50 challenges (70 of 80 for the checklist), and close out the 100% completion checklist under Progress → Stats → 100% Completion. A Long Road pops — then the platinum.',
    trophyIds: [1, 14, 32, 48, 53],
  },
];

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

const listEl = document.getElementById('trophyList');
const stagesEl = document.getElementById('stages');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const hideEarnedEl = document.getElementById('hideEarned');
const countEl = document.getElementById('listCount');
const emptyEl = document.getElementById('emptyState');
const onlineNoteEl = document.getElementById('onlineNote');

let trophies = [];
let earned = loadEarned();

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function isSpoilerHidden(t) {
  // Spoiler mode hides the name, description and guide of hidden story
  // trophies until they are earned. Visible trophies are never hidden.
  return spoilersEl.checked && t.hidden && t.kind === 'story' && !earned.has(t.id);
}

function matchesFilters(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindEl.value === 'online') return false; // no online trophies exist
  if (kindEl.value !== 'all') {
    if (kindEl.value === 'missable') {
      if (!t.missable) return false;
    } else if (t.kind !== kindEl.value) {
      return false;
    }
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id));
  const byGrade = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  for (const t of done) byGrade[t.grade] += 1;
  document.getElementById('earnedCount').textContent = String(done.length);
  const bar = document.getElementById('progressBar');
  const fill = document.getElementById('progressFill');
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  fill.style.width = `${pct}%`;
  bar.setAttribute('aria-valuenow', String(done.length));
  document.getElementById('progressSub').textContent =
    `${byGrade.bronze} bronze · ${byGrade.silver} silver · ${byGrade.gold} gold · ` +
    (byGrade.platinum ? 'platinum earned — Leonida Legend!' : 'platinum locked');
  const next = trophies.find((t) => !earned.has(t.id));
  document.getElementById('progressNext').textContent = next
    ? `Next up: ${next.name} — ${next.description}`
    : 'Every trophy earned. Vice Got a Price!';
}

function renderRoadmap() {
  stagesEl.replaceChildren();
  for (const stage of ROADMAP) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const time = document.createElement('p');
    time.className = 'time';
    time.textContent = stage.time;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophyIds) {
      const t = trophyById(id);
      if (!t) continue;
      const chip = document.createElement('span');
      chip.textContent = (earned.has(id) ? '✓ ' : '') + t.name;
      if (earned.has(id)) chip.className = 'done';
      chips.append(chip);
    }
    li.append(h, time, text, chips);
    stagesEl.append(li);
  }
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'trophy-check';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned();
      renderProgress();
      renderRoadmap();
      renderList();
    });
    const body = document.createElement('div');
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    if (isSpoilerHidden(t)) {
      name.textContent = 'Hidden story trophy';
    } else {
      name.textContent = t.name;
    }
    const grade = document.createElement('span');
    grade.className = `grade-badge grade-${t.grade}`;
    grade.textContent = t.grade;
    name.append(grade);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag missable';
      flag.textContent = 'MISSABLE';
      name.append(flag);
    }
    if (t.hidden) {
      const flag = document.createElement('span');
      flag.className = 'flag hidden';
      flag.textContent = 'HIDDEN ON PS5';
      name.append(flag);
    }
    body.append(name);
    if (isSpoilerHidden(t)) {
      const p = document.createElement('p');
      p.className = 'spoiler-hidden';
      p.textContent = 'Story trophy — its name, description and guide stay hidden until you earn it. Turn off “Hide story spoilers” to reveal it.';
      body.append(p);
    } else {
      const desc = document.createElement('p');
      desc.className = 'trophy-desc';
      desc.textContent = `“${t.description}”`;
      const guide = document.createElement('p');
      guide.className = 'trophy-guide';
      guide.textContent = t.guide;
      body.append(desc, guide);
      const meta = document.createElement('p');
      meta.className = 'trophy-meta';
      const kind = document.createElement('span');
      kind.className = 'kind-tag';
      kind.textContent = KIND_LABELS[t.kind] ?? t.kind;
      meta.append(kind);
      meta.append(document.createTextNode(t.count ? `Target: ${t.count.toLocaleString('en-US')}` : 'No count tracked'));
      body.append(meta);
      const srcs = document.createElement('p');
      srcs.className = 'trophy-sources';
      srcs.append(document.createTextNode('Sources: '));
      for (const s of t.sources ?? []) {
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.target = '_blank';
        a.rel = 'noopener';
        srcs.append(a);
      }
      body.append(srcs);
    }
    li.append(box, body);
    listEl.append(li);
  }
  emptyEl.hidden = shown.length !== 0;
  onlineNoteEl.hidden = kindEl.value !== 'online';
  countEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
}

// URL hash presets, so a link can open a filtered view:
// #kind=missable, #grade=silver, #spoilers=on, #roadmap (scrolls to it).
function applyHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.get('kind')) kindEl.value = params.get('kind');
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('spoilers') === 'on') spoilersEl.checked = true;
  if (params.get('hideEarned') === 'on') hideEarnedEl.checked = true;
  if (params.get('q')) searchEl.value = params.get('q');
  if (params.has('roadmap')) {
    document.getElementById('roadmap').scrollIntoView();
  }
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no list');
    const valid = new Set(trophies.map((t) => t.id));
    const next = new Set(ids.filter((n) => valid.has(n)));
    earned = next;
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importProgress(file);
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned ticks?')) {
    earned = new Set();
    saveEarned();
    renderAll();
  }
});
for (const el of [searchEl, kindEl, gradeEl, spoilersEl, hideEarnedEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}

const doc = await (await fetch(DATA_URL)).json();
trophies = doc.trophies;
applyHash();
renderAll();
