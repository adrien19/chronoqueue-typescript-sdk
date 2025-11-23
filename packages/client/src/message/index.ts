import {
  Duration,
  Message as ProtoMessage,
  QueueServiceTypes,
} from "@chronoqueue/proto";
import { Connection } from "../connection";
import { validateRequired } from "../utils/errors";

/**
 * Message client for message operations
 */
export class MessageClient {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly connection: Connection,
  ) {}

  /**
   * Post a message to a queue
   */
  async postMessage(
    queueName: string,
    message: ProtoMessage.Message,
  ): Promise<boolean> {
    validateRequired(queueName, "queueName");
    validateRequired(message, "message");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.PostMessageRequest = {
        queueName,
        message,
      };

      client.postMessage(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  /**
   * Get next message from a queue
   */
  async getNextMessage(
    queueName: string,
    leaseDuration?: Duration,
    exclusivityKey?: string,
  ): Promise<{
    message?: ProtoMessage.Message;
    streamEntryId: string;
  }> {
    validateRequired(queueName, "queueName");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.GetNextMessageRequest = {
        queueName,
        leaseDuration,
        exclusivityKey: exclusivityKey || "",
      };

      client.getNextMessage(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            message: response?.message,
            streamEntryId: response?.streamEntryId || "",
          });
        }
      });
    });
  }

  /**
   * Acknowledge a message
   */
  async acknowledgeMessage(
    queueName: string,
    messageId: string,
    state: ProtoMessage.Message_Metadata_State,
    streamEntryId: string,
  ): Promise<boolean> {
    validateRequired(queueName, "queueName");
    validateRequired(messageId, "messageId");
    validateRequired(state, "state");
    validateRequired(streamEntryId, "streamEntryId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.AcknowledgeMessageRequest = {
        queueName,
        messageId,
        state,
        streamEntryId,
      };

      client.acknowledgeMessage(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  /**
   * Renew message lease
   */
  async renewMessageLease(
    queueName: string,
    messageId: string,
    leaseDuration?: Duration,
  ): Promise<{
    remainingTime?: Duration;
    state: ProtoMessage.Message_Metadata_State;
  }> {
    validateRequired(queueName, "queueName");
    validateRequired(messageId, "messageId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.RenewMessageLeaseRequest = {
        queueName,
        messageId,
        leaseDuration,
      };

      client.renewMessageLease(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            remainingTime: response?.remainingTime,
            state:
              response?.state || ProtoMessage.Message_Metadata_State.PENDING,
          });
        }
      });
    });
  }

  /**
   * Peek queue messages without consuming
   */
  async peekQueueMessages(
    queueName: string,
    limit: string,
  ): Promise<ProtoMessage.Message[]> {
    validateRequired(queueName, "queueName");
    validateRequired(limit, "limit");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.PeekQueueMessagesRequest = {
        queueName,
        limit,
        priorityRange: undefined,
      };

      client.peekQueueMessages(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.messages || []);
        }
      });
    });
  }
}
