import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const pythonCode = "def solve_problem(n):\n    if n == 0: return 1\n    return n * solve_problem(n-1)";
  const resultPy = await tool.handler({ code: pythonCode });
  assert.strictEqual(resultPy.language, "python");
  assert.ok(resultPy.confidence > 0.6);

  const sqlCode = "SELECT name, age FROM users WHERE id = 100 GROUP BY age;";
  const resultSql = await tool.handler({ code: sqlCode });
  assert.strictEqual(resultSql.language, "sql");

  const tsCode = "interface User {\n  id: number;\n  name: string;\n}\nconst u: User = { id: 1, name: 'Alice' };";
  const resultTs = await tool.handler({ code: tsCode });
  assert.strictEqual(resultTs.language, "typescript");
}
