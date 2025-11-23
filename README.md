# ChronoQueue TypeScript SDK

[![CI](https://github.com/adrien19/chronoqueue-typescript-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/adrien19/chronoqueue-typescript-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A TypeScript SDK for interacting with ChronoQueue, a distributed task scheduling and queue management system.

## 📦 Packages

This is a monorepo containing the following packages:

- **[@chronoqueue/proto](./packages/proto)** – Protocol Buffer definitions and generated TypeScript types
- **[@chronoqueue/client](./packages/client)** – High-level TypeScript/Node.js client SDK for interacting with ChronoQueue (queues, messages, schedules, schemas, and more)

## 🚀 Quick Start

### Installation

#### Proto Package

```bash
npm install @chronoqueue/proto
# or
pnpm add @chronoqueue/proto
# or
yarn add @chronoqueue/proto
```

#### Client SDK

```bash
npm install @chronoqueue/client
# or
pnpm add @chronoqueue/client
# or
yarn add @chronoqueue/client
```

### Basic Usage

#### Using the Proto Package

```typescript
import { Queue, Message, Payload } from "@chronoqueue/proto";
// ...existing code...
```

#### Using the Client SDK

```typescript
import { ChronoQueueClient, ProtoMessage } from "@chronoqueue/client";

const client = new ChronoQueueClient({
  connection: { address: "localhost:9000" },
});
await client.connect();

// Create a queue
await client.queues.createQueue("checkout-orders", {
  type: ProtoQueue.QueueType.SIMPLE,
  defaultMaxAttempts: 3,
  leaseDuration: { seconds: "300", nanos: 0 },
  autoCreateDlq: true,
});

// Post a message
await client.messages.postMessage("checkout-orders", {
  messageId: "order-123",
  metadata: {
    payload: {
      data: {
        cartId: "cart-abc123",
        userId: "user-456",
        items: [],
        totalAmount: 999.99,
      },
      contentType: "application/json",
      schemaId: "store-cart.v1",
      schemaVersion: 1,
    },
    priority: 5,
    maxAttempts: 3,
    state: ProtoMessage.Message_Metadata_State.PENDING,
  },
});

// Get next message
const { message, streamEntryId } =
  await client.messages.getNextMessage("checkout-orders");
if (message) {
  // Process message
  console.log("Processing:", message.metadata?.payload?.data);
  // Acknowledge
  await client.messages.acknowledgeMessage(
    "checkout-orders",
    message.messageId,
    ProtoMessage.Message_Metadata_State.PROCESSED,
    streamEntryId,
  );
}
await client.disconnect();
```

See [`packages/client/README.md`](./packages/client/README.md) for full usage, advanced features, and API reference.

## 🛠️ Development

### Prerequisites

- Node.js 18 or higher
- pnpm 10 or higher

### Setup

```bash
# Install dependencies
make install-dev

# Download proto definitions
make update-proto

# Generate TypeScript code from protos
make gen-proto

# Build all packages
make build-all
```

### Common Commands

```bash
# Run tests
make test-all

# Run tests with coverage
make test-coverage

# Run linting
make lint

# Run type checking
make typecheck

# Run all CI checks
make ci

# Clean build artifacts
make clean
```

For a complete list of available commands, run:

```bash
make help
```

## 📖 Documentation

- **[CI/CD Workflows](.github/CI_WORKFLOWS.md)** - Comprehensive guide to GitHub Actions workflows
- **[Quick CI Reference](.github/QUICK_CI_REFERENCE.md)** - Quick reference for common CI tasks
- **[Testing Setup](./TESTING_SETUP_COMPLETE.md)** - Testing infrastructure documentation
- **[Proto Implementation](./PROTO_PACKAGE_IMPLEMENTATION.md)** - Proto package implementation details
- **[SDK Implementation Plan](./SDK_IMPLEMENTATION_PLAN.md)** - Overall SDK implementation roadmap

## 🏗️ Project Structure

```
chronoqueue-typescript-sdk/
├── packages/
│   ├── proto/           # Protocol Buffer definitions
│   └── client/          # Client SDK
├── proto/               # Raw .proto files
├── .github/
│   └── workflows/       # CI/CD workflows
├── Makefile             # Build automation
└── package.json         # Workspace root
```

## 🔧 Architecture

### Proto Package

The `@chronoqueue/proto` package contains:

- **Generated TypeScript types** from Protocol Buffer definitions
- **gRPC service definitions** for interacting with ChronoQueue
- **Message encoding/decoding** utilities
- **Type-safe interfaces** for all ChronoQueue entities

### Client Package

The `@chronoqueue/client` package provides:

- High-level client for queue, message, schedule, and schema operations
- Connection management and pooling
- Retry logic and robust error handling
- TypeScript-first API design with full type safety
- Protocol types re-exported for convenience

## 🧪 Testing

All packages include comprehensive test suites:

```bash
# Run all tests
make test-all

# Run tests for a specific package
make test-proto
make test-client

# Run tests with coverage
make test-coverage

# Watch mode
cd packages/proto && pnpm test:watch
```

Current test coverage:

- **Proto package**: 29 tests covering all generated types and services
- **Client package**: Comprehensive tests for all client APIs (queues, messages, schedules, schemas, error handling)

## 📋 Releasing

### Automated Releases

Push a tag to trigger automatic publishing:

```bash
# Production release
git tag v1.0.0-release
git push origin v1.0.0-release

# Beta release
git tag v1.0.0-beta
git push origin v1.0.0-beta
```

### Manual Release

Use the GitHub Actions workflow dispatch:

1. Go to **Actions → Release**
2. Click **Run workflow**
3. Select package(s) to publish
4. Choose npm dist-tag (latest, beta, etc.)

See [CI/CD Workflows](.github/CI_WORKFLOWS.md) for detailed release documentation.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes** and add tests
4. **Run CI checks**: `make ci`
5. **Commit your changes**: `git commit -m "feat: add my feature"`
6. **Push to your fork**: `git push origin feature/my-feature`
7. **Open a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `ci:` - CI/CD changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [adrien19/chronoqueue-typescript-sdk](https://github.com/adrien19/chronoqueue-typescript-sdk)
- **Issues**: [Report a bug or request a feature](https://github.com/adrien19/chronoqueue-typescript-sdk/issues)
- **npm Package**: [@chronoqueue/proto](https://www.npmjs.com/package/@chronoqueue/proto)

## 💬 Support

For questions and support:

- Open an [issue](https://github.com/adrien19/chronoqueue-typescript-sdk/issues)
- Check existing [documentation](.github/CI_WORKFLOWS.md)

## 🗺️ Roadmap

- [x] Proto package with generated TypeScript types
- [x] Comprehensive testing infrastructure
- [x] CI/CD workflows
- [x] Client SDK implementation
- [ ] Connection pooling and management
- [ ] Advanced queue operations
- [ ] Monitoring and observability hooks
- [ ] Examples and tutorials

---

**Built with ❤️ by the ChronoQueue Team**
