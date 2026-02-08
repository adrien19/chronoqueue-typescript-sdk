/**
 * ChronoQueue Client - Main entry point
 */

export { ChronoQueueClient } from "./client";
export { Connection, ConnectionState } from "./connection";
export { DLQClient, type DLQStats } from "./dlq";
export { MessageClient } from "./message";
export type { HeartbeatHealth } from "./message";
export { QueueClient } from "./queue";
export { ScheduleClient } from "./schedule";
export { SchemaClient } from "./schema";
export {
  ChronoQueueError,
  ClientConfig,
  ConnectionOptions,
  ErrorCode,
  type HealthCheckOptions,
  type RetryOptions,
} from "./types";

// Re-export logger types
export {
  ConsoleLogger,
  defaultLogger,
  LogLevel,
  SilentLogger,
  type Logger,
} from "./logger";

// Re-export retry utilities
export {
  calculateBackoff,
  isRetryableError,
  retryOperation,
  type RetryConfig,
} from "./utils/retry";

// Re-export duration utilities
export { durationToMs, msToDuration, parseDuration } from "./utils/duration";

// Re-export proto types for convenience
export {
  Message,
  Queue,
  QueueServiceTypes,
  Schedule,
  Schema,
} from "@chronoqueue/proto";
export type { Duration, LeasePolicy } from "@chronoqueue/proto";

// Re-export Queue-specific types for easier access
// MessageRetentionPolicy and MessageRetentionPolicy_Mode are available via Queue namespace
// Example: Queue.MessageRetentionPolicy, Queue.MessageRetentionPolicy_Mode

// Re-export Bulk Message Posting types for easier access
export {
  PostMessagesBulkResponse_MessagePostResult_ErrorCode as BulkMessageErrorCode,
  PostMessagesBulkRequest_TransactionMode as TransactionMode,
} from "@chronoqueue/proto/lib/generated/proto/queueservice/v1/request_response";
export type {
  PostMessagesBulkResponse_MessagePostResult as MessagePostResult,
  PostMessagesBulkRequest,
  PostMessagesBulkResponse,
} from "@chronoqueue/proto/lib/generated/proto/queueservice/v1/request_response";

// Re-export error utilities
export {
  validateNonNegative,
  validatePositive,
  validateRange,
  validateRequired,
} from "./utils/errors";
