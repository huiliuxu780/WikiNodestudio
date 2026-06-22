import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const rootDir = path.resolve(import.meta.dirname, "../..");
const checkScript = readFileSync(path.join(rootDir, "scripts/check.sh"), "utf8");

test("check.sh runs scripts/tests through a dynamic test set", () => {
  assert.match(
    checkScript,
    /find scripts\/tests -maxdepth 1 -name '\*\.test\.mjs'/,
  );
  assert.match(checkScript, /node --test "\$\{script_tests\[@\]\}"/);
});
