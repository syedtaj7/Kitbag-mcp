import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const text = "Paragraph 1 is here.\n\nParagraph 2 is here. It has multiple sentences. sentence 2.\n\nParagraph 3 is here.";

  // Test paragraph strategy
  const result = await tool.handler({ text, chunkSize: 80, chunkOverlap: 10, strategy: "paragraph" });
  assert.strictEqual(result.count, 3);
  assert.strictEqual(result.chunks[0].content, "Paragraph 1 is here.");
  assert.strictEqual(result.chunks[1].content, "Paragraph 2 is here. It has multiple sentences. sentence 2.");
  assert.strictEqual(result.chunks[2].content, "Paragraph 3 is here.");

  // Test sentence strategy
  const resultSentence = await tool.handler({ text, chunkSize: 60, chunkOverlap: 10, strategy: "sentence" });
  assert.ok(resultSentence.count >= 2);

  // Test character strategy
  const resultChar = await tool.handler({ text, chunkSize: 20, chunkOverlap: 5, strategy: "character" });
  assert.ok(resultChar.count > 5);
}
