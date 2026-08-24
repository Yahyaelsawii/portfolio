import { KNOWLEDGE_VERSION } from "../_shared/profile.js";
import { CONVERSATION_RETENTION_DAYS } from "../_shared/retention.js";
import { publicCorsHeaders, publicPreflightResponse } from "../_shared/cors.js";

export function onRequestGet({ env }) {
  const privacyControlsReady = Boolean(env.DB && typeof env.LOG_HASH_SECRET === "string" && env.LOG_HASH_SECRET.length >= 32);
  const aiReady = Boolean(env.AI);
  const contactReady = Boolean(
    (env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL && env.ADMIN_EMAIL)
    || (typeof env.CONTACT_FORM_ENDPOINT === "string" && /^https:\/\/formsubmit\.co\/ajax\/[a-z0-9]+$/i.test(env.CONTACT_FORM_ENDPOINT))
  );
  return Response.json({
    ok: true,
    ready: aiReady && privacyControlsReady && contactReady,
    ai: aiReady,
    contactDelivery: contactReady,
    logging: Boolean(env.DB),
    privacyHashing: privacyControlsReady,
    atomicRateLimiting: privacyControlsReady,
    conversationRetentionDays: CONVERSATION_RETENTION_DAYS,
    scheduledRetention: true,
    model: "@cf/openai/gpt-oss-120b",
    fallbackModel: "@cf/openai/gpt-oss-20b",
    knowledgeVersion: KNOWLEDGE_VERSION
  }, {
    headers: publicCorsHeaders({
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff"
    })
  });
}

export function onRequestOptions({ request }) {
  return publicPreflightResponse(request, "GET, OPTIONS");
}
