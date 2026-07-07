import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { expect } from "vitest";
import { ghostExpectedPath } from "./paths.js";
import { stableStringify } from "./stable-json.js";

const updateGhosts = process.env.UPDATE_GHOSTS === "1";

export function assertGhostCaseMatch(caseDir: string, actual: unknown): void {
  const path = ghostExpectedPath(caseDir);
  const actualJson = stableStringify(actual);

  if (updateGhosts) {
    writeFileSync(path, actualJson, "utf8");
    return;
  }

  if (!existsSync(path)) {
    throw new Error(
      `Ghost file missing: ${path}\nRun: pnpm test:ghost:update`,
    );
  }

  const expectedJson = readFileSync(path, "utf8");
  expect(actualJson).toBe(expectedJson);
}
