import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

export const ghostRoot = join(packageRoot, "ghost");

export function ghostCaseDir(caseName: string): string {
  return join(ghostRoot, caseName);
}

export function ghostExpectedPath(caseDir: string): string {
  return join(caseDir, "expected.json");
}
