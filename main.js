const A = '/assets/Pictures/';

const projects = [
  {
    id:'gift-it', url:'/work/gift-it', cover:'gift-it', title:'Gift It Checkout & E-Invite Redesign', client:'Gift It', category:'UX + Growth', role:'UX / Product (Web)', image:'/covers/gift-it-960.webp', summary:'Redesigning the purchase flow and e-invite experience to reduce drop-offs, improve trust, and strengthen post-purchase confirmation and transactional emails.', tags:['Conversion','Trust','Figma + HTML/CSS'],
    meta:[['Goal','Reduce drop-off'],['Role','UX / Product (Web)'],['Focus','Conversion & Trust'],['Tools','Figma + HTML/CSS'],['Also','Transactional Emails']],
    verification:[['Problem','Checkout friction, trust questions, and unclear post-purchase communication.'],['Contribution','UX and product decisions informed by frontend implementation constraints.'],['Delivery','Design artifacts and frontend-informed product work.'],['Evidence','Funnel observations, redesigned flows, final UI, and a defined A/B test plan.'],['Outcome','Success metrics are defined; no verified public conversion lift is claimed.']],
    sections:[
      {title:'Funnel + Drop-offs', text:'The checkout funnel showed the biggest drop-offs around shipping and contact details, payment selection, and the e-invite setup step. The goal was to reduce friction and improve confidence at each step.', facts:['Key funnel: Product → Amount → Recipient → Payment → Confirmation','Hypothesis: unclear steps and trust questions cause abandonment']},
      {title:'Friction Points', text:'Reviewing the flow and support patterns revealed three central problems.', cards:[['Too much input','Too many fields appear before users understand code delivery, the recipient flow, or refund rules.'],['Trust questions','Users need reassurance about when the code arrives, whether the service is legitimate, and how gifting works.'],['Post-purchase gap','Confirmation and transactional emails must clearly explain order status, delivery, and who receives what.']]},
      {title:'Redesigned Flow', text:'The redesign simplifies steps, adds reassurance at key moments, and makes the e-invite feel intentional rather than like extra work.', cards:[['Step clarity','A visible stepper and “What happens next” microcopy.'],['Trust blocks','Code delivery, refund policy, and support information visible early.'],['E-invite defaults','Smart defaults with optional message, scheduling, and preview.']]},
      {title:'A/B Test Plan', columns:[['Primary metrics','Checkout completion rate|Payment-step completion|E-invite completion|Time to complete purchase'],['Secondary metrics','“Where is my code?” support tickets|Email open and click rate|Refund/dispute rate|Post-purchase feedback']]},
      {title:'Final UI', text:'High-fidelity screens showing the simplified checkout, e-invite setup, and clear confirmation states.', cropDeviceFrame:true, images:[[A+'Checkout.webp','Checkout step'],[A+'E_invite_steps.webp','E-invite setup'],[A+'E_invite_confirmation.webp','Confirmation']]},
      {title:'Transaction Emails + Order Confirmation UX', text:'To reduce “Where is my code?” confusion, confirmation pages and emails were treated as part of the product, not an afterthought.', facts:['Order confirmation: clear status, expected delivery, and next actions','E-invite email: sender/recipient clarity and what happens when opened','Order updates: payment confirmed → code delivered → resend/support'], images:[[A+'Order_confirmation0.webp','Order confirmation'],[A+'E_invite_payment_confirmation0.webp','Payment confirmation']]}
    ]
  },
  {
    id:'rit-app', url:'/work/rit-app', cover:'rit-app', date:'2023-12', title:'RIT Student App 2.0', client:'RIT Dubai', category:'Mobile Product', role:'Product / UX', image:'/covers/rit-app-960.webp', figmaUrl:'https://www.figma.com/design/0ef9IT13nGfsHzgzvUhZLx/RIT-App?m=auto&t=bsViZxEi1Rshr1Xb-6', summary:'Reimagining the student experience by fixing recurring sign-in issues, improving notifications, and unifying myCourses and SIS access.', tags:['Student UX','myCourses + SIS','Sign-in + Alerts'],
    meta:[['Focus','Student UX'],['Role','Product / UX'],['Timeline','Sep–Dec 2023'],['Systems','myCourses + SIS'],['Fixes','Sign-in + Alerts']],
    verification:[['Problem','Recurring sign-in failures, delayed notifications, and fragmented academic access.'],['Contribution','Led product and UX work across research, information architecture, flows, and interface design.'],['Delivery','Academic product proposal and high-fidelity prototype.'],['Evidence','Student interviews, revised flows, and key-screen designs.'],['Outcome','Intended improvements are documented; no production adoption or measured lift is claimed.']],
    sections:[
      {title:'The Problem', text:'Students relied on the existing “Pulse” platform, but recurring sign-in errors, delayed notifications, and missing features made it unreliable for daily academic use. The goal was a unified experience with quick access to myCourses, SIS, timely alerts, and cleaner navigation.', facts:['Sign-in: recurring errors','Notifications: delayed updates','Core access: important features missing']},
      {title:'User Interviews & Insights', text:'We spoke with students about daily tasks, failure points, and what an ideal flow should feel like.', cards:[['Access first','If login breaks, the app is dead. Reliability beats extra features.'],['Time matters','Notifications must be quick and relevant to deadlines, announcements, and classes.'],['Unified hub','Students want one app that quickly routes to myCourses, SIS, schedules, and announcements.']]},
      {title:'Information Architecture + Flows', text:'Navigation was reorganized around top student tasks to reduce “Where do I go?” moments.', cards:[['Home as hub','Today’s classes, deadlines, and quick actions.'],['Academics','myCourses, assignments, grades, and resources.'],['Admin','SIS access for enrollment, payments, and official information.']], images:[[A+'Updated_user_flows.webp','Updated login, home, myCourses, and SIS flows']]},
      {title:'Final UI', text:'Core screens were designed for speed, clarity, and daily use.', images:[[A+'Login.webp','Reliable sign-in'],[A+'Homescreen.webp','Home hub'],[A+'Notifications.webp','Notifications']]},
      {title:'Outcomes', text:'A more reliable and unified student experience designed around real student tasks.', facts:['Improve sign-in reliability','Unify myCourses and SIS access','Improve notifications and updates']}
    ]
  },
  {
    id:'passwordless', url:'/work/passwordless', cover:'passwordless', title:'Passwordless Login & Signup Redesign', client:'Gift It', category:'Mobile-first UX', role:'Lead Designer (Design-only)', image:'/covers/passwordless-960.webp', figmaUrl:'https://www.figma.com/design/Hf5el7dkl19VVS7DvtknQK/Gifit?m=auto&t=bsViZxEi1Rshr1Xb-6', summary:'A mobile-first redesign focused on faster registration and passwordless email verification while aligning web and mobile on one API.', tags:['Authentication','Email OTP','Unified API'], note:'Scope: I was responsible for the full UX/UI design and handoff specifications. I was not involved in production implementation.',
    meta:[['Registration','3–4 min → 1–2 min'],['Role','Lead Designer'],['Focus','Mobile-first simplicity'],['Auth','Passwordless email OTP'],['Platform','Unified API']],
    verification:[['Problem','Long mobile registration and inconsistent authentication behavior across platforms.'],['Contribution','Owned the complete UX/UI design, edge cases, flow logic, and handoff specifications.'],['Delivery','Design and handoff only; no production implementation claim.'],['Evidence','Full flow map, error states, final UI, and Figma source.'],['Outcome','The 1–2 minute registration figure is a design target, not a verified production result.']],
    sections:[
      {title:'The Problem', text:'The existing experience was not optimized for mobile and the registration page was too long, creating friction and increasing completion time.', facts:['Dense mobile layout, difficult typing, unclear progress','Registration took roughly 3–4 minutes','Mobile and desktop used different APIs, producing mismatched behavior']},
      {title:'Goals', text:'The redesign followed one main idea: reduce steps, typing, and mistakes.', cards:[['Faster registration','Reduce completion time from 3–4 minutes to 1–2 minutes.'],['Mobile-first clarity','Improve readability, spacing, and tap targets.'],['Passwordless login','Users receive an email code with no password required.'],['Unified behavior','Use one API for consistent web and mobile experiences.']]},
      {title:'The Solution', text:'The experience was redesigned end to end with one clear decision per screen.', cards:[['Shorter registration','Cleaner steps reduce decision fatigue.'],['Email OTP login','Email → code → verification → continue.'],['Clear error states','Predictable invalid-code, resend-timer, and captcha feedback.'],['Same API','Consistent behavior and fewer edge-case bugs across platforms.']]},
      {title:'New Flows', text:'The full flow map includes happy paths and edge cases for login and registration.', facts:['Invalid email format','Expired or incorrect OTP','Resend timer and throttling','Captcha not accepted','Existing email routes to login'], images:[[A+'flowmap.webp','Login and registration flow map']]},
      {title:'Final UI', text:'Screens minimize typing, clarify progression, and provide predictable feedback.', cropDeviceFrame:true, images:[[A+'Login_giftiti.webp','Login screen'],[A+'Sign_up_giftit.webp','Registration'],[A+'Verification.webp','Email verification']]},
      {title:'Impact', text:'The redesign simplified authentication and aligned both platforms.', facts:['New registration target: 1–2 minutes','Passwordless OTP authentication','One API shared by web and mobile']},
      {title:'Notes & Learnings', cards:[['Simplicity is a feature','Cutting steps and clarifying states improves speed and confidence.'],['Consistency reduces bugs','One API supports predictable UX and fewer edge-case inconsistencies.']], columns:[['What I’d measure next','Signup completion rate|Time to complete signup|OTP success vs password login|Drop-off from email → OTP → completion']]}
    ]
  },
  {
    id:'vehicle-rental', url:'/work/vehicle-rental', cover:'vehicle-rental', title:'Vehicle Rental Operations Database', client:'RIT Dubai', category:'Backend + Data', role:'Database Developer', image:'/covers/vehicle-rental-960.webp', summary:'Turning an Oracle database—schema, roles, transactions, and queries—into a product story for rental operations.', tags:['Oracle DB','Role Security','Backup → S3'], note:'This project shipped backend and database operations. The dashboard UI is a concept showing how the data could support a real product.',
    meta:[['Built','Oracle DB'],['Role','Database Developer'],['Domain','Car Rental Ops'],['Security','Roles + Privileges'],['Reliability','Cold Backup → S3']],
    verification:[['Problem','Rental operations needed reliable data for customers, vehicles, rentals, maintenance, and availability.'],['Contribution','Designed and implemented the relational model, access controls, queries, views, transactions, and backup approach.'],['Delivery','Oracle backend implemented; dashboard interface remains a concept.'],['Evidence','ERD, schema structure, operational tasks, privileges, queries, and backup plan.'],['Outcome','The backend supports the documented workflows; no commercial deployment claim is made.']],
    sections:[
      {title:'The Problem', text:'Car-rental operations need a single source of truth for customers, vehicles, rentals, and maintenance, with accurate availability and cost tracking. We implemented an Oracle relational database to enable operational visibility through queries and views.', facts:['Four core areas: customers, vehicles, rentals, maintenance','Role-based access control','Cold-backup reliability strategy']},
      {title:'Schema Snapshot', text:'The ERD models the business: rentals connect customers, vehicles, and employees, supported by maintenance history and daily cost tracking.', cards:[['Core entities','Customer, Vehicle, Rental, and Maintenance track availability, scheduling, and cost per day.'],['Supporting entities','Employee and AvgDailyCost support ownership and pricing trends.']], images:[[A+'ERD.webp','Vehicle rental ERD and schema']]},
      {title:'User Tasks', text:'Database capabilities were translated into practical operations tasks.', cards:[['Create a rental','Find available vehicles, create the rental, and calculate total cost from the date range.'],['Track maintenance','Log events and retain full vehicle maintenance history.'],['Revenue & reporting','Summarize rentals, average costs, and totals using queries and views.'],['Role-based access','Customers view, employees insert rentals, supervisors create reporting views.']]},
      {title:'Dashboard Concept', text:'The database supports one operations view with exactly the data exposed by its schema and queries.', cards:[['Fleet Status','Available, rented, and maintenance counts from Vehicle.Status.'],['Active Rentals','Current rentals with customer, date range, and total cost.'],['Maintenance Queue','Recent entries with cost and description.']]},
      {title:'Backend Highlights', cards:[['Users & Privileges','SYS, DEV_USER, CUSTOMER_USER, EMPLOYEE_USER, and SUPERVISOR_USER enforce least-privilege access.'],['Remote Connections','Secure remote access was verified while maintaining permission boundaries.'],['Queries & Views','Operational reports cover customer and employee rentals, vehicles by price, revenue, and a rental-summary view.'],['Transactions','Core transactions create rentals, average daily cost records, and maintenance logs.'],['Backup Strategy','A cold-backup approach with automated S3 upload supports recovery and reliability.']]},
      {title:'Outcome', text:'A production-style backend foundation: structured schema, controlled access, operational queries and views, transaction logic, and a backup plan ready to power an operations dashboard.', facts:['Model: real operations entities','Secure: role-based access','Ready: queries can feed dashboard reporting']}
    ]
  },
  {
    id:'mood-insights', url:'/work/mood-insights', cover:'mood-insights', date:'2024-11', title:'Mood Insights & Stress Alerts', client:'RIT Dubai', category:'UX Case Study', role:'UX Designer', image:'/covers/mood-insights-960.webp', figmaUrl:'https://www.figma.com/design/pzCPmk9lmXVHZouLufMmeq/Project?m=auto&t=bsViZxEi1Rshr1Xb-1', summary:'A mental-health companion concept that turns mood check-ins into trends, time filters, and gentle stress-pattern alerts.', tags:['Data Visualization','Wellbeing','Insights UX'],
    meta:[['Focus','Insights UX'],['Role','UX Designer'],['Timeline','Nov 2024'],['Core','Graphs + Filters'],['Outcome','Clearer patterns']],
    verification:[['Problem','Mood patterns and stress triggers were difficult to understand from inconsistent check-ins.'],['Contribution','Designed the UX concept, information hierarchy, filters, trends, and supportive alert patterns.'],['Delivery','Academic UX concept and high-fidelity prototype.'],['Evidence','Research goals, interaction model, key screens, and Figma source.'],['Outcome','Clarity and supportive guidance are intended outcomes; no clinical or production result is claimed.']],
    sections:[
      {title:'The Problem', text:'People often track mood inconsistently and struggle to understand what causes stress over time. The challenge was turning daily check-ins into meaningful insight without overwhelming users.', facts:['Mood trends are hard to see','Stress triggers remain unclear','Typical insight views feel too complex']},
      {title:'Research & Goals', text:'The focus was clarity rather than complexity.', cards:[['Make patterns visible','Users should notice good and difficult weeks without digging.'],['Natural filters','Day, week, and month toggles should reduce noise.'],['Support, not overwhelm','Alerts should be gentle and actionable, suggesting coping steps rather than warning users.']]},
      {title:'The Solution', text:'A clean Insights dashboard pairs understandable mood trends with stress patterns and supportive nudges.', cards:[['Mood trend graph','Spot changes across day, week, and month.'],['Filters','Switch time ranges with one tap.'],['Stress alerts','Provide supportive prompts based on recurring patterns.']]},
      {title:'Key Screens', text:'The UI prioritizes readable charts, obvious filters, and personal-feeling insights.', images:[[A+'Home_screen.webp','Home screen'],[A+'Daily_checkins.webp','Daily check-ins'],[A+'Mood_avg.webp','Mood average and trends']]},
      {title:'Outcomes', text:'A calmer Insights experience where users can spot trends, compare time ranges, and receive gentle support when stress patterns repeat.', facts:['See mood trends clearly','Filter by day, week, or month','Receive gentle stress nudges']}
    ]
  },
  {
    id:'vr-neuroanatomy', url:'/work/vr-neuroanatomy', cover:'vr-neuroanatomy', date:'2026-08', title:'VR Neuroanatomy', client:'Locked case study', category:'Locked', role:'Details under embargo', image:'/covers/vr-neuroanatomy-960.webp', summary:'This is an ongoing research project. Further details cannot be disclosed at this stage.', tags:['Locked','Ongoing research'], locked:true
  },
  {
    id:'network-automation', url:'/work/network-automation', cover:'network-automation', date:'2026-05', title:'SmartMall AI Network Automation', client:'RIT Dubai · Collaborative project', category:'Networks + AI Automation', role:'Equal team contribution', image:'/covers/network-automation-960.webp', summary:'A five-person proof of concept for conversational network operations, dynamic tenant orchestration, validation, and closed-loop recovery.', tags:['GNS3','Python + Netmiko','Closed-loop recovery'], demo:true
  }
];

