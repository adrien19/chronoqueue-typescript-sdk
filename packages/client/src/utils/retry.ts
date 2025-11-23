import { setTimeout as setTimeoutPromise } from "timers/promises";
import { ChronoQueueError, ErrorCode } from "../types";

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;

  /** Base delay in milliseconds */
  baseDelay: number;

  /** Maximum delay in milliseconds */
  maxDelay?: number;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof ChronoQueueError) {
    return (
      error.code === ErrorCode.UNAVAILABLE ||
      error.code === ErrorCode.DEADLINE_EXCEEDED ||
      error.code === ErrorCode.INTERNAL
    );
  }
  return false;
}

/**
 * Calculate exponential backoff delay with jitter
 */
export function calculateBackoff(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * config.baseDelay;
  const delay = exponentialDelay + jitter;

  if (config.maxDelay !== undefined) {
    return Math.min(delay, config.maxDelay);
  }

  return delay;
}

/**
 * Sleep for specified milliseconds
 */
export async function sleep(ms: number): Promise<void> {
  await setTimeoutPromise(ms);
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === config.maxRetries || !isRetryableError(lastError)) {
        throw lastError;
      }

      const delay = calculateBackoff(attempt, config);
      await sleep(delay);
    }
  }

  throw lastError!;
}
