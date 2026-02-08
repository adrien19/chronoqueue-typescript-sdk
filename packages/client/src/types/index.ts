import * as grpc from "@grpc/grpc-js";
import type { Logger } from "../logger";

/**
 * Retry configuration for gRPC operations
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;

  /** Base delay for exponential backoff in milliseconds (default: 100) */
  baseDelay?: number;

  /** Maximum delay cap in milliseconds (default: 10000) */
  maxDelay?: number;

  /** Whether to retry on retryable errors (default: true) */
  enabled?: boolean;
}

/**
 * Health check configuration
 */
export interface HealthCheckOptions {
  /** Enable automatic health checks (default: false) */
  enabled?: boolean;

  /** Interval between health checks in milliseconds (default: 30000) */
  intervalMs?: number;

  /** Enable automatic reconnection on failure (default: true) */
  autoReconnect?: boolean;

  /** Callback when connection health changes */
  onHealthChange?: (healthy: boolean, error?: Error) => void;
}

/**
 * Connection options for establishing a gRPC connection to ChronoQueue server
 */
export interface ConnectionOptions {
  /** Server address (e.g., 'localhost:50051') */
  address: string;

  /** gRPC credentials (default: insecure) */
  credentials?: grpc.ChannelCredentials;

  /** gRPC channel options */
  channelOptions?: grpc.ChannelOptions;

  /** Connection timeout in milliseconds (default: 10000) */
  timeout?: number;

  /** Maximum number of retry attempts for failed requests (default: 3) */
  maxRetries?: number;

  /** Base delay for exponential backoff in milliseconds (default: 100) */
  retryDelay?: number;

  /** Retry configuration for gRPC operations */
  retry?: RetryOptions;

  /** Health check configuration */
  healthCheck?: HealthCheckOptions;
}

/**
 * Client configuration options
 */
export interface ClientConfig {
  /** Connection options for the gRPC client */
  connection: ConnectionOptions;

  /** Default request timeout in milliseconds (default: 30000) */
  requestTimeout?: number;

  /** Optional stable identifier for this worker/consumer instance.
   *  If provided, this workerId will be used in all message operations. */
  workerId?: string;

  /** Optional logger instance for SDK logging. Defaults to ConsoleLogger with WARN level.
   *  Set to SilentLogger to disable all logging. */
  logger?: Logger;
}

/**
 * ChronoQueue error codes
 */
export enum ErrorCode {
  // Client errors

  // eslint-disable-next-line no-unused-vars
  INVALID_ARGUMENT = "INVALID_ARGUMENT",
  // eslint-disable-next-line no-unused-vars
  NOT_FOUND = "NOT_FOUND",
  // eslint-disable-next-line no-unused-vars
  ALREADY_EXISTS = "ALREADY_EXISTS",
  // eslint-disable-next-line no-unused-vars
  PERMISSION_DENIED = "PERMISSION_DENIED",
  // eslint-disable-next-line no-unused-vars
  RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED",

  // Server errors

  // eslint-disable-next-line no-unused-vars
  INTERNAL = "INTERNAL",
  // eslint-disable-next-line no-unused-vars
  UNAVAILABLE = "UNAVAILABLE",
  // eslint-disable-next-line no-unused-vars
  DEADLINE_EXCEEDED = "DEADLINE_EXCEEDED",

  // Connection errors

  // eslint-disable-next-line no-unused-vars
  CONNECTION_FAILED = "CONNECTION_FAILED",
  // eslint-disable-next-line no-unused-vars
  CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",
}

/**
 * ChronoQueue client error
 */
export class ChronoQueueError extends Error {
  constructor(
    // eslint-disable-next-line no-unused-vars
    public code: ErrorCode,
    message: string,
    // eslint-disable-next-line no-unused-vars
    public cause?: Error,
  ) {
    super(message);
    this.name = "ChronoQueueError";
    Object.setPrototypeOf(this, ChronoQueueError.prototype);
  }
}
