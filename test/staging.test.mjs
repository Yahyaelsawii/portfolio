import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

test("staging blocks API calls even if production bindings were attached", async () => {
  for (const hostname of ["stg.yahyaelsawi.website", "staging.yahya-elsawi-portfolio-bnj.pages.dev"]) {
    const response = await onRequest({
      request: new Request(`https://${hostname}/api/contact`, { method: "POST" }),
      env: { DB: {}, AI: {} },
      next: () => { throw new Error("API must not run"); }
    });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("production Function routes pass through", async () => {
  const marker = new Response("production");
  const response = await onRequest({
    request: new Request("https://yahyaelsawi.website/api/health"),
    env: {}, next: () => marker
  });
  assert.equal(response, marker);
});
