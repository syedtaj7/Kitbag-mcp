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

  // Test invalid JSON
  await assert.rejects(
    async () => {
      await tool.handler({ jsonData: "{invalid" });
    },
    /Failed to parse input as JSON/
  );

  // Test text escape and _text node
  const resultTextNode = await tool.handler({
    jsonData: JSON.stringify({
      item: {
        "@category": "books",
        title: "A & B < C > D ' E \" F",
        _text: "content details"
      }
    })
  });
  assert.ok(resultTextNode.xml.includes('category="books"'));
  assert.ok(resultTextNode.xml.includes('&amp;'));
  assert.ok(resultTextNode.xml.includes('&lt;'));
  assert.ok(resultTextNode.xml.includes('&gt;'));
  assert.ok(resultTextNode.xml.includes('&apos;'));
  assert.ok(resultTextNode.xml.includes('&quot;'));
  assert.ok(resultTextNode.xml.includes('content details</item>'));

  // Test null/empty values and rootName
  const resultNull = await tool.handler({
    jsonData: JSON.stringify({ name: null, emptyObj: {} }),
    rootName: "customRoot"
  });
  assert.ok(resultNull.xml.includes('<name/>'));
  assert.ok(resultNull.xml.includes('<emptyObj/>'));
  assert.ok(resultNull.xml.includes('<customRoot>'));

  // Test primitive type at root
  const resultPrimitive = await tool.handler({
    jsonData: JSON.stringify("hello"),
    rootName: "p"
  });
  assert.ok(resultPrimitive.xml.includes('<p>hello</p>'));
}
