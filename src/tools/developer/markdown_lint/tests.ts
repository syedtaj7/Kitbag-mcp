import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const markdown = "## Bad Header\n\n\n\nSome text with trailing space \n```typescript\nconst a = 1;";
  const result = await tool.handler({ markdown });
  
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.isValid, false);
  assert.ok(result.violationCount >= 4);
  
  const badHeaderViolation = result.violations.find((v: any) => v.rule === "MD002");
  assert.ok(badHeaderViolation, "Should flag non-h1 first header");
  
  const trailingSpaceViolation = result.violations.find((v: any) => v.rule === "MD003");
  assert.ok(trailingSpaceViolation, "Should flag trailing space");
}
