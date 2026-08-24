const TOPICS = [
  { label: "Hiring and role fit", pattern: /\b(hir(?:e|ing)|recruiter|roles?|job|position|opportunit(?:y|ies)|interview)\b/i, weight: 3 },
  { label: "Availability", pattern: /\b(available|availability|start date|relocat|remote work|work authorization|golden visa)\b/i, weight: 3 },
  { label: "Contact", pattern: /\b(contact|email|phone|whatsapp|linkedin|github|instagram|threads|twitter|reach yahya|get in touch)\b/i, weight: 2 },
  { label: "StarLink experience", pattern: /\b(starlink|palo alto|pan-os|ldap|ldaps|active directory|forcepoint|globalprotect|internship)\b/i, weight: 2 },
  { label: "Gift It", pattern: /\b(gift[ -]?it|checkout|e-invite)\b/i, weight: 2 },
  { label: "Network automation", pattern: /\b(network automation|smartmall|smart mall|gns3|netmiko|tenant onboarding|closed-loop)\b/i, weight: 2 },
  { label: "RIT Student App", pattern: /\b(rit app|student app|mycourses|sis|pulse)\b/i, weight: 2 },
  { label: "Mood Insights", pattern: /\b(mood insights|wellbeing|stress|mental health)\b/i, weight: 2 },
  { label: "Passwordless UX", pattern: /\b(passwordless|email otp|sign ?up|login|authentication)\b/i, weight: 2 },
  { label: "Vehicle rental", pattern: /\b(vehicle rental|oracle|database|sql|backup strategy)\b/i, weight: 2 },
  { label: "Skills and credentials", pattern: /\b(skill|technology|tech stack|education|degree|certificate|credential|resume|cv)\b/i, weight: 1 },
  { label: "Portfolio projects", pattern: /\b(project|portfolio|case stud|selected work)\b/i, weight: 1 }
];

const FOLLOW_UP = /^(?:and|also|why|how|where|when|which|what about|tell me more|can you expand|what else|how so)\b|\b(?:that|this|it|those|them|he)\b/i;
const UNKNOWN = /I don['’]t know that from Yahya['’]s approved public information/i;

function clean(value, limit = 300) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, limit) : "";
}

function detectedTopics(rows) {
  const counts = new Map();
  rows.forEach((row, rowIndex) => {
    const value = `${clean(row?.question)} ${clean(row?.answer)}`;
    TOPICS.forEach((topic, topicIndex) => {
      if (!topic.pattern.test(value)) return;
      const existing = counts.get(topic.label) || { ...topic, count: 0, first: rowIndex, order: topicIndex };
      existing.count += 1;
      counts.set(topic.label, existing);
    });
  });
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || b.weight - a.weight || a.first - b.first || a.order - b.order)
    .slice(0, 3);
}

function scoreBand(score) {
  if (score >= 7) return "strong";
  if (score >= 4) return "developing";
  return "light";
}

function reasonFor({ score, topics, questionCount, safetyFlags, unknownCount, followUps }) {
  const highIntent = topics.some(topic => topic.weight === 3);
  if (safetyFlags) return "Safety boundaries were triggered, so intent is uncertain.";
  if (score >= 8 && highIntent) return "Strong role intent with specific, sustained questions.";
  if (score >= 7) return "Focused questions and useful follow-up engagement.";
  if (score >= 5 && highIntent) return "Clear role or contact intent, with room for more detail.";
  if (followUps) return "The visitor followed up, but the conversation stayed brief.";
  if (unknownCount) return "The topic was not covered by approved portfolio information.";
  if (questionCount > 1) return "Several relevant questions showed moderate interest.";
  return "A short exploratory conversation with limited intent signals.";
}

export function buildSessionInsight(rows = []) {
  const ordered = [...rows].filter(Boolean).sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")));
  const topics = detectedTopics(ordered);
  const questionCount = ordered.length;
  const safetyFlags = ordered.filter(row => row.flag === "privacy").length;
  const salaryFlags = ordered.filter(row => row.flag === "salary").length;
  const unknownCount = ordered.filter(row => UNKNOWN.test(clean(row.answer, 500))).length;
  const followUps = ordered.slice(1).filter(row => FOLLOW_UP.test(clean(row.question))).length;
  const highIntent = topics.some(topic => topic.weight === 3);
  const evidenceIntent = topics.some(topic => topic.weight === 2);
  const highIntentTopics = topics.filter(topic => topic.weight === 3).length;

  let score = 3;
  score += Math.min(3, questionCount);
  if (highIntent) score += 2;
  if (highIntentTopics > 1) score += 1;
  if (evidenceIntent) score += 1;
  if (followUps) score += 1;
  if (salaryFlags) score += 1;
  score -= Math.min(3, safetyFlags * 2);
  if (unknownCount === questionCount && questionCount) score -= 1;
  score = Math.max(1, Math.min(10, score));

  const labels = topics.map(topic => topic.label);
  const summary = labels.length ? labels.join(" / ") : "General portfolio questions";

  return {
    score,
    band: scoreBand(score),
    summary,
    reason: reasonFor({ score, topics, questionCount, safetyFlags, unknownCount, followUps }),
    topics: labels,
    questionCount,
    safetyFlags,
    startedAt: ordered[0]?.created_at || null,
    lastActiveAt: ordered.at(-1)?.created_at || null,
    location: {
      country: clean(ordered.at(-1)?.country, 8) || null,
      region: clean(ordered.at(-1)?.region, 100) || null,
      city: clean(ordered.at(-1)?.city, 100) || null
    }
  };
}

export function groupSessionInsights(rows = []) {
  const groups = new Map();
  rows.forEach(row => {
    const fullId = clean(row?.session_hash, 128);
    if (!/^[a-f0-9]{64}$/i.test(fullId)) return;
    if (!groups.has(fullId)) groups.set(fullId, []);
    groups.get(fullId).push(row);
  });
  return [...groups.entries()]
    .map(([fullId, entries]) => ({ id: fullId.slice(0, 16).toLowerCase(), ...buildSessionInsight(entries) }))
    .sort((a, b) => String(b.lastActiveAt || "").localeCompare(String(a.lastActiveAt || "")))
    .slice(0, 75);
}
