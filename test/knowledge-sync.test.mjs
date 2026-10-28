import assert from "node:assert/strict";
import test from "node:test";
import career from "../data/career.json" with { type:"json" };
import { projects } from "../data/projects.js";
import { buildKnowledgeVersion, KNOWLEDGE_VERSION, PROFILE, SOURCES } from "../functions/_shared/profile.js";

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
  assert.equal(PROFILE.identity.summary, career.summary);
  assert.equal(PROFILE.education.awarded, career.education.awarded);
  assert.equal(PROFILE.availability.remote, career.remoteWorkOpen);
  assert.equal(PROFILE.availability.relocation, career.relocationOpen);
  for (const role of career.experience) {
    const generated = PROFILE.experience.find(item => item.organization === role.company);
    assert.ok(generated, `Missing AI career knowledge: ${role.company}`);
    assert.equal(generated.role, role.role);
    assert.equal(generated.timeline.replace(/\.$/, ""), role.date);
    assert.equal(generated.work, role.description);
  }
  assert.equal(KNOWLEDGE_VERSION, buildKnowledgeVersion({ careerProfile:career, projectRecords:projects }));
  assert.match(KNOWLEDGE_VERSION, /^profile-[a-f0-9]{8}$/);
  assert.notEqual(KNOWLEDGE_VERSION, buildKnowledgeVersion({ careerProfile:{ ...career, summary:`${career.summary} Updated.` }, projectRecords:projects }));
});
