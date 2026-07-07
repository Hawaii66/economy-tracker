import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "vitest";
import {
  assertGhostCaseMatch,
  ghostCaseDir,
  ghostRoot,
  replaySequence,
  type GhostSetupModule,
} from "../helpers/ghost/index.js";

function discoverGhostCases(): string[] {
  return readdirSync(ghostRoot)
    .filter((name) => {
      const caseDir = join(ghostRoot, name);
      return (
        statSync(caseDir).isDirectory() &&
        existsSync(join(caseDir, "setup.ts"))
      );
    })
    .sort();
}

describe("ghost tests", () => {
  for (const caseName of discoverGhostCases()) {
    it(caseName, async () => {
      const setupPath = pathToFileURL(
        join(ghostCaseDir(caseName), "setup.ts"),
      ).href;
      const { events } = (await import(setupPath)) as GhostSetupModule;
      const state = replaySequence(events);

      assertGhostCaseMatch(ghostCaseDir(caseName), { state });
    });
  }
});
