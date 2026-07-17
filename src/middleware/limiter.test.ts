import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import { LimitExceededError, TimeoutError, validateBase64Size, validateFileSize, withTimeout } from './limiter.js';

describe('middleware.limiter', () => {
  it('resolves before timeout', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 50)).resolves.toBe('ok');
  });

  it('rejects with a timeout error when the promise takes too long', async () => {
    await expect(withTimeout(new Promise((resolve) => setTimeout(resolve, 50)), 1)).rejects.toBeInstanceOf(TimeoutError);
  });

  it('validates file size and throws when the file is too large', () => {
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const statSpy = vi.spyOn(fs, 'statSync').mockReturnValue({ size: 11 } as fs.Stats);

    expect(() => validateFileSize('example.txt', 10)).toThrow(LimitExceededError);

    existsSpy.mockRestore();
    statSpy.mockRestore();
  });

  it('validates base64 payload size', () => {
    expect(() => validateBase64Size('a'.repeat(20), 10)).toThrow(LimitExceededError);
    expect(() => validateBase64Size('a'.repeat(8), 10)).not.toThrow();
  });
});
