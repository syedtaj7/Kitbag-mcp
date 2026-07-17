import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.unit_convert",
  description: "Convert values between physical or data units (length, mass, temperature, data storage).",
  inputSchema: {
    type: "object",
    properties: {
      value: { type: "number", description: "The numeric value to convert." },
      type: {
        type: "string",
        description: "The measurement type.",
        enum: ["length", "mass", "temperature", "data"]
      },
      from: { type: "string", description: "Source unit (e.g. 'm', 'ft', 'celsius', 'gb')." },
      to: { type: "string", description: "Target unit (e.g. 'km', 'in', 'fahrenheit', 'tb')." }
    },
    required: ["value", "type", "from", "to"]
  },
  handler: async (args: { value: number; type: string; from: string; to: string }) => {
    const value = args.value;
    const type = args.type.toLowerCase();
    const from = args.from.toLowerCase();
    const to = args.to.toLowerCase();

    let convertedValue = 0;

    if (type === 'temperature') {
      let kelvin = 0;
      if (from === 'k' || from === 'kelvin') kelvin = value;
      else if (from === 'c' || from === 'celsius') kelvin = value + 273.15;
      else if (from === 'f' || from === 'fahrenheit') kelvin = (value - 32) * 5/9 + 273.15;
      else throw new Error(`Unknown source unit for temperature: ${from}`);

      if (to === 'k' || to === 'kelvin') convertedValue = kelvin;
      else if (to === 'c' || to === 'celsius') convertedValue = kelvin - 273.15;
      else if (to === 'f' || to === 'fahrenheit') convertedValue = (kelvin - 273.15) * 9/5 + 32;
      else throw new Error(`Unknown target unit for temperature: ${to}`);
    } else if (type === 'length') {
      const lengthMap: Record<string, number> = {
        m: 1, meter: 1, meters: 1,
        km: 1000, kilometer: 1000, kilometers: 1000,
        cm: 0.01, centimeter: 0.01, centimeters: 0.01,
        mm: 0.001, millimeter: 0.001, millimeters: 0.001,
        inch: 0.0254, inches: 0.0254, in: 0.0254,
        ft: 0.3048, foot: 0.3048, feet: 0.3048,
        yd: 0.9144, yard: 0.9144, yards: 0.9144,
        mi: 1609.344, mile: 1609.344, miles: 1609.344
      };

      if (!lengthMap[from] || !lengthMap[to]) {
        throw new Error(`Invalid unit for length: from '${from}' to '${to}'`);
      }
      const meters = value * lengthMap[from];
      convertedValue = meters / lengthMap[to];
    } else if (type === 'mass') {
      const massMap: Record<string, number> = {
        g: 1, gram: 1, grams: 1,
        kg: 1000, kilogram: 1000, kilograms: 1000,
        lb: 453.59237, pound: 453.59237, pounds: 453.59237,
        oz: 28.3495231, ounce: 28.3495231, ounces: 28.3495231
      };

      if (!massMap[from] || !massMap[to]) {
        throw new Error(`Invalid unit for mass: from '${from}' to '${to}'`);
      }
      const grams = value * massMap[from];
      convertedValue = grams / massMap[to];
    } else if (type === 'data') {
      const dataMap: Record<string, number> = {
        b: 1, byte: 1, bytes: 1,
        kb: 1024, kilobyte: 1024, kilobytes: 1024,
        mb: 1024 * 1024, megabyte: 1024 * 1024, megabytes: 1024 * 1024,
        gb: 1024 * 1024 * 1024, gigabyte: 1024 * 1024 * 1024, gigabytes: 1024 * 1024 * 1024,
        tb: 1024 * 1024 * 1024 * 1024, terabyte: 1024 * 1024 * 1024 * 1024, terabytes: 1024 * 1024 * 1024 * 1024
      };

      if (!dataMap[from] || !dataMap[to]) {
        throw new Error(`Invalid unit for data: from '${from}' to '${to}'`);
      }
      const bytes = value * dataMap[from];
      convertedValue = bytes / dataMap[to];
    } else {
      throw new Error(`Unknown conversion type: ${type}`);
    }

    return {
      success: true,
      originalValue: value,
      from,
      to,
      convertedValue: parseFloat(convertedValue.toFixed(6))
    };
  }
};
