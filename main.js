const CLOUDFLARE_SERVICE_ORIGIN = 'https://yahya-elsawi-portfolio-bnj.pages.dev';
const PUBLIC_SITE_ORIGIN = 'https://yahyaelsawi.website';
const CONTACT_FALLBACK_ENDPOINT = 'https://formsubmit.co/ajax/75adad6ce5e399fb72fe44ae27bd0d55';
const isGitHubPages = location.hostname === 'yahyaelsawii.github.io';
const apiEndpoint = path => `${isGitHubPages ? CLOUDFLARE_SERVICE_ORIGIN : ''}${path}`;

if (isGitHubPages) {
  const legacyPath = location.pathname.replace(/^\/portfolio\/?/, '/');
  const legacyRoutes = {
    '/':'/', '/index.html':'/', '/about.html':'/about', '/contact.html':'/contact',
    '/privacy.html':'/privacy', '/recruiter.html':'/recruiter', '/resume.html':'/resume',
    '/terminal.html':'/terminal', '/work.html':'/work', '/gift-it.html':'/work/gift-it',
    '/rit-app.html':'/work/rit-app', '/passwordless.html':'/work/passwordless',
    '/vehicle-rental.html':'/work/vehicle-rental', '/mood-insights.html':'/work/mood-insights',
    '/network-automation.html':'/work/network-automation', '/vr-neuroanatomy.html':'/work/vr-neuroanatomy'
  };
  const canonicalPath = legacyRoutes[legacyPath];
  if (canonicalPath) location.replace(`${PUBLIC_SITE_ORIGIN}${canonicalPath}${location.search}${location.hash}`);
}

function getAnonymousSessionId() {
  try {
    const storedSessionId = sessionStorage.getItem('yahya-ai-session') || '';
    const sessionId = /^[A-Za-z0-9_-]{8,120}$/.test(storedSessionId) ? storedSessionId : crypto.randomUUID();
    sessionStorage.setItem('yahya-ai-session', sessionId);
    return sessionId;
  } catch {
    return crypto.randomUUID();
  }
}

