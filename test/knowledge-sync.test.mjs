import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../data/projects.js";
import { KNOWLEDGE_VERSION, PROFILE, SOURCES } from "../functions/_shared/profile.js";

test("public AI project knowledge is generated from all twelve public project records", () => {
  assert.equal(PROFILE.projects.length, projects.length);
  for (const project of projects) {
    const generated = PROFILE.projects.find(item => item.name === project.title);
    assert.ok(generated, `Missing AI project knowledge: ${project.id}`);
    assert.ok(SOURCES[generated.evidence], `Missing project evidence source: ${project.id}`);
    assert.equal(SOURCES[generated.evidence].url, project.url);
    if (project.locked) {
      assert.deepEqual(Object.keys(generated).sort(), ["evidence", "locked", "name", "status"]);
    } else {
      assert.equal(generated.role, project.role);
      assert.equal(generated.focus, project.summary);
    }
  }
  assert.match(KNOWLEDGE_VERSION, /^2026-10-28\.1$/);
});
