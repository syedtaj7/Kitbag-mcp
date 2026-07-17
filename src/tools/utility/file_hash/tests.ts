import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const text = "hello";
  
  const resultSha = await tool.handler({ text, algorithm: "sha256" });
  assert.strictEqual(resultSha.success, true);
  assert.strictEqual(resultSha.hash, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");

  const resultMd5 = await tool.handler({ text, algorithm: "md5" });
  assert.strictEqual(resultMd5.hash, "5d41402abc4b2a76b9719d911017c592");
}
