import fs from 'fs';

export class TimeoutError extends Error {
  constructor(message = 'Tool execution timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class LimitExceededError extends Error {
  constructor(message = 'Resource limit exceeded') {
    super(message);
    this.name = 'LimitExceededError';
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(`Tool execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

export function validateFileSize(filePath: string, maxBytes: number): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const stats = fs.statSync(filePath);
  if (stats.size > maxBytes) {
    throw new LimitExceededError(
      `File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of ${(
        maxBytes / 1024 / 1024
      ).toFixed(2)}MB`
    );
  }
}

export function validateBase64Size(base64Str: string, maxBytes: number): void {
  // Approximate raw byte size: length * 0.75
  const approxBytes = base64Str.length * 0.75;
  if (approxBytes > maxBytes) {
    throw new LimitExceededError(
      `Base64 payload size (${(approxBytes / 1024 / 1024).toFixed(
        2
      )}MB) exceeds maximum limit of ${(maxBytes / 1024 / 1024).toFixed(2)}MB`
    );
  }
}
