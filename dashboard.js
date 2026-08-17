const gate = document.querySelector('#dashboard-gate');
const content = document.querySelector('#dashboard-content');
const refresh = document.querySelector('#dashboard-refresh');

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = String(value ?? '—');
}

function makeNode(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function renderBars(days) {
  const mount = document.querySelector('#dashboard-bars');
  if (!mount) return;
  mount.replaceChildren();
  const maximum = Math.max(1, ...days.map(day => Number(day.questions || 0)));
  days.forEach(day => {
    const item = document.createElement('div');
    item.className = 'dashboard-bar';
    const progress = document.createElement('progress');
    progress.max = maximum;
    progress.value = Number(day.questions || 0);
    progress.setAttribute('aria-label', `${day.day}: ${day.questions} questions`);
    item.append(
      makeNode('small', day.day?.slice(5) || '—'),
      progress,
      makeNode('strong', Number(day.questions || 0))
    );
    mount.append(item);
  });
  if (!days.length) mount.append(makeNode('p', 'No activity in this range.'));
}

function renderRegions(regions) {
  const mount = document.querySelector('#dashboard-regions');
  if (!mount) return;
  mount.replaceChildren();
  regions.forEach(region => {
    const item = document.createElement('li');
    item.append(makeNode('span', region.country || 'Unknown'), makeNode('strong', region.questions || 0));
    mount.append(item);
  });
  if (!regions.length) mount.append(makeNode('li', 'No regional activity in this range.'));
}

function renderRecent(rows) {
  const mount = document.querySelector('#dashboard-rows');
  if (!mount) return;
  mount.replaceChildren();
  rows.forEach(row => {
    const tr = document.createElement('tr');
    const location = [row.city, row.region, row.country].filter(Boolean).join(', ') || 'Unknown';
    const values = [row.created_at, row.question, location, row.flag, row.response_ms == null ? '—' : `${row.response_ms} ms`];
    values.forEach((value, index) => {
      const cell = makeNode('td', value || '—');
      if (index === 3 && row.flag && row.flag !== 'none') cell.className = 'dashboard-flag';
      tr.append(cell);
    });
    mount.append(tr);
  });
  if (!rows.length) {
    const tr = document.createElement('tr');
    const cell = makeNode('td', 'No conversations logged yet.');
    cell.colSpan = 5;
    tr.append(cell);
    mount.append(tr);
  }
}

function showError(code) {
  if (!gate) return;
  gate.replaceChildren();
  gate.className = 'dashboard-gate dashboard-gate-error';
  const title = code === 'ADMIN_AUTH_NOT_CONFIGURED' ? 'Private access setup is not complete.' : 'Cloudflare Access sign-in is required.';
  gate.append(makeNode('h2', title), makeNode('p', code === 'ADMIN_AUTH_NOT_CONFIGURED'
    ? 'The dashboard is fail-closed. Add the Access team domain and application audience before analytics can be viewed.'
    : 'Only Yahya’s approved email can open this data. Sign in through the protected dashboard route and try again.'));
}

async function loadDashboard() {
  refresh.disabled = true;
  try {
    const response = await fetch('/api/admin/analytics', { headers: { accept: 'application/json' }, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'ANALYTICS_UNAVAILABLE');
    setText('#dashboard-viewer', data.viewer);
    setText('#dashboard-range', data.range);
    setText('#metric-questions', data.summary?.questions || 0);
    setText('#metric-visitors', data.summary?.visitors || 0);
    setText('#metric-response', `${data.summary?.average_response_ms || 0} ms`);
    setText('#metric-flags', Number(data.summary?.salary_flags || 0) + Number(data.summary?.privacy_blocks || 0));
    setText('#dashboard-generated', `Updated ${new Date(data.generatedAt).toLocaleString()}`);
    renderBars(Array.isArray(data.daily) ? data.daily : []);
    renderRegions(Array.isArray(data.regions) ? data.regions : []);
    renderRecent(Array.isArray(data.recent) ? data.recent : []);
    gate.hidden = true;
    content.hidden = false;
  } catch (error) {
    content.hidden = true;
    showError(error.message);
  } finally {
    refresh.disabled = false;
  }
}

refresh?.addEventListener('click', loadDashboard);
loadDashboard();
