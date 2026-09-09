const ORG = 'LittlCloud';
const API = `https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=updated`;
const AVATAR = `https://avatars.githubusercontent.com/u/326731209?s=200&v=4`;

const langColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dockerfile: '#384d54',
  Shell: '#89e051',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
};

let allRepos = [];

async function fetchRepos() {
  const grid = document.getElementById('grid');
  grid.innerHTML = `<div class="status-msg"><div class="loader"></div>Fetching repositories&hellip;</div>`;

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    allRepos = await res.json();
    renderStats(allRepos);
    renderGrid(allRepos);
  } catch (err) {
    grid.innerHTML = `<div class="status-msg">⚠ Could not load repositories from GitHub.<br><small>${err.message}</small></div>`;
  }
}

function renderStats(repos) {
  document.getElementById('stat-repos').textContent = repos.length;
  const langs = new Set(repos.map(r => r.language).filter(Boolean));
  document.getElementById('stat-langs').textContent = langs.size;
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  document.getElementById('stat-stars').textContent = stars;
}

function renderGrid(repos) {
  const grid = document.getElementById('grid');
  if (!repos.length) {
    grid.innerHTML = `<div class="status-msg">No repositories found.</div>`;
    return;
  }
  grid.innerHTML = repos.map(r => repoCard(r)).join('');
}

function repoCard(r) {
  const color = langColors[r.language] || '#aaaaaa';
  const desc = r.description
    ? `<p class="repo-desc">${escapeHtml(r.description)}</p>`
    : `<p class="repo-desc empty">No description</p>`;
  const lang = r.language
    ? `<span class="meta-pill"><span class="lang-dot" style="background:${color}"></span>${escapeHtml(r.language)}</span>`
    : '';
  const stars = r.stargazers_count > 0
    ? `<span class="meta-pill">★ ${r.stargazers_count}</span>`
    : '';
  const forks = r.forks_count > 0
    ? `<span class="meta-pill">⑂ ${r.forks_count}</span>`
    : '';
  const fork = r.fork ? `<span class="fork-badge">fork</span>` : '';

  return `<a class="repo-card" href="${r.html_url}" target="_blank" rel="noopener">
    <div class="repo-name">${escapeHtml(r.name)}</div>
    ${desc}
    <div class="repo-meta">${lang}${stars}${forks}${fork}</div>
  </a>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function filterAndSort() {
  const q = document.getElementById('search').value.toLowerCase();
  const sort = document.getElementById('sort').value;

  let repos = allRepos.filter(r =>
    r.name.toLowerCase().includes(q) ||
    (r.description || '').toLowerCase().includes(q) ||
    (r.language || '').toLowerCase().includes(q)
  );

  if (sort === 'stars') repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  else if (sort === 'name') repos.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'updated') repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  else if (sort === 'forks') repos.sort((a, b) => b.forks_count - a.forks_count);

  renderGrid(repos);
}

document.getElementById('search').addEventListener('input', filterAndSort);
document.getElementById('sort').addEventListener('change', filterAndSort);

document.getElementById('org-avatar').src = AVATAR;
document.getElementById('org-link').href = `https://github.com/${ORG}`;

fetchRepos();
