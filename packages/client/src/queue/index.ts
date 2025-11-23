import { Queue as ProtoQueue, QueueServiceTypes } from "@chronoqueue/proto";
import { Connection } from "../connection";
import { validateRequired } from "../utils/errors";

/**
 * Queue client for managing queues
 */
export class QueueClient {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly connection: Connection,
  ) {}

  /**
   * Create a new queue
   */
  async createQueue(
    name: string,
    metadata?: ProtoQueue.QueueMetadata,
  ): Promise<boolean> {
    validateRequired(name, "name");

    const client = this.connection.getQueueServiceClient();

    const metadataWithDefaults: ProtoQueue.QueueMetadata = {
      type: metadata?.type || ProtoQueue.QueueType.SIMPLE,
      leaseDuration: metadata?.leaseDuration || { seconds: "30", nanos: 0 },
      defaultMaxAttempts: metadata?.defaultMaxAttempts ?? 3,
      autoCreateDlq: metadata?.autoCreateDlq ?? true,
      exclusivityKey: metadata?.exclusivityKey ?? "",
      deadLetterQueueName: metadata?.deadLetterQueueName ?? "",
      maxPayloadSize: metadata?.maxPayloadSize ?? 0,
      allowedContentTypes: metadata?.allowedContentTypes ?? [],
      schemaRequired: metadata?.schemaRequired ?? false,
      schemaId: metadata?.schemaId ?? "",
      ...metadata,
    };

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.CreateQueueRequest = {
        name,
        metadata: metadataWithDefaults,
      };

      client.createQueue(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  /**
   * Delete a queue
   */
  async deleteQueue(name: string): Promise<boolean> {
    validateRequired(name, "name");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.DeleteQueueRequest = {
        name,
      };

      client.deleteQueue(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  /**
   * Get queue state and statistics
   */
  async getQueueState(
    queueName: string,
  ): Promise<QueueServiceTypes.GetQueueStateResponse> {
    validateRequired(queueName, "queueName");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.GetQueueStateRequest = {
        queueName,
      };

      client.getQueueState(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * List queues
   */
  async listQueues(prefix?: string): Promise<ProtoQueue.Queue[]> {
    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.ListQueuesRequest = {
        prefix: prefix || "",
      };

      client.listQueues(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.queues || []);
        }
      });
    });
  }
}
