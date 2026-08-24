const gate = document.querySelector('#dashboard-gate');
const content = document.querySelector('#dashboard-content');
const refresh = document.querySelector('#dashboard-refresh');
const tabs = [...document.querySelectorAll('[role="tab"][aria-controls]')];
const sessionDialog = document.querySelector('#ai-session-dialog');
const sessionDialogClose = document.querySelector('.dashboard-dialog-close');
const isGitHubPagesAdmin = location.hostname === 'yahyaelsawii.github.io';
let refreshResetTimer;

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

function activateTab(nextTab, moveFocus = false) {
  tabs.forEach(tab => {
    const active = tab === nextTab;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = document.querySelector(`#${tab.getAttribute('aria-controls')}`);
    if (panel) panel.hidden = !active;
  });
  if (moveFocus) nextTab.focus();
}

function initializeTabs() {
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });
}

function renderBars(selector, days, valueKey, unit) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  mount.replaceChildren();
  const maximum = Math.max(1, ...days.map(day => Number(day[valueKey] || 0)));
  days.forEach(day => {
    const value = Number(day[valueKey] || 0);
    const item = document.createElement('div');
    item.className = 'dashboard-bar';
    const progress = document.createElement('progress');
    progress.max = maximum;
    progress.value = value;
    progress.setAttribute('aria-label', `${day.day}: ${value} ${unit}`);
    item.append(makeNode('small', day.day?.slice(5) || '—'), progress, makeNode('strong', value));
    mount.append(item);
  });
  if (!days.length) mount.append(makeNode('p', 'No activity in this range.', 'dashboard-empty'));
}

function renderRankedList(selector, rows, labelKey, valueKey, emptyText) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  mount.replaceChildren();
  rows.forEach(row => {
    const item = document.createElement('li');
    item.append(makeNode('span', row[labelKey] || 'Unknown'), makeNode('strong', Number(row[valueKey] || 0)));
    mount.append(item);
  });
  if (!rows.length) mount.append(makeNode('li', emptyText, 'dashboard-empty'));
}

function displayTime(value) {
  if (!value) return '—';
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function locationLabel(row) {
  return [row.city, row.region, row.country].filter(Boolean).join(', ') || 'Unknown';
}

function renderWebsiteRecent(rows) {
  const mount = document.querySelector('#site-dashboard-rows');
  if (!mount) return;
  mount.replaceChildren();
  rows.forEach(row => {
    const tr = document.createElement('tr');
    const values = [
      displayTime(row.created_at),
      row.session ? `#${row.session}` : '—',
      row.page,
      locationLabel(row),
      row.device,
      row.browser,
      row.referrer
    ];
    values.forEach(value => tr.append(makeNode('td', value || '—')));
    mount.append(tr);
  });
  if (!rows.length) {
    const tr = document.createElement('tr');
    const cell = makeNode('td', 'No website visits logged yet.', 'dashboard-empty');
    cell.colSpan = 7;
    tr.append(cell);
    mount.append(tr);
  }
}

function renderAiRecent(rows) {
  const mount = document.querySelector('#ai-dashboard-rows');
  if (!mount) return;
  mount.replaceChildren();
  rows.forEach(row => {
    const tr = document.createElement('tr');
    const values = [displayTime(row.created_at), row.question, locationLabel(row), row.flag, row.response_ms == null ? '—' : `${row.response_ms} ms`];
    values.forEach((value, index) => {
      const cell = makeNode('td', value || '—');
      if (index === 3 && row.flag && row.flag !== 'none') cell.className = 'dashboard-flag';
      tr.append(cell);
    });
    mount.append(tr);
  });
  if (!rows.length) {
    const tr = document.createElement('tr');
    const cell = makeNode('td', 'No conversations logged yet.', 'dashboard-empty');
    cell.colSpan = 5;
    tr.append(cell);
    mount.append(tr);
  }
}

function scoreClass(band) {
  return ['light', 'developing', 'strong'].includes(band) ? `is-${band}` : 'is-light';
}

function renderAiSessions(rows) {
  const mount = document.querySelector('#ai-session-rows');
  if (!mount) return;
  mount.replaceChildren();
  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.append(makeNode('td', displayTime(row.lastActiveAt)));
    const discussion = makeNode('td', row.summary || 'General portfolio questions');
    discussion.className = 'dashboard-session-topic';
    tr.append(discussion);
    const scoreCell = document.createElement('td');
    const score = makeNode('span', `${Number(row.score || 1)}/10`, `dashboard-score ${scoreClass(row.band)}`);
    score.setAttribute('aria-label', `Engagement score ${Number(row.score || 1)} out of 10`);
    scoreCell.append(score);
    tr.append(scoreCell, makeNode('td', Number(row.questionCount || 0)), makeNode('td', locationLabel(row.location || {})));
    const actionCell = document.createElement('td');
    const open = makeNode('button', 'View', 'btn btn-secondary dashboard-session-open');
    open.type = 'button';
    open.dataset.session = row.id;
    open.setAttribute('aria-label', `Open session ${row.id}`);
    actionCell.append(open);
    tr.append(actionCell);
    mount.append(tr);
  });
  if (!rows.length) {
    const tr = document.createElement('tr');
    const cell = makeNode('td', 'No conversation sessions logged yet.', 'dashboard-empty');
    cell.colSpan = 6;
    tr.append(cell);
    mount.append(tr);
  }
}

