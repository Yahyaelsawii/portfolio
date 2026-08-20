import { KNOWLEDGE_VERSION } from "../_shared/profile.js";
import { CONVERSATION_RETENTION_DAYS } from "../_shared/retention.js";

export function onRequestGet({ env }) {
  const privacyControlsReady = Boolean(env.DB && typeof env.LOG_HASH_SECRET === "string" && env.LOG_HASH_SECRET.length >= 32);
  const aiReady = Boolean(env.AI);
  return Response.json({
    ok: true,
    ready: aiReady && privacyControlsReady,
    ai: aiReady,
    logging: Boolean(env.DB),
    privacyHashing: privacyControlsReady,
    atomicRateLimiting: privacyControlsReady,
    conversationRetentionDays: CONVERSATION_RETENTION_DAYS,
    scheduledRetention: true,
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
