import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const regex = "(\\w+)@(\\w+\\.\\w+)";
  const text = "email is alice@example.com";
  
  // Test basic global match
  const result = await tool.handler({ regex, text });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.hasMatch, true);
  assert.strictEqual(result.matchCount, 1);
  assert.strictEqual(result.matches[0].match, "alice@example.com");
  assert.deepStrictEqual(result.matches[0].groups, ["alice", "example.com"]);

  // Test invalid regex pattern
  await assert.rejects(
    async () => {
      await tool.handler({ regex: "[", text: "abc" });
    },
    /Invalid regular expression/
  );

  // Test flags without 'g'
  const resultNoG = await tool.handler({ regex: "alice", text: "alice and alice", flags: "i" });
  assert.strictEqual(resultNoG.matchCount, 1);

  // Test no match
  const resultNoMatch = await tool.handler({ regex: "charlie", text: "alice" });
  assert.strictEqual(resultNoMatch.hasMatch, false);

  // Test zero-width match
  const resultZeroWidth = await tool.handler({ regex: "^", text: "abc" });
  assert.strictEqual(resultZeroWidth.matchCount, 1);
}