const sortedProjects = [...projects]
  .sort((left, right) => {
    if (left.date && right.date && left.date !== right.date) return right.date.localeCompare(left.date);
    if (left.date !== right.date) return left.date ? -1 : 1;
    return left.title.localeCompare(right.title);
  })
  .map((project, index) => ({ ...project, number:String(index + 1).padStart(2, '0') }));

function projectCard(project) {
  const figmaLink = project.figmaUrl ? `<a class="text-link project-figma-link" href="${project.figmaUrl}" target="_blank" rel="noopener noreferrer">Open Figma file</a>` : '';
  return `<article class="project-card" data-category="${project.category.toLowerCase()} ${project.tags.join(' ').toLowerCase()}" data-project-url="${project.url}">
    <button class="project-art project-image-button" type="button" aria-label="Expand ${project.title} project cover" title="Expand image" data-full-src="/covers/${project.cover}-1440.webp" data-lightbox-caption="${project.title} project cover"><span class="project-number">${project.number} / ${project.category}</span>${project.locked ? '<span class="project-state project-state-locked">Locked</span>' : project.demo ? '<span class="project-state">Interactive</span>' : ''}<picture><source type="image/avif" srcset="/covers/${project.cover}-640.avif 640w, /covers/${project.cover}-960.avif 960w, /covers/${project.cover}-1440.avif 1440w" sizes="(max-width: 820px) 100vw, 50vw"><source type="image/webp" srcset="/covers/${project.cover}-640.webp 640w, /covers/${project.cover}-960.webp 960w, /covers/${project.cover}-1440.webp 1440w" sizes="(max-width: 820px) 100vw, 50vw"><img src="/covers/${project.cover}-960.webp" alt="${project.title} project cover" width="960" height="640" loading="lazy" decoding="async"></picture></button>
    <div class="project-body"><span class="eyebrow">${project.client}</span><h3><a href="${project.url}">${project.title}</a></h3><p>${project.summary}</p><div class="tags">${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div><div class="actions project-actions"><a class="text-link" data-project-link href="${project.url}">Open case study</a>${figmaLink}</div></div>
  </article>`;
}

