/**
 * MCP Server Implementation for ChronoQueue
 *
 * Sets up the Model Context Protocol server with tool handlers
 */

import { ChronoQueueClient } from '@chronoqueue/client';
import * as grpc from '@grpc/grpc-js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';

import { loadConfig, parseDuration } from './config.js';
import { handleToolCall } from './tools/handlers.js';
import { allTools } from './tools/index.js';

/**
 * Create and configure the MCP server
 */
export async function createMCPServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'chronoqueue-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Load configuration
  const config = loadConfig();

  // Setup gRPC credentials
  let credentials: grpc.ChannelCredentials;
  if (config.insecure) {
    credentials = grpc.credentials.createInsecure();
  } else if (config.certPath && config.keyPath && config.caPath) {
    const cert = readFileSync(config.certPath);
    const key = readFileSync(config.keyPath);
    const ca = readFileSync(config.caPath);
    credentials = grpc.credentials.createSsl(ca, key, cert);
  } else {
    credentials = grpc.credentials.createSsl();
  }

  // Initialize ChronoQueue SDK client
  const chronoQueueClient = new ChronoQueueClient({
    connection: {
      address: config.chronoqueueAddress,
      credentials,
      timeout: parseDuration(config.timeout),
    },
    requestTimeout: parseDuration(config.timeout),
  });

  // Connect to server
  await chronoQueueClient.connect();

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await handleToolCall(
        request.params.name,
        request.params.arguments || {},
        chronoQueueClient
      );

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Tool execution error (${request.params.name}):`, errorMessage);

      return {
        content: [
          {
            type: 'text',
            text: `❌ Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down gracefully...');
    await chronoQueueClient.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down gracefully...');
    await chronoQueueClient.disconnect();
    process.exit(0);
  });

  return server;
}
