export const INTEREST_COOKIE = "portfolio_interests_v1";
export const INTEREST_RETENTION_MS = 180 * 24 * 60 * 60 * 1000;
export const INTEREST_CATEGORIES = Object.freeze([
  "product-ux", "frontend", "mobile", "cybersecurity", "networking-ai", "databases", "marketing", "business-development"
]);

const PROJECT_CATEGORY = Object.freeze({
  "gift-it": "product-ux",
  "giftit-app-positioning": "product-ux",
  "giftit-email-lifecycle": "frontend",
  "giftit-saudi-arabic": "frontend",
  "passwordless": "product-ux",
  "rit-app": "mobile",
  "network-automation": "networking-ai",
  "vehicle-rental": "databases",
  "mood-insights": "product-ux",
  "vr-neuroanatomy": "mobile",
  "giftit-one-table": "marketing",
  "giftit-saudi-market-entry": "marketing"
});

export function createInterestRecord(record = {}, now = Date.now()) {
  const visits = Array.isArray(record.visits) ? record.visits : [];
  const filters = Array.isArray(record.filters) ? record.filters : [];
  const valid = at => Number.isFinite(at) && at <= now && now - at <= INTEREST_RETENTION_MS;
  return {
    v: 1,
    consented: true,
    updatedAt: now,
    explicit: [...new Set((record.explicit || []).filter(category => INTEREST_CATEGORIES.includes(category)))].slice(0, 8),
    visits: visits.filter(item => item && PROJECT_CATEGORY[item.project] && valid(item.at)).slice(-15),
    filters: filters.filter(item => item && INTEREST_CATEGORIES.includes(item.category) && valid(item.at)).slice(-12)
  };
}

export function recordProjectInterest(record, project, now = Date.now()) {
  const normalized = createInterestRecord(record, now);
  if (PROJECT_CATEGORY[project]) normalized.visits.push({ project, at: now });
  return createInterestRecord(normalized, now);
}

export function recordCategoryInterest(record, category, now = Date.now()) {
  const normalized = createInterestRecord(record, now);
  if (INTEREST_CATEGORIES.includes(category)) normalized.filters.push({ category, at: now });
  return createInterestRecord(normalized, now);
}

export function rankProjectsByInterest(projects, record, now = Date.now()) {
  const profile = createInterestRecord(record, now);
  const scoreCategory = category => {
    let score = profile.explicit.includes(category) ? 5 : 0;
    for (const item of profile.filters) if (item.category === category) {
      const age = now - item.at;
      score += 1.1 * (1 - age / INTEREST_RETENTION_MS) + (age <= 14 * 86400000 ? 0.25 : 0);
    }
    for (const item of profile.visits) if (PROJECT_CATEGORY[item.project] === category) {
      const age = now - item.at;
      score += 0.55 * (1 - age / INTEREST_RETENTION_MS) + (age <= 14 * 86400000 ? 0.15 : 0);
    }
    return Math.min(score, 8);
  };
  return [...projects].sort((left, right) =>
    scoreCategory(PROJECT_CATEGORY[right.id]) - scoreCategory(PROJECT_CATEGORY[left.id])
  );
}