function renderProjects(target, limit) {
  const node = document.querySelector(target);
  const availableProjects = target === '#featured-projects' ? sortedProjects.filter(project => !project.locked) : sortedProjects;
  if (node) node.innerHTML = availableProjects.slice(0, limit || availableProjects.length).map(projectCard).join('');
}

const galleryImageDimensions = {
  Checkout:[1440,2932], Daily_checkins:[1440,2932], ERD:[1022,689], E_invite_confirmation:[1440,2932],
  E_invite_payment_confirmation0:[793,1141], E_invite_steps:[1440,2932], flowmap:[1108,944],
  Homescreen:[1440,2932], Home_screen:[1440,2932], Login:[1440,2932], Login_giftiti:[1440,2932],
  Mood_avg:[1440,2932], Notifications:[1440,2932], Order_confirmation0:[793,1160],
  Sign_up_giftit:[1440,2932], Updated_user_flows:[1499,816], Verification:[1440,2932]
};

function renderGalleryImage(src, alt) {
  const filename = src.split('/').pop() || '';
  const stem = filename.replace(/\.[^.]+$/, '');
  const [width, height] = galleryImageDimensions[stem] || [1200, 900];
  const responsivePath = '/assets/Pictures/responsive/';
  const sizes = '(max-width: 760px) calc(100vw - 68px), (max-width: 1180px) 33vw, 360px';
  return `<figure><picture><source type="image/avif" srcset="${responsivePath}${stem}-480.avif 480w, ${responsivePath}${stem}-768.avif 768w, ${responsivePath}${stem}-1200.avif 1200w" sizes="${sizes}"><source type="image/webp" srcset="${responsivePath}${stem}-480.webp 480w, ${responsivePath}${stem}-768.webp 768w, ${responsivePath}${stem}-1200.webp 1200w" sizes="${sizes}"><img src="${responsivePath}${stem}-1200.webp" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async"></picture><figcaption>${alt}</figcaption></figure>`;
}

