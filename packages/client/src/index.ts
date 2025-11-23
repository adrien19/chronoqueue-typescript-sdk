/**
 * ChronoQueue Client - Main entry point
 */

export { ChronoQueueClient } from "./client";
export { MessageClient } from "./message";
export { QueueClient } from "./queue";
export { ScheduleClient } from "./schedule";
export { SchemaClient } from "./schema";
export {
  ChronoQueueError,
  ClientConfig,
  ConnectionOptions,
  ErrorCode,
} from "./types";

// Re-export proto types for convenience
export {
  Message,
  Queue,
  QueueServiceTypes,
  Schedule,
  Schema,
} from "@chronoqueue/proto";
export type { Duration } from "@chronoqueue/proto";

// Re-export utilities
export { durationToMs, msToDuration, parseDuration } from "./utils/duration";
export {
  validateNonNegative,
  validatePositive,
  validateRange,
  validateRequired,
} from "./utils/errors";
