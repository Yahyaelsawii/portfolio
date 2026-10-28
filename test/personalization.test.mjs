import assert from "node:assert/strict";
import test from "node:test";
import { createInterestRecord, rankProjectsByInterest, recordProjectInterest, INTEREST_CATEGORIES } from "../personalization.js";

const projects = [
  { id: "gift-it", title: "Checkout" },
  { id: "network-automation", title: "Network automation" },
  { id: "vehicle-rental", title: "Vehicle database" }
];

test("personalization records only approved bounded categories and known public projects", () => {
  const now = 1_800_000_000_000;
  const record = createInterestRecord({
    explicit: ["product-ux", "private-profile", "product-ux"],
    visits: [{ project: "gift-it", at: now }, { project: "private-route", at: now }, { project: "vehicle-rental", at: now - 181 * 86400000 }]
  }, now);
  assert.deepEqual(record.explicit, ["product-ux"]);
  assert.deepEqual(record.visits, [{ project: "gift-it", at: now }]);
  assert.equal(INTEREST_CATEGORIES.includes("product-ux"), true);
});

test("explicit interests outweigh modest opens and recent opens outweigh old ones", () => {
  const now = 1_800_000_000_000;
  const explicit = { v: 1, consented: true, explicit: ["networking-ai"], visits: [{ project: "gift-it", at: now }] };
  assert.deepEqual(rankProjectsByInterest(projects, explicit, now).map(project => project.id), ["network-automation", "gift-it", "vehicle-rental"]);
  const recent = recordProjectInterest({ v: 1, consented: true, visits: [] }, "vehicle-rental", now);
  assert.deepEqual(rankProjectsByInterest(projects, recent, now).map(project => project.id), ["vehicle-rental", "gift-it", "network-automation"]);
});

test("expired project opens cannot affect future recommendations", () => {
  const now = 1_800_000_000_000;
  const record = { v: 1, consented: true, explicit: [], visits: [{ project: "network-automation", at: now - 181 * 86400000 }] };
  assert.deepEqual(rankProjectsByInterest(projects, record, now).map(project => project.id), projects.map(project => project.id));
});
