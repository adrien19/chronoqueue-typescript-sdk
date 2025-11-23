import { Connection } from "./connection";
import { MessageClient } from "./message";
import { QueueClient } from "./queue";
import { ScheduleClient } from "./schedule";
import { SchemaClient } from "./schema";
import { ClientConfig } from "./types";

/**
 * Main ChronoQueue client
 */
export class ChronoQueueClient {
  private connection: Connection;

  public readonly queues: QueueClient;
  public readonly messages: MessageClient;
  public readonly schedules: ScheduleClient;
  public readonly schemas: SchemaClient;

  constructor(config: ClientConfig) {
    this.connection = new Connection(config.connection);

    this.queues = new QueueClient(this.connection);
    this.messages = new MessageClient(this.connection);
    this.schedules = new ScheduleClient(this.connection);
    this.schemas = new SchemaClient(this.connection);
  }

  /**
   * Connect to ChronoQueue server
   */
  async connect(): Promise<void> {
    await this.connection.connect();
  }

  /**
   * Disconnect from ChronoQueue server
   */
  async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }

  /**
   * Check if connected to server
   */
  isConnected(): boolean {
    return this.connection.isConnected();
  }
}
