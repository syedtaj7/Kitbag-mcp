import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const resultTemp = await tool.handler({
    value: 0,
    type: "temperature",
    from: "celsius",
    to: "fahrenheit"
  });
  assert.strictEqual(resultTemp.convertedValue, 32);

  const resultLen = await tool.handler({
    value: 1,
    type: "length",
    from: "mile",
    to: "meters"
  });
  assert.strictEqual(resultLen.convertedValue, 1609.344);

  const resultData = await tool.handler({
    value: 1,
    type: "data",
    from: "gb",
    to: "mb"
  });
  assert.strictEqual(resultData.convertedValue, 1024);
}