function renderSessionDetail(data) {
  const insight = data.insight || {};
  const score = document.querySelector('#ai-session-score');
  if (score) {
    score.textContent = `${Number(insight.score || 1)}/10`;
    score.className = `dashboard-score dashboard-score-large ${scoreClass(insight.band)}`;
  }
  setText('#ai-session-dialog-title', `Session #${data.id || '—'}`);
  setText('#ai-session-summary', insight.summary || 'General portfolio questions');
  setText('#ai-session-reason', insight.reason || 'No scoring explanation is available.');
  const meta = document.querySelector('#ai-session-meta');
  if (meta) {
    meta.replaceChildren();
    [
      `Started ${displayTime(insight.startedAt)}`,
      `Last active ${displayTime(insight.lastActiveAt)}`,
      `${Number(insight.questionCount || 0)} message${Number(insight.questionCount || 0) === 1 ? '' : 's'}`,
      locationLabel(insight.location || {})
    ].forEach(value => meta.append(makeNode('span', value)));
  }
  const transcript = document.querySelector('#ai-session-transcript');
  if (transcript) {
    transcript.replaceChildren();
    (Array.isArray(data.messages) ? data.messages : []).forEach(message => {
      const entry = document.createElement('article');
      entry.className = 'dashboard-transcript-entry';
      const head = document.createElement('div');
      head.append(makeNode('strong', displayTime(message.created_at)), makeNode('span', message.response_ms == null ? '—' : `${message.response_ms} ms`));
      const question = document.createElement('div');
      question.className = 'dashboard-transcript-message is-user';
      question.append(makeNode('small', 'Visitor'), makeNode('p', message.question || '—'));
      const answer = document.createElement('div');
      answer.className = 'dashboard-transcript-message is-assistant';
      answer.append(makeNode('small', "Yahya'AI"), makeNode('p', message.answer || '—'));
      entry.append(head, question, answer);
      transcript.append(entry);
    });
  }
}

