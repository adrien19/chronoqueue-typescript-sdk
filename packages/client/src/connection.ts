import { QueueService } from "@chronoqueue/proto";
import * as grpc from "@grpc/grpc-js";
import { ChronoQueueError, ConnectionOptions, ErrorCode } from "./types";

type QueueServiceClient = InstanceType<typeof QueueService.QueueServiceClient>;

/**
 * Manages gRPC connection and service clients
 */
export class Connection {
  private readonly address: string;
  private readonly credentials: grpc.ChannelCredentials;
  private readonly channelOptions: grpc.ChannelOptions;
  private readonly timeout: number;

  private queueServiceClient?: QueueServiceClient;
  private connected: boolean = false;

  constructor(options: ConnectionOptions) {
    this.address = options.address;
    this.credentials = options.credentials || grpc.credentials.createInsecure();
    this.channelOptions = options.channelOptions || {};
    this.timeout = options.timeout || 10000;
  }

  /**
   * Connect to ChronoQueue server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      // Create service client (ChronoQueue uses a single unified QueueService)
      this.queueServiceClient = new QueueService.QueueServiceClient(
        this.address,
        this.credentials,
        this.channelOptions,
      );

      // Wait for channel to be ready
      await this.waitForReady(this.queueServiceClient);

      this.connected = true;
    } catch (error) {
      throw new ChronoQueueError(
        ErrorCode.CONNECTION_FAILED,
        `Failed to connect to ${this.address}: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  /**
   * Wait for gRPC channel to be ready
   */
  private async waitForReady(client: grpc.Client): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + this.timeout);

      client.waitForReady(deadline, (error) => {
        if (error) {
          reject(
            new ChronoQueueError(
              ErrorCode.CONNECTION_TIMEOUT,
              `Connection timeout after ${this.timeout}ms`,
              error,
            ),
          );
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Disconnect from ChronoQueue server
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    this.queueServiceClient?.close();
    this.queueServiceClient = undefined;
    this.connected = false;
  }

  /**
   * Get QueueService client
   */
  getQueueServiceClient(): QueueServiceClient {
    this.ensureConnected();
    return this.queueServiceClient!;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Ensure connection is established
   */
  private ensureConnected(): void {
    if (!this.connected) {
      throw new ChronoQueueError(
        ErrorCode.CONNECTION_FAILED,
        "Not connected to ChronoQueue server. Call connect() first.",
      );
    }
  }
}
