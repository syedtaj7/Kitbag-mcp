import { describe, it, expect } from 'vitest';
import { tool } from './tool.js';

describe('utility.url_parser', () => {
  it('parses a URL and groups repeated query params', async () => {
    const result = await tool.handler({
      url: 'https://example.com:8443/path/name?tag=one&tag=two&mode=test#section'
    });

    expect(result.success).toBe(true);
    expect(result.href).toBe('https://example.com:8443/path/name?tag=one&tag=two&mode=test#section');
    expect(result.protocol).toBe('https:');
    expect(result.hostname).toBe('example.com');
    expect(result.port).toBe('8443');
    expect(result.pathname).toBe('/path/name');
    expect(result.hash).toBe('#section');
    expect(result.searchParams).toEqual({
      tag: ['one', 'two'],
      mode: 'test'
    });
  });
});