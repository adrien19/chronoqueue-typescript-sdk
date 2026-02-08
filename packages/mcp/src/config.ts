/**
 * Configuration management for ChronoQueue MCP Server
 */

import { parseDuration as clientParseDuration, durationToMs } from '@chronoqueue/client';

export interface ServerConfig {
  chronoqueueAddress: string;
  insecure: boolean;
  certPath?: string;
  keyPath?: string;
  caPath?: string;
  timeout: string;
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): ServerConfig {
  return {
    chronoqueueAddress: process.env.CHRONOQUEUE_ADDRESS || 'localhost:9000',
    insecure: process.env.CHRONOQUEUE_INSECURE !== 'false',
    certPath: process.env.CHRONOQUEUE_CERT_PATH,
    keyPath: process.env.CHRONOQUEUE_KEY_PATH,
    caPath: process.env.CHRONOQUEUE_CA_PATH,
    timeout: process.env.CHRONOQUEUE_TIMEOUT || '30s',
  };
}

/**
 * Parse duration string to milliseconds
 * 
 * Uses the client's parseDuration for consistency, then converts to ms.
 * Supports formats: "30s", "5m", "1h", "100ms"
 */
export function parseDuration(duration: string): number {
  const durationObj = clientParseDuration(duration);
  return durationToMs(durationObj);
}
