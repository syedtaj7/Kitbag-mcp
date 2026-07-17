import { format } from 'sql-formatter';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.sql_formatter",
  description: "Format SQL queries to improve readability. Supports dialects like sql, mysql, postgresql, sqlite, plsql.",
  inputSchema: {
    type: "object",
    properties: {
      sql: {
        type: "string",
        description: "The raw SQL statement to format."
      },
      dialect: {
        type: "string",
        description: "The SQL dialect/language family to format for.",
        enum: ["sql", "mysql", "postgresql", "sqlite", "plsql", "tsql"],
        default: "sql"
      }
    },
    required: ["sql"]
  },
  handler: async (args: { sql: string; dialect?: string }) => {
    const dialect = args.dialect || 'sql';
    try {
      const formatted = format(args.sql, {
        language: dialect as any,
        tabWidth: 2,
        keywordCase: 'upper'
      });
      return {
        success: true,
        formatted
      };
    } catch (e: any) {
      throw new Error(`SQL formatting failed: ${e.message}`);
    }
  }
};