function renderSection(section, index) {
  const facts = section.facts ? `<ul class="fact-list">${section.facts.map(x=>`<li>${x}</li>`).join('')}</ul>` : '';
  const cards = section.cards ? `<div class="insight-grid">${section.cards.map(([title,text])=>`<div class="insight"><h3>${title}</h3><p>${text}</p></div>`).join('')}</div>` : '';
  const columns = section.columns ? `<div class="metric-grid">${section.columns.map(([title,items])=>`<div class="metric"><h3>${title}</h3><ul>${items.split('|').map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('')}</div>` : '';
  const images = section.images ? `<div class="gallery${section.cropDeviceFrame ? ' gallery-screen-crop' : ''}">${section.images.map(([src,alt])=>renderGalleryImage(src,alt)).join('')}</div>` : '';
  return `<article class="story-block" id="section-${index+1}"><span class="eyebrow">${String(index+1).padStart(2,'0')} / Case study</span><h2>${section.title}</h2>${section.text?`<p>${section.text}</p>`:''}${facts}${cards}${columns}${images}</article>`;
}

function renderProjectDetail() {
  const mount = document.querySelector('#project-detail');
  if (!mount) return;
  const requestedId = document.body.dataset.projectId || new URLSearchParams(location.search).get('id');
  const project = sortedProjects.find(item => item.id === requestedId) || sortedProjects[0];
  if (project.locked) return;
  document.title = `${project.title} — Yahya El-Sawi`;
  const meta = project.meta.map(([label,value])=>`<div class="meta"><small>${label}</small>${value}</div>`).join('');
  const verification = project.verification.map(([label,value])=>`<article class="project-proof-card"><span class="eyebrow">${label}</span><p>${value}</p></article>`).join('');
  const nav = project.sections.map((s,i)=>`<a href="#section-${i+1}">${String(i+1).padStart(2,'0')} / ${s.title}</a>`).join('');
  const figmaButton = project.figmaUrl ? `<a class="btn btn-secondary" href="${project.figmaUrl}" target="_blank" rel="noopener noreferrer">Open Figma file</a>` : '';
  mount.innerHTML = `<section class="shell detail-hero"><div><span class="eyebrow">Case study ${project.number} / ${project.client}</span><h1>${project.title}</h1><p class="lead">${project.summary}</p>${project.note?`<p class="scope-note">${project.note}</p>`:''}${figmaButton ? `<div class="actions detail-actions">${figmaButton}</div>` : ''}<div class="meta-grid">${meta}</div></div><div class="detail-visual"><picture><source type="image/avif" srcset="/covers/${project.cover}-640.avif 640w, /covers/${project.cover}-960.avif 960w, /covers/${project.cover}-1440.avif 1440w" sizes="(max-width: 820px) 100vw, 45vw"><source type="image/webp" srcset="/covers/${project.cover}-640.webp 640w, /covers/${project.cover}-960.webp 960w, /covers/${project.cover}-1440.webp 1440w" sizes="(max-width: 820px) 100vw, 45vw"><img src="${project.image}" data-full-src="/covers/${project.cover}-1440.webp" alt="${project.title} cover artwork" width="960" height="640" decoding="async"></picture></div></section>
  <section class="section project-proof"><div class="shell"><div class="section-head"><div><span class="eyebrow">Verified project record</span><h2>Evidence, scope, and outcome.</h2></div></div><div class="project-proof-grid">${verification}</div></div></section>
  <section class="section-soft"><div class="shell content-grid"><aside class="content-nav"><span class="eyebrow">Contents</span>${nav}<a href="/terminal?context=${encodeURIComponent(project.id)}">Ask Yahya'AI about this project</a><a href="/contact">Discuss this project</a></aside><div class="story">${project.sections.map(renderSection).join('')}<article class="story-block next-project"><span class="eyebrow">End of scan</span><h2>Continue exploring.</h2><div class="actions"><a class="btn btn-primary" href="/work?view=case-studies">All projects</a><a class="btn btn-secondary" href="/terminal?context=${encodeURIComponent(project.id)}">Ask Yahya'AI</a></div></article></div></div></section>`;
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

  if (sources.length) {
    const evidence = document.createElement('div');
    evidence.className = 'ai-evidence';
    const title = document.createElement('span');
    title.textContent = 'Evidence:';
    evidence.append(title);
    sources.forEach(source => {
      if (!source?.url || !source?.label) return;
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.label;
      if (/^https?:\/\//.test(source.url)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      evidence.append(link);
    });
    message.append(evidence);
  }
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

function localAssistantResponse(question, context, mode) {
  const value = question.toLowerCase();
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
  if (/\b(salary|compensation|pay range|expected pay|hourly rate)\b/.test(value)) {
    return reply('Yahya prefers to discuss compensation directly once the role and responsibilities are clear. Please contact him to continue that conversation.', 'contact');
  }
  if (/\b(contact|email|phone|whatsapp|linkedin|github|reach|get in touch)\b/.test(value)) {
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
      const response = await fetch('/api/health', { cache:'no-store', signal:controller.signal });
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
  let sessionId;
  try {
    sessionId = sessionStorage.getItem('yahya-ai-session') || crypto.randomUUID();
    sessionStorage.setItem('yahya-ai-session', sessionId);
  } catch {
    sessionId = crypto.randomUUID();
  }

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

  const localRoutes = { home:'/', work:'/work', experience:'/work', about:'/about', resume:'/resume', recruiter:'/recruiter', contact:'/contact' };

  async function ask(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const command = cleanQuestion.toLowerCase();
    if (command === 'clear') {
      messages.innerHTML = '';
      history = [];
      append('assistant', 'Conversation cleared. What would you like to know about Yahya?');
      return;
    }
    if (localRoutes[command]) {
      location.href = localRoutes[command];
      return;
    }
    if (command === 'help') {
      append('assistant', 'Ask a natural-language question, or use: home, work, experience, about, resume, recruiter, contact, and clear.');
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: cleanQuestion, history: history.slice(-4), sessionId, context: pageContext, mode: assistantMode }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const requestError = new Error(data.message || 'The assistant could not answer right now.');
        requestError.status = response.status;
        throw requestError;
      }

      thinkingMessage.remove();
      append('assistant', data.answer, Array.isArray(data.sources) ? data.sources : []);
      setAssistantAvailability('online');
      history.push({ role: 'user', content: cleanQuestion });
      history = history.slice(-4);
      if (data.flag === 'salary') finalStatus = 'Flagged for Yahya';
    } catch (error) {
      thinkingMessage.remove();
      const recoverable = error.name === 'AbortError' || !Number.isFinite(error.status) || error.status === 404 || error.status >= 500;
      const fallback = recoverable ? localAssistantResponse(cleanQuestion, pageContext, assistantMode) : null;
      if (fallback) {
        append('assistant', fallback.answer, fallback.sources);
        setAssistantAvailability('offline');
        history.push({ role:'user', content:cleanQuestion });
        history = history.slice(-4);
        finalStatus = 'Local knowledge';
      } else {
        append('assistant', error.message || 'The assistant is temporarily unavailable. Please try again.');
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

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.hidden = false;
    status.classList.remove('is-error');
    status.textContent = 'Sending your message…';
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    try {
      const payload = Object.fromEntries(new FormData(form));
      const response = await fetch('/api/contact', {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body:JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Your message could not be sent. Please try again.');
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
  renderProjects('#featured-projects', 3); renderProjects('#all-projects'); renderProjectDetail();
  initializeBufferedMedia();
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