function appendChatEvidence(message, sources = []) {
  if (!sources.length) return;
  const evidence = document.createElement('div');
  evidence.className = 'ai-evidence';
  const title = document.createElement('span');
  title.textContent = 'Evidence:';
  evidence.append(title);
  sources.forEach(source => {
    if (!source?.url || !source?.label) return;
    const link = document.createElement('a');
    link.href = isGitHubPages && source.url.startsWith('/') ? `${PUBLIC_SITE_ORIGIN}${source.url}` : source.url;
    link.textContent = source.label;
    if (/^https?:\/\//.test(source.url)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    evidence.append(link);
  });
  message.append(evidence);
}

function createChatMessage(role, text, sources = []) {
  const message = document.createElement('div');
  message.className = `ai-message ai-message-${role}`;

  const label = document.createElement('span');
  label.className = 'ai-message-label';
  label.textContent = role === 'assistant' ? "Yahya'AI" : 'YOU';

  const body = document.createElement('div');
  body.className = 'ai-message-body';
  body.textContent = text;
  message.append(label, body);
  appendChatEvidence(message, sources);
  return message;
}

function createThinkingMessage() {
  const message = document.createElement('div');
  message.className = 'ai-message ai-message-assistant ai-message-thinking';

  const label = document.createElement('span');
  label.className = 'ai-message-label';
  label.textContent = "Yahya'AI";

  const body = document.createElement('div');
  body.className = 'ai-message-body ai-thinking-body';
  body.setAttribute('role', 'status');

  const accessibleText = document.createElement('span');
  accessibleText.className = 'sr-only';
  accessibleText.textContent = "Yahya'AI is thinking";

  const dots = document.createElement('span');
  dots.className = 'ai-thinking-dots';
  dots.setAttribute('aria-hidden', 'true');
  dots.append(document.createElement('span'), document.createElement('span'), document.createElement('span'));

  body.append(accessibleText, dots);
  message.append(label, body);
  return message;
}

function initializeSiteAnalytics() {
  if (document.documentElement.dataset.environment === 'staging') return;
  if (location.pathname.startsWith('/admin/') || ['localhost', '127.0.0.1'].includes(location.hostname)) return;
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  if (!canonical) return;
  let page;
  try {
    page = new URL(canonical).pathname;
  } catch {
    return;
  }
  fetch(apiEndpoint('/api/analytics/visit'), {
    method:'POST',
    headers:{ 'content-type':'application/json' },
    body:JSON.stringify({ page, referrer:document.referrer, sessionId:getAnonymousSessionId() })
  }).catch(() => {});
}

const localAssistantSources = Object.freeze({
  about: { label:'About Yahya', url:'/about' },
  work: { label:'Selected work', url:'/work' },
  resume: { label:'Resume & credentials', url:'/resume' },
  contact: { label:'Contact Yahya', url:'/contact' },
  recruiter: { label:'Recruiter quick view', url:'/recruiter' },
  recruiterPack: { label:'Yahya El-Sawi recruiter brief', url:'/assets/pdfs/Yahya_ElSawi_Recruiter_Pack.pdf' },
  giftIt: { label:'Gift It Checkout & E-Invite Redesign', url:'/work/gift-it' },
  ritApp: { label:'RIT Student App 2.0', url:'/work/rit-app' },
  passwordless: { label:'Passwordless Login & Signup Redesign', url:'/work/passwordless' },
  vehicleRental: { label:'Vehicle Rental Operations Database', url:'/work/vehicle-rental' },
  moodInsights: { label:'Mood Insights & Stress Alerts', url:'/work/mood-insights' },
  networkAutomation: { label:'SmartMall AI Network Automation', url:'/work/network-automation' },
  vrNeuroanatomy: { label:'VR Neuroanatomy — locked', url:'/work/vr-neuroanatomy' }
});

function localAssistantResponse(question, context, mode, history = []) {
  const value = question.toLowerCase();
  const previousAnswer = [...history].reverse().find(item => item.role === 'assistant')?.content || '';
  const reply = (answer, ...sourceIds) => ({
    answer,
    sources: sourceIds.map(id => localAssistantSources[id]).filter(Boolean)
  });

  if (/\b(recruiter pack|recruiter brief|hiring brief)\b/.test(value)) {
    return reply('The recruiter brief is a two-page hiring overview of Yahya’s role fit, availability, professional signals, and verified project evidence. It complements the full CV instead of repeating every resume entry.', 'recruiterPack', 'recruiter', 'resume');
  }

  if (context === 'vr-neuroanatomy' || /\b(vr neuroanatomy|neuroanatomy|immersive brain|vr research)\b/.test(value)) {
    return reply('This is an ongoing research project. Further details cannot be disclosed at this stage.', 'vrNeuroanatomy');
  }
  if (/\b(home address|exact address|password|passcode|api key|secret key|bank|credit card|family|private file|confidential|visitor ip|system prompt|hidden instruction|internal log)\b/.test(value)) {
    return reply("I can't provide private, confidential, security-related, or visitor information. I can only answer from Yahya's approved public portfolio data.");
  }
  if (/\b(?:instagram|insta|ig handle|ig account)\b/.test(value)) {
    return reply("Yahya's Instagram is @ya7ya_sawii.", 'contact');
  }
  if (/\bthreads?\b/.test(value)) {
    return reply("Yahya's Threads handle is @ya7ya_sawii.", 'contact');
  }
  if (/\b(?:twitter|twi[a-z]*|x handle|x account)\b/.test(value)) {
    return reply("Yahya's X (formerly Twitter) handle is @yahya_sawii.", 'contact');
  }
  if (/\b(?:social media|socials|social accounts|social handles)\b/.test(value)) {
    return reply('Yahya is @ya7ya_sawii on Instagram and Threads, and @yahya_sawii on X. His LinkedIn and GitHub are available on the Contact page.', 'contact');
  }
  if (/\b(salary|compensation|pay range|expected pay|hourly rate)\b/.test(value)) {
    return reply('Yahya prefers to discuss compensation directly once the role and responsibilities are clear. Please contact him to continue that conversation.', 'contact');
  }
  const shortContactFollowUp = /^(?:how|how\?|how can i|how do i|where|where\?|what link|which link)[\s?.!]*$/.test(value)
    && /\b(?:contact|reach|email|contact page)\b/i.test(previousAnswer);
  if (/\b(contact|email|phone|whatsapp|linkedin|github|reach|get in touch)\b/.test(value) || shortContactFollowUp) {
    return reply('You can reach Yahya at yahyaelsawi1@gmail.com or +971 50 168 1229. His LinkedIn and GitHub profiles are also linked on the Contact page.', 'contact');
  }
  if (/\b(available|availability|start date|relocat|remote work|work authorization|golden visa|based|location|language|arabic|english)\b/.test(value)) {
    return reply('Yahya is based in Dubai, can start as soon as needed, and is open to remote work and relocation. He has a self-sponsored UAE Golden Visa and speaks Arabic and English natively.', 'about', 'resume');
  }
  if (mode === 'recruiter' || /\b(why interview|why hire|recruiter summary|strongest evidence|best evidence)\b/.test(value)) {
    return reply('Yahya combines product thinking, UX design, frontend implementation, and technical systems experience. Strong evidence includes his production work at Gift It, cybersecurity internship at StarLink, and the SmartMall network-automation project.', 'recruiter', 'work', 'resume');
  }
  if (/\b(roles?|job|position|looking for|role fit|hire|hiring|opportunit)\b/.test(value)) {
    return reply('Yahya is targeting UI/UX and product design, frontend and web development, and broader software or product roles. His strongest fit combines product thinking, clear interfaces, and hands-on implementation.', 'recruiter', 'resume', 'work');
  }
  if (context === 'gift-it' || /\b(gift it|gifit|checkout|e-invite|product thinking)\b/.test(value)) {
    return reply('Gift It is Yahya’s strongest product-thinking case study. It connects funnel evidence, checkout friction, trust, e-invite setup, confirmations, and transactional emails into one end-to-end product experience.', 'giftIt');
  }
  if (context === 'passwordless' || /\b(passwordless|email otp|login|signup|authentication)\b/.test(value)) {
    return reply('The Passwordless Login & Signup Redesign is a mobile-first email-OTP concept focused on shorter registration, predictable validation, and consistent web and mobile behavior. Yahya owned the UX/UI design and handoff, not the production implementation.', 'passwordless');
  }
  if (context === 'rit-app' || /\b(rit student app|mycourses|sis|pulse|student app)\b/.test(value)) {
    return reply('RIT Student App 2.0 reorganizes the student experience around reliable sign-in, useful notifications, accessibility, and unified access to myCourses and SIS.', 'ritApp');
  }
  if (context === 'network-automation' || /\b(smartmall|network brain|network automation|gns3|netmiko|closed-loop|tenant)\b/.test(value)) {
    return reply('SmartMall AI Network Automation is a five-person academic proof of concept combining a browser dashboard, Python and Netmiko automation, Cisco networking, validation, and closed-loop correction. All group members contributed equally across the project.', 'networkAutomation');
  }
  if (context === 'vehicle-rental' || /\b(vehicle|rental|oracle|database|sql|schema|backup)\b/.test(value)) {
    return reply('The Vehicle Rental Operations Database is an implemented Oracle backend covering normalized data, roles and privileges, operational queries, transactions, reporting views, and backup planning. Its dashboard is a product concept based on that backend.', 'vehicleRental');
  }
  if (context === 'mood-insights' || /\b(mood|stress|wellbeing|mental health)\b/.test(value)) {
    return reply('Mood Insights & Stress Alerts is a wellbeing UX concept using readable trends, simple time filters, and supportive prompts when recurring stress patterns appear.', 'moodInsights');
  }
  if (/\b(starlink|cybersecurity|palo alto|ldap|ldaps|active directory|internship|professional experience|employment)\b/.test(value)) {
    return reply('Yahya completed a cybersecurity internship at StarLink in July and August 2026, covering enterprise firewall, identity, authentication, networking, traffic-analysis, and troubleshooting workflows. He also works at Gift It across frontend development, product, UX, testing, databases, and performance.', 'work', 'resume');
  }
  if (/\b(frontend|web development|html|css|javascript|vue|react|technical skills|tech stack|skills)\b/.test(value)) {
    return reply('Yahya’s frontend toolkit includes HTML, CSS, JavaScript, Vue.js, React Native, Tailwind CSS, PHP, and Flask. He pairs implementation with responsive design, accessibility, UX, product thinking, testing, and performance work.', 'resume', 'work');
  }
  if (/\b(education|degree|graduate|credential|certificate|resume|cv)\b/.test(value)) {
    return reply('Yahya earned a BSc in Computing and Information Technologies from RIT Dubai in May 2026, with a minor in Business Administration. His Resume page includes the current CV and eleven verified education, professional-development, research-compliance, and event credentials.', 'resume');
  }
  if (/\b(project|portfolio|case study|work)\b/.test(value)) {
    return reply('Yahya’s published work spans product UX, frontend systems, mobile concepts, databases, wellbeing interfaces, and network automation. The Work page contains the full set of available case studies and professional experience.', 'work');
  }
  return reply("I don't know that from Yahya's approved public information. Please contact Yahya for anything not covered by the portfolio.", 'contact');
}

function initializePortfolioAI() {
  const form = document.querySelector('#ai-chat-form');
  const input = document.querySelector('#ai-input');
  const messages = document.querySelector('#ai-messages');
  const status = document.querySelector('#ai-request-status');
  const counter = document.querySelector('#ai-character-count');
  const sendButton = form?.querySelector('button[type="submit"]');
  if (!form || !input || !messages || !status || !counter || !sendButton) return;
  const availability = document.querySelector('#ai-mode-indicator');

  const setAssistantAvailability = mode => {
    if (!availability) return;
    const labels = {
      checking:'Checking AI',
      online:'Online / Live AI',
      offline:'Offline / Prefilled answers'
    };
    availability.className = `ai-mode-indicator is-${mode}`;
    availability.querySelector('span').textContent = labels[mode];
    availability.title = mode === 'online'
      ? 'Questions are being answered by the live server-side AI.'
      : mode === 'offline'
        ? 'The live AI is unavailable. Answers use the approved local knowledge fallback.'
        : 'Checking the live assistant service.';
  };

  const checkAssistantAvailability = async () => {
    setAssistantAvailability('checking');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(apiEndpoint('/api/health'), { cache:'no-store', signal:controller.signal });
      const health = await response.json().catch(() => ({}));
      const online = response.ok && health.ai && health.logging && health.privacyHashing && health.atomicRateLimiting;
      setAssistantAvailability(online ? 'online' : 'offline');
    } catch {
      setAssistantAvailability('offline');
    } finally {
      clearTimeout(timeout);
    }
  };
  checkAssistantAvailability();

  const query = new URLSearchParams(location.search);
  const approvedContexts = {
    'gift-it':'Gift It case study',
    'rit-app':'RIT Student App case study',
    'passwordless':'Passwordless authentication case study',
    'vehicle-rental':'Vehicle rental case study',
    'mood-insights':'Mood Insights case study',
    'vr-neuroanatomy':'VR Neuroanatomy — locked',
    'network-automation':'SmartMall AI Network Automation',
    'experience':'Professional experience',
    'recruiter':'Recruiter quick view'
  };
  const pageContext = Object.hasOwn(approvedContexts, query.get('context')) ? query.get('context') : '';
  const assistantMode = query.get('mode') === 'recruiter' ? 'recruiter' : 'general';
  const contextBadge = document.querySelector('#ai-context');
  if (contextBadge && pageContext) {
    contextBadge.hidden = false;
    contextBadge.textContent = `Context / ${approvedContexts[pageContext]}`;
  }
  const startingQuestion = (query.get('q') || '').trim().slice(0, 800);
  if (startingQuestion) {
    input.value = startingQuestion;
    counter.textContent = `${startingQuestion.length} / 800`;
  }
  if (assistantMode === 'recruiter') {
    const recruiterQuestions = [
      ['Why interview Yahya?', 'Give me a concise recruiter summary of Yahya.'],
      ['Strongest evidence', 'Which three pieces of evidence best support Yahya’s fit?'],
      ['Availability', 'Summarize Yahya’s availability and work authorization.'],
      ['Contact', 'How can I contact Yahya?']
    ];
    document.querySelectorAll('.ai-suggestions [data-question]').forEach((button, index) => {
      if (!recruiterQuestions[index]) return;
      button.textContent = recruiterQuestions[index][0];
      button.dataset.question = recruiterQuestions[index][1];
    });
  }

  let history = [];
  const sessionId = getAnonymousSessionId();

  const setBusy = busy => {
    input.disabled = busy;
    sendButton.disabled = busy;
    sendButton.textContent = busy ? 'Thinking…' : "Ask Yahya'AI";
    status.textContent = busy ? 'Processing' : 'Ready';
    messages.setAttribute('aria-busy', String(busy));
    document.querySelectorAll('.ai-suggestions button').forEach(button => { button.disabled = busy; });
  };

  const append = (role, text, sources) => {
    messages.append(createChatMessage(role, text, sources));
    messages.scrollTo({ top: messages.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const appendAssistant = async (text, sources = []) => {
    const message = createChatMessage('assistant', '');
    const body = message.querySelector('.ai-message-body');
    messages.append(message);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !text) {
      body.textContent = text;
    } else {
      const duration = Math.min(2800, Math.max(650, text.length * 13));
      await new Promise(resolve => {
        const startedAt = performance.now();
        let visibleCharacters = 0;
        const typeFrame = now => {
          const nextCount = Math.min(text.length, Math.ceil(((now - startedAt) / duration) * text.length));
          if (nextCount !== visibleCharacters) {
            visibleCharacters = nextCount;
            body.textContent = text.slice(0, visibleCharacters);
            messages.scrollTop = messages.scrollHeight;
          }
          if (visibleCharacters < text.length) requestAnimationFrame(typeFrame);
          else resolve();
        };
        requestAnimationFrame(typeFrame);
      });
    }
    appendChatEvidence(message, sources);
    messages.scrollTo({ top: messages.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const localRoutes = isGitHubPages
    ? { home:'/portfolio/index.html', work:'/portfolio/work.html', experience:'/portfolio/work.html', about:'/portfolio/about.html', resume:'/portfolio/resume.html', recruiter:'/portfolio/recruiter.html', contact:'/portfolio/contact.html' }
    : { home:'/', work:'/work', experience:'/work', about:'/about', resume:'/resume', recruiter:'/recruiter', contact:'/contact' };

  async function ask(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const command = cleanQuestion.toLowerCase();
    if (command === 'clear') {
      messages.innerHTML = '';
      history = [];
      await appendAssistant('Conversation cleared. What would you like to know about Yahya?');
      return;
    }
    if (localRoutes[command]) {
      location.href = localRoutes[command];
      return;
    }
    if (command === 'help') {
      await appendAssistant('Ask a natural-language question, or use: home, work, experience, about, resume, recruiter, contact, and clear.');
      return;
    }

    append('user', cleanQuestion);
    input.value = '';
    counter.textContent = '0 / 800';
    setBusy(true);
    const thinkingMessage = createThinkingMessage();
    messages.append(thinkingMessage);
    messages.scrollTo({ top: messages.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    let finalStatus = '';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(apiEndpoint('/api/chat'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: cleanQuestion, history: history.slice(-8), sessionId, context: pageContext, mode: assistantMode }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const requestError = new Error(data.message || 'The assistant could not answer right now.');
        requestError.status = response.status;
        throw requestError;
      }

      thinkingMessage.remove();
      await appendAssistant(data.answer, Array.isArray(data.sources) ? data.sources : []);
      setAssistantAvailability('online');
      history.push({ role: 'user', content: cleanQuestion }, { role: 'assistant', content: data.answer });
      history = history.slice(-8);
      if (data.flag === 'salary') finalStatus = 'Flagged for Yahya';
    } catch (error) {
      thinkingMessage.remove();
      const recoverable = error.name === 'AbortError' || !Number.isFinite(error.status) || error.status === 404 || error.status >= 500;
      const fallback = recoverable ? localAssistantResponse(cleanQuestion, pageContext, assistantMode, history) : null;
      if (fallback) {
        await appendAssistant(fallback.answer, fallback.sources);
        setAssistantAvailability('offline');
        history.push({ role:'user', content:cleanQuestion }, { role:'assistant', content:fallback.answer });
        history = history.slice(-8);
        finalStatus = 'Local knowledge';
      } else {
        await appendAssistant(error.message || 'The assistant is temporarily unavailable. Please try again.');
        finalStatus = 'Connection unavailable';
      }
    } finally {
      thinkingMessage.remove();
      setBusy(false);
      if (finalStatus) status.textContent = finalStatus;
      input.focus();
    }
  }

  input.addEventListener('input', () => { counter.textContent = `${input.value.length} / 800`; });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
  });
  document.querySelectorAll('.ai-suggestions [data-question]').forEach(button => {
    button.addEventListener('click', () => ask(button.dataset.question || ''));
  });
}

function initializeNetworkDemo() {
  const demo = document.querySelector('#network-demo');
  if (!demo) return;
  const status = demo.querySelector('#network-demo-status');
  const log = demo.querySelector('#network-demo-log');
  const nodes = [...demo.querySelectorAll('[data-network-node]')];
  const controls = [...demo.querySelectorAll('[data-network-action]')];

  const setState = (state, message, events) => {
    demo.dataset.state = state;
    if (status) status.textContent = message;
    nodes.forEach(node => {
      node.classList.toggle('is-warning', state === 'fault' && node.dataset.networkNode === 'edge-03');
      node.classList.toggle('is-recovering', state === 'recovering');
    });
    if (log) log.innerHTML = events.map(event => `<li><span>${event.time}</span>${event.text}</li>`).join('');
  };

  const scenarios = {
    validate: ['Validation complete', [
      { time:'00:00.08', text:'Topology inventory matched the approved synthetic model.' },
      { time:'00:00.21', text:'Policy and reachability checks passed.' },
      { time:'00:00.34', text:'No configuration drift detected.' }
    ]],
    fault: ['Synthetic fault detected', [
      { time:'00:00.05', text:'Health probe missed on EDGE-03.' },
      { time:'00:00.16', text:'Dependency map isolated the affected path.' },
      { time:'00:00.29', text:'Recovery proposal staged for review.' }
    ]],
    recovered: ['Recovery verified', [
      { time:'00:00.07', text:'Approved recovery action applied to the simulation.' },
      { time:'00:00.18', text:'Reachability restored across all synthetic nodes.' },
      { time:'00:00.31', text:'Post-change validation passed.' }
    ]]
  };

  controls.forEach(button => button.addEventListener('click', () => {
    controls.forEach(control => { control.disabled = true; });
    const action = button.dataset.networkAction;
    if (action === 'recover') {
      setState('recovering', 'Analyzing synthetic fault…', [{ time:'00:00.01', text:'Comparing current state with the approved baseline.' }]);
      setTimeout(() => {
        setState('healthy', scenarios.recovered[0], scenarios.recovered[1]);
        controls.forEach(control => { control.disabled = false; });
      }, 720);
      return;
    }
    const next = action === 'fault' ? scenarios.fault : scenarios.validate;
    setState(action === 'fault' ? 'fault' : 'healthy', next[0], next[1]);
    controls.forEach(control => { control.disabled = false; });
  }));
}

let loaderTimer;

function showSiteLoader(immediate = false) {
  let loader = document.querySelector('.site-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'site-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML = '<span class="site-loader-mark" aria-hidden="true">Y</span><span class="sr-only">Loading content</span>';
    document.body.append(loader);
  }
  clearTimeout(loaderTimer);
  const reveal = () => loader.classList.add('is-visible');
  if (immediate) reveal();
  else loaderTimer = setTimeout(reveal, 180);
}

function hideSiteLoader() {
  clearTimeout(loaderTimer);
  const loader = document.querySelector('.site-loader');
  if (!loader) return;
  loader.classList.remove('is-visible');
  setTimeout(() => loader.remove(), 220);
}

function initializeBufferedMedia() {
  document.querySelectorAll('picture img').forEach(image => {
    const picture = image.closest('picture');
    if (!picture || image.complete) return;
    picture.classList.add('media-buffering');
    const settle = () => picture.classList.remove('media-buffering');
    image.addEventListener('load', settle, { once:true });
    image.addEventListener('error', settle, { once:true });
  });
}

function initializeWorkViews() {
  const controls = [...document.querySelectorAll('[data-work-view]')];
  if (!controls.length) return;
  const panels = [...document.querySelectorAll('[data-work-panel]')];
  const requestedView = new URLSearchParams(location.search).get('view');
  const initialView = requestedView === 'case-studies' ? 'case-studies' : 'professional-experience';

  const selectView = (view, shouldScroll = false) => {
    controls.forEach(control => {
      const selected = control.dataset.workView === view;
      control.classList.toggle('active', selected);
      control.setAttribute('aria-selected', String(selected));
      control.setAttribute('tabindex', selected ? '0' : '-1');
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.workPanel !== view; });
    const activePanel = panels.find(panel => !panel.hidden);
    if (shouldScroll && activePanel) activePanel.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  controls.forEach(control => control.addEventListener('click', () => selectView(control.dataset.workView, true)));
  selectView(initialView);
}

function initializeResumeTabs() {
  const controls = [...document.querySelectorAll('[data-resume-target]')];
  if (!controls.length) return;
  const panels = [...document.querySelectorAll('[data-resume-panel]')];
  controls.forEach(control => control.addEventListener('click', () => {
    const target = control.dataset.resumeTarget;
    controls.forEach(item => item.setAttribute('aria-selected', String(item === control)));
    panels.forEach(panel => { panel.hidden = panel.id !== target; });
    document.querySelector(`#${CSS.escape(target)}`)?.scrollIntoView({ behavior:'smooth', block:'start' });
  }));
}

function initializeRecruiterRoles() {
  const controls = [...document.querySelectorAll('[data-recruiter-role]')];
  if (!controls.length) return;
  const panels = [...document.querySelectorAll('[data-recruiter-panel]')];
  const approvedRoles = controls.map(control => control.dataset.recruiterRole);
  const requestedRole = new URLSearchParams(location.search).get('role');
  const initialRole = approvedRoles.includes(requestedRole) ? requestedRole : 'product';

  const selectRole = (role, updateUrl = false) => {
    controls.forEach(control => {
      const selected = control.dataset.recruiterRole === role;
      control.classList.toggle('active', selected);
      control.setAttribute('aria-selected', String(selected));
      control.setAttribute('tabindex', selected ? '0' : '-1');
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.recruiterPanel !== role; });
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('role', role);
      history.replaceState({}, '', url);
    }
  };

  controls.forEach((control, index) => {
    control.addEventListener('click', () => selectRole(control.dataset.recruiterRole, true));
    control.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + controls.length) % controls.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % controls.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = controls.length - 1;
      controls[nextIndex].focus();
      selectRole(controls[nextIndex].dataset.recruiterRole, true);
    });
  });
  selectRole(initialRole);
}

function initializeScrollToTop() {
  const button = document.createElement('button');
  button.className = 'scroll-top';
  button.type = 'button';
  button.setAttribute('aria-label', 'Go to the top of the page');
  button.title = 'Go to top';
  button.textContent = '↑';
  button.hidden = true;
  document.body.append(button);

  const footer = document.querySelector('.footer');
  const updatePosition = () => {
    button.hidden = scrollY < 480;
    const visibleFooterHeight = footer ? Math.max(0, innerHeight - footer.getBoundingClientRect().top) : 0;
    button.style.setProperty('--scroll-top-offset', `${Math.max(18, visibleFooterHeight + 12)}px`);
  };
  button.addEventListener('click', () => scrollTo({
    top:0,
    behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  }));
  addEventListener('scroll', updatePosition, { passive:true });
  addEventListener('resize', updatePosition, { passive:true });
  updatePosition();
}

function initializeImageLightbox() {
  const triggers = [...document.querySelectorAll('.project-image-button')];
  document.querySelectorAll('.detail-visual img, .gallery img, .case-figure img, .locked-cover img').forEach(image => {
    if (image.closest('.project-image-button')) return;
    image.classList.add('is-zoomable');
    image.setAttribute('role', 'button');
    image.setAttribute('tabindex', '0');
    image.setAttribute('aria-label', `Expand ${image.alt || 'project image'}`);
    image.title = 'Expand image';
    triggers.push(image);
  });
  if (!triggers.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('aria-labelledby', 'image-lightbox-caption');
  dialog.innerHTML = '<div class="image-lightbox-inner"><button class="image-lightbox-close" type="button" aria-label="Close expanded image" title="Close">×</button><div class="image-lightbox-stage"><span class="image-lightbox-loader" role="status"><span class="sr-only">Loading expanded image</span></span><img alt=""></div><p id="image-lightbox-caption"></p></div>';
  document.body.append(dialog);

  const stage = dialog.querySelector('.image-lightbox-stage');
  const expandedImage = dialog.querySelector('img');
  const caption = dialog.querySelector('#image-lightbox-caption');
  const loader = dialog.querySelector('.image-lightbox-loader');
  const closeButton = dialog.querySelector('.image-lightbox-close');
  let activeTrigger = null;

  const close = () => dialog.close();
  const open = trigger => {
    const sourceImage = trigger.matches('img') ? trigger : trigger.querySelector('img');
    if (!sourceImage) return;
    activeTrigger = trigger;
    const fullSource = trigger.dataset.fullSrc || sourceImage.dataset.fullSrc || sourceImage.src;
    const description = trigger.dataset.lightboxCaption || sourceImage.alt || 'Expanded project image';
    const cropDeviceFrame = Boolean(trigger.closest('.gallery-screen-crop'));
    stage.classList.toggle('is-device-crop', cropDeviceFrame);
    loader.hidden = false;
    expandedImage.hidden = true;
    expandedImage.alt = description;
    caption.textContent = description;
    expandedImage.onload = () => { loader.hidden = true; expandedImage.hidden = false; };
    expandedImage.onerror = () => { loader.hidden = true; expandedImage.hidden = false; };
    expandedImage.src = fullSource;
    dialog.showModal();
    if (expandedImage.complete) expandedImage.onload();
    closeButton.focus();
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => open(trigger));
    if (trigger.matches('img')) trigger.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open(trigger);
    });
  });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => {
    expandedImage.removeAttribute('src');
    expandedImage.onload = null;
    expandedImage.onerror = null;
    activeTrigger?.focus();
  });
}

