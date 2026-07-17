import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const jsonData = JSON.stringify({
    user: {
      "@status": "active",
      name: "Alice",
      roles: {
        role: ["Dev", "Admin"]
      }
    }
  });

  const result = await tool.handler({ jsonData });
  assert.ok(result.xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(result.xml.includes('<user status="active">'));
  assert.ok(result.xml.includes('<name>Alice</name>'));
  assert.ok(result.xml.includes('<role>Dev</role>'));
  assert.ok(result.xml.includes('<role>Admin</role>'));
}