async function openSession(sessionId) {
  if (!sessionDialog || !/^[a-f0-9]{16}$/.test(sessionId || '')) return;
  const loading = document.querySelector('#ai-session-loading');
  const detail = document.querySelector('#ai-session-content');
  setText('#ai-session-dialog-title', `Session #${sessionId}`);
  if (loading) {
    loading.hidden = false;
    loading.textContent = 'Loading this session…';
  }
  if (detail) detail.hidden = true;
  sessionDialog.showModal();
  try {
    const response = await fetch(`/admin/api/session?session=${encodeURIComponent(sessionId)}`, {
      headers: { accept: 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'SESSION_UNAVAILABLE');
    renderSessionDetail(data);
    if (loading) loading.hidden = true;
    if (detail) detail.hidden = false;
  } catch (_error) {
    if (loading) loading.textContent = 'This session could not be loaded. Close the window and try again.';
  }
}

function showError(code) {
  if (!gate) return;
  gate.replaceChildren();
  gate.className = 'dashboard-gate dashboard-gate-error';
  const errors = {
    ADMIN_AUTH_NOT_CONFIGURED: [
      'Private access setup is not complete.',
      'The dashboard is fail-closed. Add the Access team domain and application audience before analytics can be viewed.'
    ],
    ACCESS_LOGIN_REQUIRED: [
      'Cloudflare Access sign-in is required.',
      'Only Yahya’s approved email can open this data. Sign in through the protected dashboard route and try again.'
    ],
    INVALID_ACCESS_TOKEN: [
      'Your private session could not be verified.',
      'Request a fresh email code and sign in again.'
    ],
    ADMIN_EMAIL_NOT_APPROVED: [
      'This email is not approved.',
      'Use the owner email configured for this dashboard.'
    ]
  };
  const [title, message] = errors[code] || [
    'Analytics could not be loaded.',
    'The private service is temporarily unavailable. Refresh the page and try again.'
  ];
  gate.append(makeNode('h2', title), makeNode('p', message));
}

function renderWebsite(data) {
  const summary = data.summary || {};
  setText('#site-metric-pageviews', summary.pageviews || 0);
  setText('#site-metric-visitors', summary.visitors || 0);
  setText('#site-metric-sessions', summary.sessions || 0);
  setText('#site-metric-pages', summary.pages || 0);
  renderBars('#site-dashboard-bars', Array.isArray(data.daily) ? data.daily : [], 'pageviews', 'page views');
  renderRankedList('#site-dashboard-regions', Array.isArray(data.regions) ? data.regions : [], 'country', 'pageviews', 'No regional activity in this range.');
  renderRankedList('#site-dashboard-pages', Array.isArray(data.pages) ? data.pages : [], 'page', 'pageviews', 'No page activity in this range.');
  renderRankedList('#site-dashboard-referrers', Array.isArray(data.referrers) ? data.referrers : [], 'label', 'pageviews', 'No referrer activity in this range.');
  renderRankedList('#site-dashboard-devices', Array.isArray(data.devices) ? data.devices : [], 'label', 'pageviews', 'No device data in this range.');
  renderRankedList('#site-dashboard-browsers', Array.isArray(data.browsers) ? data.browsers : [], 'label', 'pageviews', 'No browser data in this range.');
  renderWebsiteRecent(Array.isArray(data.recent) ? data.recent : []);
}

function renderAi(data) {
  const summary = data.summary || {};
  setText('#ai-metric-questions', summary.questions || 0);
  setText('#ai-metric-visitors', summary.visitors || 0);
  setText('#ai-metric-response', `${summary.average_response_ms || 0} ms`);
  setText('#ai-metric-flags', Number(summary.salary_flags || 0) + Number(summary.privacy_blocks || 0));
  renderBars('#ai-dashboard-bars', Array.isArray(data.daily) ? data.daily : [], 'questions', 'questions');
  renderRankedList('#ai-dashboard-regions', Array.isArray(data.regions) ? data.regions : [], 'country', 'questions', 'No regional activity in this range.');
  renderAiSessions(Array.isArray(data.sessions) ? data.sessions : []);
  renderAiRecent(Array.isArray(data.recent) ? data.recent : []);
}

async function loadDashboard() {
  const isRefresh = Boolean(content && !content.hidden);
  clearTimeout(refreshResetTimer);
  if (refresh) {
    refresh.disabled = true;
    refresh.setAttribute('aria-busy', 'true');
    refresh.textContent = isRefresh ? 'Refreshing…' : 'Loading…';
  }
  try {
    const response = await fetch('/admin/api/analytics', {
      headers: { accept: 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'ANALYTICS_UNAVAILABLE');
    setText('#dashboard-viewer', data.viewer);
    setText('#dashboard-generated', `Updated ${new Date(data.generatedAt).toLocaleString()}`);
    renderWebsite(data.website || {});
    renderAi(data.ai || {});
    gate.hidden = true;
    content.hidden = false;
    if (refresh && isRefresh) refresh.textContent = 'Refreshed';
  } catch (error) {
    content.hidden = true;
    showError(error.message);
  } finally {
    if (refresh) {
      refresh.disabled = false;
      refresh.removeAttribute('aria-busy');
      if (!isRefresh) refresh.textContent = 'Refresh';
      else refreshResetTimer = setTimeout(() => { refresh.textContent = 'Refresh'; }, 1200);
    }
  }
}

initializeTabs();
document.querySelector('#ai-session-rows')?.addEventListener('click', event => {
  const button = event.target.closest('.dashboard-session-open');
  if (button) openSession(button.dataset.session);
});
sessionDialogClose?.addEventListener('click', () => sessionDialog?.close());
sessionDialog?.addEventListener('click', event => {
  if (event.target === sessionDialog) sessionDialog.close();
});
if (!isGitHubPagesAdmin) {
  refresh?.addEventListener('click', loadDashboard);
  loadDashboard();
}
