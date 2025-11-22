# @chronoqueue/proto

[![npm version](https://badge.fury.io/js/@chronoqueue%2Fproto.svg)](https://www.npmjs.com/package/@chronoqueue/proto)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Protocol Buffer definitions and generated TypeScript types for ChronoQueue.

## 📦 Installation

```bash
npm install @chronoqueue/proto
# or
pnpm add @chronoqueue/proto
# or
yarn add @chronoqueue/proto
```

## 🚀 Usage

### Importing Types

```typescript
import {
  Queue,
  Queue_QueueType,
  Queue_FairnessPolicy,
  Message,
  Payload,
  Schedule,
  Schema,
  QueueServiceService,
} from "@chronoqueue/proto";
```

### Creating a Queue

```typescript
import {
  Queue,
  Queue_QueueType,
  Queue_FairnessPolicy,
} from "@chronoqueue/proto";

const queue = Queue.create({
  id: "task-queue-001",
  name: "Task Processing Queue",
  description: "Handles background task processing",
  queueType: Queue_QueueType.STANDARD,
  fairnessPolicy: Queue_FairnessPolicy.FIFO,
  maxSize: 10000,
  metadata: {
    createdAt: { seconds: BigInt(Date.now() / 1000), nanos: 0 },
    updatedAt: { seconds: BigInt(Date.now() / 1000), nanos: 0 },
  },
});
```

### Creating a Message

```typescript
import { Message, Payload } from "@chronoqueue/proto";

const message = Message.create({
  id: "msg-123",
  queueId: "task-queue-001",
  payload: Payload.create({
    data: Buffer.from(
      JSON.stringify({
        task: "process-image",
        imageId: "12345",
      }),
    ),
    contentType: "application/json",
    metadata: {
      source: "api",
      priority: "high",
    },
  }),
  metadata: {
    state: Message_Metadata_State.PENDING,
    createdAt: { seconds: BigInt(Date.now() / 1000), nanos: 0 },
  },
});
```

### Creating a Schedule

```typescript
import { Schedule } from "@chronoqueue/proto";

const schedule = Schedule.create({
  id: "schedule-001",
  queueId: "task-queue-001",
  cronExpression: "0 0 * * *", // Daily at midnight
  payload: Payload.create({
    data: Buffer.from(JSON.stringify({ task: "daily-report" })),
    contentType: "application/json",
  }),
  metadata: {
    state: Schedule_Metadata_State.ACTIVE,
  },
});
```

### Encoding and Decoding

```typescript
import { Message } from "@chronoqueue/proto";

// Encode to binary
const message = Message.create({
  /* ... */
});
const encoded = Message.encode(message).finish();

// Decode from binary
const decoded = Message.decode(encoded);
```

### Using with gRPC

```typescript
import { QueueServiceService } from "@chronoqueue/proto";
import * as grpc from "@grpc/grpc-js";

// Create gRPC client
const client = new grpc.Client(
  "localhost:50051",
  grpc.credentials.createInsecure(),
  {
    "grpc.service_config": JSON.stringify({
      methodConfig: [
        {
          name: [{ service: QueueServiceService.typeName }],
          retryPolicy: {
            maxAttempts: 5,
            initialBackoff: "0.5s",
            maxBackoff: "30s",
            backoffMultiplier: 2,
            retryableStatusCodes: ["UNAVAILABLE"],
          },
        },
      ],
    }),
  },
);

// Service definition is available for implementing clients
console.log("Service name:", QueueServiceService.typeName);
console.log("Methods:", QueueServiceService.methods);
```

## 📚 API Reference

### Core Types

#### Queue

Represents a task queue with configuration and metadata.

**Fields:**

- `id` (string) - Unique queue identifier
- `name` (string) - Human-readable queue name
- `description` (string, optional) - Queue description
- `queueType` (Queue_QueueType) - Queue type (STANDARD, PRIORITY, etc.)
- `fairnessPolicy` (Queue_FairnessPolicy) - Fairness policy (FIFO, LIFO, PRIORITY)
- `maxSize` (number, optional) - Maximum queue size
- `metadata` (QueueMetadata, optional) - Queue metadata

#### Message

Represents a message in a queue.

**Fields:**

- `id` (string) - Unique message identifier
- `queueId` (string) - Queue containing this message
- `payload` (Payload) - Message payload
- `metadata` (Message_Metadata, optional) - Message metadata
- `scheduleId` (string, optional) - Associated schedule ID

#### Payload

Contains the actual data for a message.

**Fields:**

- `data` (Uint8Array) - Binary data
- `contentType` (string, optional) - MIME type
- `metadata` (object, optional) - Key-value metadata

#### Schedule

Represents a scheduled task.

**Fields:**

- `id` (string) - Unique schedule identifier
- `queueId` (string) - Target queue
- `cronExpression` (string) - Cron expression for scheduling
- `payload` (Payload) - Payload to send
- `metadata` (Schedule_Metadata, optional) - Schedule metadata

#### Schema

Represents a schema for validation.

**Fields:**

- `id` (string) - Unique schema identifier
- `queueId` (string) - Associated queue
- `schemaType` (string) - Schema type (e.g., "json-schema")
- `schema` (string) - Schema definition

### Enums

#### Queue_QueueType

- `UNSPECIFIED` (0)
- `STANDARD` (1)
- `PRIORITY` (2)
- `FIFO` (3)

#### Queue_FairnessPolicy

- `UNSPECIFIED` (0)
- `FIFO` (1)
- `LIFO` (2)
- `PRIORITY` (3)
- `FAIR_SHARE` (4)

#### Message_Metadata_State

- `UNSPECIFIED` (0)
- `PENDING` (1)
- `PROCESSING` (2)
- `COMPLETED` (3)
- `FAILED` (4)
- `CANCELLED` (5)

#### Schedule_Metadata_State

- `UNSPECIFIED` (0)
- `ACTIVE` (1)
- `PAUSED` (2)
- `COMPLETED` (3)
- `CANCELLED` (4)

### Service Definitions

#### QueueServiceService

gRPC service definition for queue operations.

**Available via:**

```typescript
import { QueueServiceService } from "@chronoqueue/proto";
```

## 🧪 Testing

This package includes comprehensive tests covering all generated types and functionality.

Run tests:

```bash
cd packages/proto
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

## 🔧 Development

### Regenerating Types

If you need to regenerate TypeScript types from proto files:

```bash
# From package directory
pnpm run gen

# Or from workspace root
make gen-proto
```

### Building

```bash
# From package directory
pnpm run build

# Or from workspace root
make build-proto
```

## 📖 Related Packages

- [@chronoqueue/client](../client) - High-level client SDK (coming soon)

## 🤝 Contributing

Contributions are welcome! Please see the [main repository](../../README.md) for contribution guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

## 🔗 Links

- **npm**: [@chronoqueue/proto](https://www.npmjs.com/package/@chronoqueue/proto)
- **Repository**: [chronoqueue-typescript-sdk](https://github.com/adrien19/chronoqueue-typescript-sdk)
- **Issues**: [Report bugs](https://github.com/adrien19/chronoqueue-typescript-sdk/issues)

---

Part of the [ChronoQueue TypeScript SDK](../../README.md)
