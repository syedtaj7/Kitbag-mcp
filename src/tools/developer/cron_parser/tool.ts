import { CronExpressionParser } from 'cron-parser';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.cron_parser",
  description: "Parse a cron expression to validate it, explain its scheduling, and list its next execution dates.",
  inputSchema: {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "The 5-field or 6-field cron expression to parse (e.g. '*/5 * * * *')."
      },
      iterations: {
        type: "number",
        description: "Number of upcoming execution times to calculate. Defaults to 5.",
        default: 5
      }
    },
    required: ["expression"]
  },
  handler: async (args: { expression: string; iterations?: number }) => {
    const expr = args.expression.trim();
    const iter = args.iterations ?? 5;

    try {
      const tempInterval = CronExpressionParser.parse(expr);
      const nextDates: string[] = [];
      for (let i = 0; i < iter; i++) {
        const nextDate = tempInterval.next().toISOString();
        if (nextDate) {
          nextDates.push(nextDate);
        }
      }

      return {
        success: true,
        expression: expr,
        isValid: true,
        nextExecutions: nextDates
      };
    } catch (e: any) {
      throw new Error(`Invalid cron expression: ${e.message}`);
    }
  }
};
