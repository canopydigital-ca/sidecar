import { readFileSync } from "fs";
import { resolve } from "path";

const bundlePath = resolve(process.cwd(), "dist/content.js");
console.log(`Verifying bundle at ${bundlePath}...`);

try {
  const content = readFileSync(bundlePath, "utf-8");
  const forbidden = [
    "__cgptDockSelfTest", 
    "registerSelfTest", 
    "selftest"
  ];
  const found: string[] = [];

  for (const term of forbidden) {
    if (content.includes(term)) {
      found.push(term);
    }
  }

  if (found.length > 0) {
    console.error("❌ Bundle contains forbidden strings (likely dev code leaked):");
    found.forEach(f => console.error(`   - ${f}`));
    process.exit(1);
  }

  console.log("✅ Bundle verification passed!");
} catch (e) {
  console.error("❌ Failed to read bundle:", e);
  process.exit(1);
}
