import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const rootDir = path.resolve(import.meta.dirname, "../..");
const checkStateScript = path.join(rootDir, "scripts/check-state.sh");

function createStateRoot({ projectContext, storyQueue, activeTasks, traceIndex } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "harness-state-check-"));

  mkdirSync(path.join(dir, "docs/current"), { recursive: true });
  mkdirSync(path.join(dir, "docs/registry"), { recursive: true });
  mkdirSync(path.join(dir, "docs/raw"), { recursive: true });

  writeFileSync(
    path.join(dir, "docs/current/PROJECT_CONTEXT.md"),
    projectContext ?? "# Project Context\n",
  );
  writeFileSync(path.join(dir, "docs/current/BLOCKERS.md"), "# Blockers\n");
  writeFileSync(path.join(dir, "docs/raw/source.md"), "# Source\n");
  writeFileSync(
    path.join(dir, "docs/registry/DECISION_INDEX.yaml"),
    "version: 1\n",
  );
  writeFileSync(
    path.join(dir, "docs/current/STORY_QUEUE.yaml"),
    storyQueue ??
      [
        "version: 1",
        "stories:",
        "  - id: US900",
        "    status: ready",
        "",
      ].join("\n"),
  );
  writeFileSync(
    path.join(dir, "docs/current/ACTIVE_TASKS.yaml"),
    activeTasks ??
      [
        "version: 1",
        "tasks:",
        "  - id: H900",
        "    story_ids: [US900]",
        "",
      ].join("\n"),
  );
  writeFileSync(
    path.join(dir, "docs/registry/TRACE_INDEX.yaml"),
    traceIndex ??
      [
        "version: 1",
        "current_files:",
        "  project_context: docs/current/PROJECT_CONTEXT.md",
        "  story_queue: docs/current/STORY_QUEUE.yaml",
        "  active_tasks: docs/current/ACTIVE_TASKS.yaml",
        "  blockers: docs/current/BLOCKERS.md",
        "tasks:",
        "  H900:",
        "    file: docs/raw/source.md",
        "",
      ].join("\n"),
  );

  return dir;
}

function runCheckState(stateRoot, args = []) {
  return spawnSync("bash", [checkStateScript, ...args], {
    cwd: rootDir,
    encoding: "utf8",
    env: {
      ...process.env,
      HARNESS_STATE_ROOT: stateRoot,
    },
  });
}

test("check-state strict mode passes for a consistent current state", () => {
  const stateRoot = createStateRoot();
  const result = runCheckState(stateRoot, ["--strict"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /check-state passed in strict mode/);
});

test("check-state strict mode fails when ready story has no active task", () => {
  const stateRoot = createStateRoot({
    activeTasks: "version: 1\ntasks: []\n",
  });
  const result = runCheckState(stateRoot, ["--strict"]);

  assert.notEqual(result.status, 0, "expected strict mode to fail");
  assert.match(result.stdout, /ready story US900 has no matching active task/);
});

test("check-state strict mode rejects lifecycle state in trace index", () => {
  const stateRoot = createStateRoot({
    traceIndex: [
      "version: 1",
      "tasks:",
      "  H900:",
      "    file: docs/raw/source.md",
      "    status: ready",
      "",
    ].join("\n"),
  });
  const result = runCheckState(stateRoot, ["--strict"]);

  assert.notEqual(result.status, 0, "expected strict mode to fail");
  assert.match(result.stdout, /TRACE_INDEX.yaml must not contain/);
});

test("check-state strict mode rejects done history in current files", () => {
  const stateRoot = createStateRoot({
    storyQueue: [
      "version: 1",
      "stories:",
      "  - id: US900",
      "    status: done",
      "",
    ].join("\n"),
  });
  const result = runCheckState(stateRoot, ["--strict"]);

  assert.notEqual(result.status, 0, "expected strict mode to fail");
  assert.match(result.stdout, /must not retain done story history/);
});

test("check-state strict mode rejects accumulated done-history markers in project context", () => {
  const stateRoot = createStateRoot({
    projectContext: [
      "# Project Context",
      "",
      "`US900/IM900` completed the first historical slice, then current queue returned to empty.",
      "`US901/IM901` completed the second historical slice, then current queue returned to empty.",
      "`US902/IM902` completed the third historical slice, then current queue returned to empty.",
      "`US903/IM903` completed the fourth historical slice, then current queue returned to empty.",
      "",
    ].join("\n"),
  });
  const result = runCheckState(stateRoot, ["--strict"]);

  assert.notEqual(result.status, 0, "expected strict mode to fail");
  assert.match(
    result.stdout,
    /PROJECT_CONTEXT.md contains accumulated done-history markers/,
  );
});
