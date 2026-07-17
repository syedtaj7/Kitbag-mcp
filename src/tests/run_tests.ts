import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findTestFiles(dir: string): Promise<string[]> {
  const testFiles: string[] = [];
  if (!fs.existsSync(dir)) return testFiles;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      testFiles.push(...(await findTestFiles(fullPath)));
    } else if (entry.name === 'tests.ts' || entry.name === 'tests.js') {
      testFiles.push(fullPath);
    }
  }

  return testFiles;
}

async function runAllTests() {
  const toolsDir = path.join(__dirname, '../tools');
  console.log("Discovering unit tests in tools...");
  const testFiles = await findTestFiles(toolsDir);
  console.log(`Found ${testFiles.length} test files to run.\n`);

  let passed = 0;
  let failed = 0;

  for (const file of testFiles) {
    const relativePath = path.relative(toolsDir, file);
    console.log(`Running tests for: ${relativePath}`);
    try {
      const fileUrl = `file://${file.replace(/\\/g, '/')}`;
      const module = await import(fileUrl);
      if (typeof module.runTests === 'function') {
        await module.runTests();
        console.log(`✅ Passed: ${relativePath}\n`);
        passed++;
      } else {
        console.log(`⚠️  Skipped: ${relativePath} (No runTests function exported)\n`);
      }
    } catch (e: any) {
      console.error(`❌ Failed: ${relativePath}`);
      console.error(e.stack || e);
      console.error("\n");
      failed++;
    }
  }

  console.log("----------------------------------------");
  console.log(`Test Execution Finished:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log("----------------------------------------");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((e) => {
  console.error("Test runner failed fatally:", e);
  process.exit(1);
});
