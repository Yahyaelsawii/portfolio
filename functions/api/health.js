import { KNOWLEDGE_VERSION } from "../_shared/profile.js";

export function onRequestGet({ env }) {
  const privacyControlsReady = Boolean(env.DB && typeof env.LOG_HASH_SECRET === "string" && env.LOG_HASH_SECRET.length >= 32);
  return Response.json({
    ok: true,
    ai: Boolean(env.AI),
    logging: Boolean(env.DB),
    privacyHashing: privacyControlsReady,
    atomicRateLimiting: privacyControlsReady,
    conversationRetentionDays: 90,
    model: "@cf/meta/llama-3.1-8b-instruct-fast",
    fallbackModel: "@cf/ibm-granite/granite-4.0-h-micro",
    knowledgeVersion: KNOWLEDGE_VERSION
  }, {
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff"
    }
  });
}
