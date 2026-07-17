import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const xml = `
    <root version="1.0">
      <user id="101">
        <name>Alice</name>
        <roles>
          <role>Dev</role>
          <role>Admin</role>
        </roles>
      </user>
    </root>
  `;

  const result = await tool.handler({ xml });
  assert.ok(result.root);
  assert.strictEqual(result.root["@version"], "1.0");
  assert.strictEqual(result.root.user.name, "Alice");
  assert.strictEqual(result.root.user["@id"], "101");
  assert.deepStrictEqual(result.root.user.roles.role, ["Dev", "Admin"]);
}
