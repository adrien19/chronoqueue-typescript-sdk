import * as grpc from "@grpc/grpc-js";

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
}

/**
 * Client configuration options
 */
export interface ClientConfig {
  /** Connection options for the gRPC client */
  connection: ConnectionOptions;

  /** Default request timeout in milliseconds (default: 30000) */
  requestTimeout?: number;
}

/**
 * Options for queue creation
 */
export interface CreateQueueOptions {
  /** Queue name (required) */
  name: string;

  /** Queue type (default: FIFO) */
  type?: "FIFO" | "PRIORITY" | "DELAY";

  /** Fairness policy for priority queues (default: STRICT) */
  fairnessPolicy?: "STRICT" | "WEIGHTED_ROUND_ROBIN";

  /** Message retention period in seconds (default: 86400 = 1 day) */
  messageRetentionPeriod?: number;

  /** Maximum message size in bytes (default: 262144 = 256KB) */
  maxMessageSize?: number;

  /** Maximum queue size (number of messages) */
  maxQueueSize?: number;

  /** Delivery attempt limit before DLQ (default: 3) */
  deliveryAttemptLimit?: number;

  /** Dead letter queue name */
  deadLetterQueue?: string;

  /** Enable deduplication */
  enableDeduplication?: boolean;

  /** Deduplication window in seconds */
  deduplicationWindow?: number;

  /** Initial queue state (default: ACTIVE) */
  initialState?: "ACTIVE" | "PAUSED";
}

/**
 * Options for queue updates
 */
export interface UpdateQueueOptions {
  /** Queue name (required) */
  name: string;

  /** Message retention period in seconds */
  messageRetentionPeriod?: number;

  /** Maximum message size in bytes */
  maxMessageSize?: number;

  /** Maximum queue size (number of messages) */
  maxQueueSize?: number;

  /** Delivery attempt limit before DLQ */
  deliveryAttemptLimit?: number;

  /** Dead letter queue name */
  deadLetterQueue?: string;

  /** Enable deduplication */
  enableDeduplication?: boolean;

  /** Deduplication window in seconds */
  deduplicationWindow?: number;
}

/**
 * Options for listing queues
 */
export interface ListQueuesOptions {
  /** Page size (default: 100) */
  pageSize?: number;

  /** Page token for pagination */
  pageToken?: string;

  /** Filter by queue type */
  type?: "FIFO" | "PRIORITY" | "DELAY";

  /** Filter by state */
  state?: "ACTIVE" | "PAUSED";
}

/**
 * Options for publishing a message
 */
export interface PublishMessageOptions {
  /** Queue name (required) */
  queueName: string;

  /** Message payload (required) */
  payload: Uint8Array | string;

  /** Content type (e.g., 'application/json', 'text/plain') */
  contentType?: string;

  /** Message priority (0-255, higher = more important) */
  priority?: number;

  /** Delay before message becomes available (milliseconds) */
  delayMs?: number;

  /** Deduplication ID */
  deduplicationId?: string;

  /** Custom metadata */
  metadata?: Record<string, string>;
}

/**
 * Options for publishing messages in batch
 */
export interface PublishBatchOptions {
  /** Queue name (required) */
  queueName: string;

  /** Array of messages to publish */
  messages: Array<{
    payload: Uint8Array | string;
    contentType?: string;
    priority?: number;
    delayMs?: number;
    deduplicationId?: string;
    metadata?: Record<string, string>;
  }>;
}

/**
 * Options for acknowledging a message
 */
export interface AcknowledgeMessageOptions {
  /** Queue name (required) */
  queueName: string;

  /** Message ID (required) */
  messageId: string;

  /** Receipt handle from receive operation (required) */
  receiptHandle: string;
}

/**
 * Options for rejecting a message
 */
export interface RejectMessageOptions {
  /** Queue name (required) */
  queueName: string;

  /** Message ID (required) */
  messageId: string;

  /** Receipt handle from receive operation (required) */
  receiptHandle: string;

  /** Reason for rejection */
  reason?: string;
}

/**
 * Options for requeuing a message
 */
export interface RequeueMessageOptions {
  /** Queue name (required) */
  queueName: string;

  /** Message ID (required) */
  messageId: string;

  /** Receipt handle from receive operation (required) */
  receiptHandle: string;

  /** New delay before message becomes available (milliseconds) */
  delayMs?: number;
}

/**
 * Options for creating a schedule
 */
export interface CreateScheduleOptions {
  /** Schedule name (required) */
  name: string;

  /** Cron expression (required) */
  cronExpression: string;

  /** Target queue name (required) */
  targetQueue: string;

  /** Payload to publish (required) */
  payload: Uint8Array | string;

  /** Content type */
  contentType?: string;

  /** Timezone (default: UTC) */
  timezone?: string;

  /** Schedule start time */
  startTime?: Date;

  /** Schedule end time */
  endTime?: Date;

  /** Maximum number of executions */
  maxExecutions?: number;

  /** Initial state (default: ACTIVE) */
  initialState?: "ACTIVE" | "PAUSED";
}

/**
 * Options for updating a schedule
 */
export interface UpdateScheduleOptions {
  /** Schedule name (required) */
  name: string;

  /** Cron expression */
  cronExpression?: string;

  /** Timezone */
  timezone?: string;

  /** Schedule start time */
  startTime?: Date;

  /** Schedule end time */
  endTime?: Date;

  /** Maximum number of executions */
  maxExecutions?: number;
}

/**
 * Options for listing schedules
 */
export interface ListSchedulesOptions {
  /** Page size (default: 100) */
  pageSize?: number;

  /** Page token for pagination */
  pageToken?: string;

  /** Filter by state */
  state?: "ACTIVE" | "PAUSED" | "COMPLETED";

  /** Filter by target queue */
  targetQueue?: string;
}

/**
 * ChronoQueue error codes
 */
export enum ErrorCode {
  // Client errors
  INVALID_ARGUMENT = "INVALID_ARGUMENT",
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED",

  // Server errors
  INTERNAL = "INTERNAL",
  UNAVAILABLE = "UNAVAILABLE",
  DEADLINE_EXCEEDED = "DEADLINE_EXCEEDED",

  // Connection errors
  CONNECTION_FAILED = "CONNECTION_FAILED",
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
