import {
  Schedule as ProtoSchedule,
  QueueServiceTypes,
} from "@chronoqueue/proto";
import { Connection } from "../connection";
import { validateRequired } from "../utils/errors";

/**
 * Schedule client for managing scheduled tasks
 */
export class ScheduleClient {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly connection: Connection,
  ) {}

  /**
   * Create a schedule
   */
  async createSchedule(schedule: ProtoSchedule.Schedule): Promise<boolean> {
    validateRequired(schedule, "schedule");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.CreateScheduleRequest = {
        schedule,
      };

      client.createSchedule(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  /**
   * Get schedule details
   */
  async getSchedule(
    scheduleId: string,
  ): Promise<ProtoSchedule.Schedule | undefined> {
    validateRequired(scheduleId, "scheduleId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.GetScheduleRequest = {
        scheduleId,
      };

      client.getSchedule(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.schedule);
        }
      });
    });
  }

  /**
   * List schedules
   */
  async listSchedules(prefix?: string): Promise<ProtoSchedule.Schedule[]> {
    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.ListSchedulesRequest = {
        prefix: prefix || "",
      };

      client.listSchedules(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.schedules || []);
        }
      });
    });
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId: string): Promise<boolean> {
    validateRequired(scheduleId, "scheduleId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.DeleteScheduleRequest = {
        scheduleId,
      };

      client.deleteSchedule(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  /**
   * Pause a schedule
   */
  async pauseSchedule(scheduleId: string): Promise<boolean> {
    validateRequired(scheduleId, "scheduleId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.PauseScheduleRequest = {
        scheduleId,
      };

      client.pauseSchedule(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  /**
   * Resume a paused schedule
   */
  async resumeSchedule(scheduleId: string): Promise<boolean> {
    validateRequired(scheduleId, "scheduleId");

    const client = this.connection.getQueueServiceClient();

    return new Promise((resolve, reject) => {
      const request: QueueServiceTypes.ResumeScheduleRequest = {
        scheduleId,
      };

      client.resumeSchedule(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }
}
