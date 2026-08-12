import { KNOWLEDGE_VERSION } from "../_shared/profile.js";

export function onRequestGet({ env }) {
  return Response.json({
    ok: true,
    ai: Boolean(env.AI),
    logging: Boolean(env.DB),
    privacyHashing: Boolean(env.LOG_HASH_SECRET),
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
