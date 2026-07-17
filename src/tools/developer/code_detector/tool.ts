import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.code_detector",
  description: "Detect the programming language of a raw code snippet using heuristic analyzers.",
  inputSchema: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "The raw programming code snippet to analyze."
      }
    },
    required: ["code"]
  },
  handler: async (args: { code: string }) => {
    const text = args.code;
    let language = "unknown";
    let confidence = 0.5;

    const scores = {
      python: 0,
      javascript: 0,
      typescript: 0,
      sql: 0,
      html: 0,
      css: 0,
      cpp: 0,
      java: 0,
      go: 0,
      rust: 0
    };

    if (/def\s+\w+\s*\(.*?\):/.test(text)) scores.python += 3;
    if (/import\s+[\w\d_,\s]+($|\r?\n)/.test(text)) scores.python += 1;
    if (text.includes("print(") && !text.includes("System.out") && !text.includes("console.log")) scores.python += 0.5;
    if (text.includes("elif ") || text.includes(" __name__ ==")) scores.python += 2;

    if (/const\s+\w+\s*=/.test(text)) { scores.javascript += 1.5; scores.typescript += 1.5; }
    if (/let\s+\w+\s*=/.test(text)) { scores.javascript += 1.5; scores.typescript += 1.5; }
    if (text.includes("console.log(")) { scores.javascript += 2; scores.typescript += 2; }
    if (/import\s+.*?\s+from\s+['"].*?['"]/.test(text)) { scores.javascript += 2; scores.typescript += 2; }
    if (text.includes("export default ") || text.includes("module.exports")) { scores.javascript += 2; scores.typescript += 2; }
    
    if (/: \w+(\[\])?\s*=/ .test(text) || text.includes("interface ") || text.includes("type ") || text.includes(" as ")) {
      scores.typescript += 4;
    }

    const sqlKeywords = ["select", "insert", "update", "delete", "create table", "drop table", "alter table", "where", "group by", "order by", "left join", "inner join"];
    const sqlRegex = new RegExp(`\\b(${sqlKeywords.join('|')})\\b`, 'gi');
    const sqlMatches = text.match(sqlRegex);
    if (sqlMatches && sqlMatches.length >= 2) {
      scores.sql += sqlMatches.length * 0.8;
    }

    if (/<\/?[a-z0-9]+(\s+[^>]*)?>/i.test(text)) scores.html += 2;
    if (text.includes("<!DOCTYPE html>") || text.includes("<html>") || text.includes("<div")) scores.html += 3;

    if (/[\w.-]+\s*\{\s*[\w-]+\s*:\s*[^;]+;\s*\}/.test(text)) scores.css += 4;
    if (text.includes("margin:") || text.includes("padding:") || text.includes("color:") || text.includes("background-color:")) scores.css += 1.5;

    if (text.includes("#include <") || text.includes("int main(") || text.includes("std::cout")) scores.cpp += 4;

    if (text.includes("public class ") && text.includes("public static void main")) scores.java += 4;
    if (text.includes("System.out.print")) scores.java += 2;

    if (text.includes("package main") && text.includes("func main()")) scores.go += 5;
    if (text.includes("import (") && text.includes("fmt.")) scores.go += 2;

    if (text.includes("fn main()") || text.includes("let mut ")) scores.rust += 5;
    if (text.includes("println!(")) scores.rust += 2;

    let maxScore = 0;
    let detected = "unknown";
    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detected = lang;
      }
    }

    if (maxScore > 0) {
      language = detected;
      confidence = Math.min(0.5 + (maxScore * 0.1), 0.99);
    }

    return {
      success: true,
      language,
      confidence: parseFloat(confidence.toFixed(2)),
      scores
    };
  }
};
