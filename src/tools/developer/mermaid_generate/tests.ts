import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const result = await tool.handler({
    type: "sequence",
    title: "Demo",
    elements: ["Alice->>Bob: Ping", "Bob-->>Alice: Pong"]
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.diagram.includes("title: Demo"));
  assert.ok(result.diagram.includes("sequenceDiagram"));
  assert.ok(result.diagram.includes("Alice->>Bob: Ping"));
}