function initializeContactForm() {
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-success');
  const submitButton = form?.querySelector('button[type="submit"]');
  if (!form || !status || !submitButton) return;
  if (document.documentElement.dataset.environment === 'staging') {
    submitButton.disabled = true;
    submitButton.textContent = 'Disabled on staging';
    return;
  }

  const deliverThroughFallback = async payload => {
    const response = await fetch(CONTACT_FALLBACK_ENDPOINT, {
      method:'POST',
      headers:{ accept:'application/json', 'content-type':'application/json' },
      body:JSON.stringify({
        ...payload,
        _subject:`Portfolio: ${payload.subject} - ${payload.name}`,
        _template:'table',
        _captcha:'false'
      })
    });
    const text = await response.text();
    let result = {};
    try { result = JSON.parse(text); } catch { result = {}; }
    if (!response.ok || String(result.success).toLowerCase() !== 'true') {
      const activationPending = /activation|activate form/i.test(result.message || '');
      throw new Error(activationPending
        ? 'Contact delivery is awaiting owner activation. Please use the email link above for now.'
        : 'Your message could not be sent. Please try again.');
    }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.hidden = false;
    status.classList.remove('is-error');
    status.textContent = 'Sending your message…';
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    try {
      const payload = Object.fromEntries(new FormData(form));
      const response = await fetch(apiEndpoint('/api/contact'), {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body:JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status >= 500) await deliverThroughFallback(payload);
        else throw new Error(result.message || 'Your message could not be sent. Please try again.');
      }
      status.textContent = 'Message sent. Thank you — I’ll get back to you soon.';
      form.reset();
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error.message || 'Your message could not be sent. Please try again.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send message';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.readyState !== 'complete') showSiteLoader();
  const main = document.querySelector('main');
  if (main) {
    main.id ||= 'main-content';
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = `#${main.id}`;
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);
  }

  const menu = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  if (menu && links) {
    links.id ||= 'site-navigation';
    menu.setAttribute('aria-controls', links.id);
    const closeMenu = () => { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
    menu.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      if (open) links.querySelector('a')?.focus();
    });
    links.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && links.classList.contains('open')) {
        closeMenu();
        menu.focus();
      }
    });
    document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
  }
  document.querySelector('.nav-link.active')?.setAttribute('aria-current', 'page');
  initializeBufferedMedia();
  initializeSiteAnalytics();
  initializeImageLightbox();
  initializeScrollToTop();
  initializeWorkViews();
  initializeResumeTabs();
  initializeRecruiterRoles();

  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const value = button.dataset.filter;
    document.querySelectorAll('#all-projects .project-card').forEach(card => card.hidden = value !== 'all' && !card.dataset.category.includes(value));
    const visibleCount = document.querySelectorAll('#all-projects .project-card:not([hidden])').length;
    const filterStatus = document.querySelector('#project-filter-status');
    if (filterStatus) filterStatus.textContent = `${visibleCount} project${visibleCount === 1 ? '' : 's'} shown.`;
  }));
  document.querySelectorAll('.filter').forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));

  initializePortfolioAI();
  initializeNetworkDemo();
  initializeContactForm();

  const revealTargets = document.querySelectorAll('.section, .page-hero, .project-card, .story-block, .cap-card, .timeline-item, .skill-group, .certificate, .contact-item, .log-entry, .experience-card');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach(node => node.classList.add('reveal'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold: .06, rootMargin:'0px 0px -20px'});
    revealTargets.forEach(node => observer.observe(node));
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.protocol === 'mailto:' || url.protocol === 'tel:' || url.hash && url.pathname === location.pathname) return;
    event.preventDefault();
    showSiteLoader(true);
    document.body.classList.add('page-leaving');
    setTimeout(() => { location.href = url.href; }, 140);
  });
});

addEventListener('load', hideSiteLoader, { once:true });
addEventListener('pageshow', () => {
  document.body.classList.remove('page-leaving');
  hideSiteLoader();
});
