import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const spec = `
    openapi: 3.0.1
    info:
      title: Users Service
      version: 2.1.0
    paths:
      /users/{id}:
        get:
          summary: Fetch a single user details
          operationId: getUser
        put:
          summary: Update user
          operationId: updateUser
  `;

  const result = await tool.handler({ spec });
  assert.strictEqual(result.title, "Users Service");
  assert.strictEqual(result.version, "2.1.0");
  assert.strictEqual(result.endpointCount, 2);
  assert.strictEqual(result.endpoints[0].path, "/users/{id}");
  assert.strictEqual(result.endpoints[0].method, "GET");
  assert.strictEqual(result.endpoints[0].operationId, "getUser");
}
