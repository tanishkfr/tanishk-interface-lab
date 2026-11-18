import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const files = [
  "tests/engine.test.ts",
  "tests/crossbreed.test.ts",
  "tests/protocol.test.ts",
  "tests/placement.test.ts",
  "tests/analysis.test.ts",
  "tests/builder.test.ts",
].map((file) => path.join(root, file));

const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, NODE_NO_WARNINGS: "1" },
});
process.exit(result.status ?? 1);
