# TypeScript Dev Container

This devcontainer is configured for TypeScript SDK development for the chronoqueue project.

## Features

- **Node.js 20**: Latest LTS version
- **TypeScript**: Pre-installed globally with ts-node
- **ESLint & Prettier**: Code quality and formatting tools
- **Docker Support**: Docker CLI for container management
- **Redis**: Running in docker-compose for testing

## Included Tools

- TypeScript
- ts-node
- ESLint
- Prettier
- pnpm (alternative package manager)
- Docker CLI
- Git

## VS Code Extensions

- ESLint
- Prettier
- GitLens
- GitHub Copilot
- REST Client
- TypeScript Next

## Services

### Redis

- Container: `dev_redis_ts`
- Port: `6380` (mapped to avoid conflict with Python devcontainer)
- Password: `securepassword123`
- Connection string: `redis://:securepassword123@localhost:6380`

## Getting Started

1. Open the project in VS Code
2. When prompted, click "Reopen in Container" and select this TypeScript configuration
3. Wait for the container to build and start
4. The postCreateCommand will automatically:
   - Set up Docker access
   - Start Redis via docker-compose
   - Install npm dependencies if package.json exists

## Usage

### Running TypeScript

```bash
# Compile TypeScript
tsc

# Run TypeScript directly
ts-node src/index.ts

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Working with Docker

Docker is available inside the container:

```bash
docker ps
docker-compose up
```

## Port Mappings

- Redis: 6380 → 6379 (inside container)

Note: Port 6380 is used externally to avoid conflicts with the other devcontainer's Redis on port 6379.
