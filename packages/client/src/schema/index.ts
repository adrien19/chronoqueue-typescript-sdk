import { Schema as ProtoSchema, QueueServiceTypes } from "@chronoqueue/proto";
import { Connection } from "../connection";
import { validateRequired } from "../utils/errors";

/**
 * Schema client for schema management operations
 */
export class SchemaClient {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly connection: Connection,
  ) {}

  /**
   * Register a new schema (creates a new version automatically)
   */
  async registerSchema(
    schemaId: string,
    content: string,
    options?: {
      name?: string;
      description?: string;
      contentType?: string;
      metadata?: Record<string, string>;
    },
  ): Promise<{ schemaId: string; version: number; createdAt: string }> {
    validateRequired(schemaId, "schemaId");
    validateRequired(content, "content");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.RegisterSchemaRequest = {
        schemaId,
        name: options?.name || "",
        description: options?.description || "",
        content,
        contentType: options?.contentType || "json-schema",
        metadata: options?.metadata || {},
      };

      client.registerSchema(request, (error, response) => {
        if (error) {
          reject(error);
        } else if (response) {
          resolve({
            schemaId: response.schemaId,
            version: response.version,
            createdAt: response.createdAt,
          });
        } else {
          reject(new Error("Empty response from server"));
        }
      });
    });
  }

  /**
   * Get a specific schema version
   */
  async getSchema(
    schemaId: string,
    version?: number,
  ): Promise<ProtoSchema.Schema | undefined> {
    validateRequired(schemaId, "schemaId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.GetSchemaRequest = {
        schemaId,
        version: version || 0, // 0 means latest version
      };

      client.getSchema(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.schema);
        }
      });
    });
  }

  /**
   * List all schemas
   */
  async listSchemas(options?: {
    prefix?: string;
    limit?: number;
    activeOnly?: boolean;
  }): Promise<QueueServiceTypes.SchemaInfo[]> {
    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.ListSchemasRequest = {
        prefix: options?.prefix || "",
        limit: options?.limit || 100,
        activeOnly:
          options?.activeOnly !== undefined ? options.activeOnly : false,
      };

      client.listSchemas(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.schemas || []);
        }
      });
    });
  }

  /**
   * Delete a schema version (or all versions if version not specified)
   */
  async deleteSchema(schemaId: string, version?: number): Promise<boolean> {
    validateRequired(schemaId, "schemaId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.DeleteSchemaRequest = {
        schemaId,
        version: version || 0, // 0 means all versions
      };

      client.deleteSchema(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }
}
