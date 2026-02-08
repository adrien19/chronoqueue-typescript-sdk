/**
 * Unit tests for tool handlers
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleToolCall } from '../tools/handlers.js';

describe('Tool Handlers', () => {
  let mockClient: any;

  beforeEach(() => {
    // Mock client with nested structure matching real ChronoQueueClient
    mockClient = {
      queues: {
        createQueue: vi.fn(),
        deleteQueue: vi.fn(),
        listQueues: vi.fn(),
        getQueueState: vi.fn(),
      },
      messages: {
        postMessage: vi.fn(),
        getNextMessage: vi.fn(),
        peekQueueMessages: vi.fn(),
        acknowledgeMessage: vi.fn(),
        renewMessageLease: vi.fn(),
      },
      schedules: {
        createSchedule: vi.fn(),
        listSchedules: vi.fn(),
        deleteSchedule: vi.fn(),
      },
      schemas: {
        registerSchema: vi.fn(),
      },
    };
  });

  describe('Queue Management', () => {
    it('should handle create_queue with default auto_create_dlq=true', async () => {
      mockClient.queues.createQueue.mockResolvedValue({
        success: true,
        queueName: 'test-queue',
      });

      const result = await handleToolCall(
        'create_queue',
        {
          queue_name: 'test-queue',
          queue_type: 'simple',
          max_attempts: 3,
        },
        mockClient
      );

      expect(mockClient.queues.createQueue).toHaveBeenCalledWith(
        'test-queue',
        expect.objectContaining({
          type: 0,
          defaultMaxAttempts: 3,
          autoCreateDlq: true,
        })
      );
      expect(result).toContain('✓ Queue created successfully');
      expect(result).toContain('test-queue');
    });

    it('should handle create_queue with lease_duration', async () => {
      mockClient.queues.createQueue.mockResolvedValue({
        success: true,
        queueName: 'test-queue',
      });

      const result = await handleToolCall(
        'create_queue',
        {
          queue_name: 'test-queue',
          lease_duration: '5m',
          max_attempts: 5,
          auto_create_dlq: false,
        },
        mockClient
      );

      expect(mockClient.queues.createQueue).toHaveBeenCalledWith(
        'test-queue',
        expect.objectContaining({
          leaseDuration: { seconds: '300', nanos: 0 },
          defaultMaxAttempts: 5,
          autoCreateDlq: false,
        })
      );
      expect(result).toContain('Lease Duration: 5m');
    });

    it('should handle delete_queue', async () => {
      mockClient.queues.deleteQueue.mockResolvedValue({ success: true });

      const result = await handleToolCall(
        'delete_queue',
        {
          queue_name: 'test-queue',
        },
        mockClient
      );

      expect(mockClient.queues.deleteQueue).toHaveBeenCalledWith('test-queue');
      expect(result).toContain('deleted successfully');
    });

    it('should handle list_queues with empty result', async () => {
      mockClient.queues.listQueues.mockResolvedValue([]);

      const result = await handleToolCall('list_queues', {}, mockClient);

      expect(result).toContain('No queues found');
    });

    it('should handle list_queues with results', async () => {
      mockClient.queues.listQueues.mockResolvedValue([
        {
          name: 'queue1',
          metadata: {
            type: 0,
            leaseDuration: { seconds: '30', nanos: 0 },
            defaultMaxAttempts: 3,
            deadLetterQueueName: 'queue1-dlq',
          },
        },
        {
          name: 'queue2',
          metadata: {
            type: 1,
            leaseDuration: { seconds: '60', nanos: 0 },
            defaultMaxAttempts: 5,
          },
        },
      ]);

      const result = await handleToolCall('list_queues', {}, mockClient);

      expect(result).toContain('📋 Queues (2 total)');
      expect(result).toContain('queue1');
      expect(result).toContain('queue2');
    });

    it('should handle get_queue_state', async () => {
      mockClient.queues.getQueueState.mockResolvedValue({
        queueName: 'test-queue',
        stateCounts: {
          PENDING: 5,
          RUNNING: 2,
          COMPLETED: 10,
          ERRORED: 1,
        },
      });

      const result = await handleToolCall(
        'get_queue_state',
        {
          queue_name: 'test-queue',
        },
        mockClient
      );

      expect(mockClient.queues.getQueueState).toHaveBeenCalledWith('test-queue');
      expect(result).toContain('test-queue');
      expect(result).toContain('Pending:   5');
      expect(result).toContain('Running:   2');
    });
  });

  describe('Message Operations', () => {
    it('should handle post_message', async () => {
      mockClient.messages.postMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      const result = await handleToolCall(
        'post_message',
        {
          queue_name: 'test-queue',
          message_id: 'msg-123',
          payload: { key: 'value' },
          priority: 8,
        },
        mockClient
      );

      expect(mockClient.messages.postMessage).toHaveBeenCalledWith(
        'test-queue',
        expect.objectContaining({
          messageId: 'msg-123',
        })
      );
      expect(result).toContain('✓ Message posted successfully');
    });

    it('should handle post_message with schema validation', async () => {
      mockClient.messages.postMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      const result = await handleToolCall(
        'post_message',
        {
          queue_name: 'test-queue',
          message_id: 'msg-123',
          payload: { key: 'value' },
          schema_id: 'user.profile.v1',
          schema_version: 1,
        },
        mockClient
      );

      expect(mockClient.messages.postMessage).toHaveBeenCalledWith(
        'test-queue',
        expect.objectContaining({
          messageId: 'msg-123',
          metadata: expect.objectContaining({
            payload: expect.objectContaining({
              schemaId: 'user.profile.v1',
              schemaVersion: 1,
            }),
          }),
        })
      );
      expect(result).toContain('Schema: user.profile.v1 v1');
    });

    it('should handle post_message with lease_duration parsing', async () => {
      mockClient.messages.postMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      const result = await handleToolCall(
        'post_message',
        {
          queue_name: 'test-queue',
          message_id: 'msg-123',
          payload: { key: 'value' },
          lease_duration: '5m',
          priority: 7,
        },
        mockClient
      );

      // Should convert '5m' to 300 seconds
      expect(mockClient.messages.postMessage).toHaveBeenCalledWith(
        'test-queue',
        expect.objectContaining({
          metadata: expect.objectContaining({
            leaseDuration: { seconds: '300', nanos: 0 },
          }),
        })
      );
      expect(result).toContain('✓ Message posted successfully');
    });

    it('should handle get_next_message', async () => {
      mockClient.messages.getNextMessage.mockResolvedValue({
        message: {
          messageId: 'msg-123',
          metadata: {
            payload: {
              data: JSON.stringify({ key: 'value' }),
              contentType: 'application/json',
            },
            priority: '5',
            attemptsLeft: 3,
            maxAttempts: 3,
            leaseExpiry: '2026-01-01T00:00:00Z',
          },
        },
        workerId: 'worker-1',
        attemptId: 'attempt-1',
      });

      const result = await handleToolCall(
        'get_next_message',
        {
          queue_name: 'test-queue',
        },
        mockClient
      );

      expect(mockClient.messages.getNextMessage).toHaveBeenCalledWith(
        'test-queue',
        { seconds: '30', nanos: 0 },
        undefined,  // exclusivity_key
        false,      // autoHeartbeat
        1000,       // heartbeatIntervalMs
        undefined   // worker_id
      );
      expect(result).toContain('📨 Message Retrieved');
      expect(result).toContain('msg-123');
      expect(result).toContain('Worker ID: worker-1');
      expect(result).toContain('Attempt ID: attempt-1');
    });

    it('should handle get_next_message with no messages', async () => {
      mockClient.messages.getNextMessage.mockResolvedValue(null);

      const result = await handleToolCall(
        'get_next_message',
        {
          queue_name: 'test-queue',
        },
        mockClient
      );

      expect(result).toContain('No messages available');
    });

    it('should handle peek_messages', async () => {
      mockClient.messages.peekQueueMessages.mockResolvedValue([
        {
          messageId: 'msg-1',
          metadata: {
            payload: {
              data: JSON.stringify({ key: 'value1' }),
            },
            priority: '5',
            attemptsLeft: 3,
          },
        },
        {
          messageId: 'msg-2',
          metadata: {
            payload: {
              data: JSON.stringify({ key: 'value2' }),
            },
            priority: '8',
            attemptsLeft: 2,
          },
        },
      ]);

      const result = await handleToolCall(
        'peek_messages',
        {
          queue_name: 'test-queue',
          limit: 5,
        },
        mockClient
      );

      expect(mockClient.messages.peekQueueMessages).toHaveBeenCalledWith('test-queue', '5');
      expect(result).toContain('👀 Peeking at 2 message(s)');
    });

    it('should handle acknowledge_message', async () => {
      mockClient.messages.acknowledgeMessage.mockResolvedValue(true);

      const result = await handleToolCall(
        'acknowledge_message',
        {
          queue_name: 'test-queue',
          message_id: 'msg-123',
          status: 'completed',
          worker_id: 'worker-1',
          attempt_id: 'attempt-1',
        },
        mockClient
      );

      expect(mockClient.messages.acknowledgeMessage).toHaveBeenCalledWith(
        'test-queue',
        'msg-123',
        3, // COMPLETED state
        'worker-1',
        'attempt-1'
      );
      expect(result).toContain('✅ Message acknowledged');
    });

    it('should handle renew_message_lease with duration parsing', async () => {
      mockClient.messages.renewMessageLease.mockResolvedValue({
        remainingTime: { seconds: '60', nanos: 0 },
        state: 2,
      });

      const result = await handleToolCall(
        'renew_message_lease',
        {
          queue_name: 'test-queue',
          message_id: 'msg-123',
          lease_duration: '60s',
        },
        mockClient
      );

      expect(mockClient.messages.renewMessageLease).toHaveBeenCalledWith(
        'test-queue',
        'msg-123',
        { seconds: '60', nanos: 0 }
      );
      expect(result).toContain('✓ Message lease renewed');
      expect(result).toContain('Remaining Time: 60s');
    });
  });

  describe('Schedule Operations', () => {
    it('should handle create_schedule with cron', async () => {
      mockClient.schedules.createSchedule.mockResolvedValue({
        success: true,
        scheduleId: 'daily-task',
      });

      const result = await handleToolCall(
        'create_schedule',
        {
          schedule_id: 'daily-task',
          queue_name: 'test-queue',
          schedule_type: 'cron',
          cron_expression: '0 9 * * *',
          payload: { task: 'daily' },
        },
        mockClient
      );

      expect(mockClient.schedules.createSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduleId: 'daily-task',
          metadata: expect.objectContaining({
            cronSchedule: '0 9 * * *',
            queueName: 'test-queue',
          }),
        })
      );
      expect(result).toContain('✓ Schedule created successfully');
    });

    it('should handle create_schedule with calendar', async () => {
      mockClient.schedules.createSchedule.mockResolvedValue({
        success: true,
        scheduleId: 'weekly-task',
      });

      const result = await handleToolCall(
        'create_schedule',
        {
          schedule_id: 'weekly-task',
          queue_name: 'test-queue',
          schedule_type: 'calendar',
          calendar_type: 'weekly',
          times_of_day: ['09:00', '17:00'],
          days_of_week: [1, 3, 5],
          payload: { task: 'weekly' },
        },
        mockClient
      );

      expect(mockClient.schedules.createSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduleId: 'weekly-task',
          metadata: expect.objectContaining({
            calendarSchedule: expect.objectContaining({
              type: 1, // WEEKLY
            }),
          }),
        })
      );
      expect(result).toContain('✓ Schedule created successfully');
    });

    it('should handle list_schedules', async () => {
      mockClient.schedules.listSchedules.mockResolvedValue([
        {
          scheduleId: 'schedule-1',
          metadata: {
            queueName: 'queue-1',
            cronSchedule: '0 9 * * *',
            state: 0,
            createdAt: new Date('2026-01-01'),
          },
        },
      ]);

      const result = await handleToolCall('list_schedules', {}, mockClient);

      expect(result).toContain('📅 Schedules (1 total)');
      expect(result).toContain('schedule-1');
    });

    it('should handle delete_schedule', async () => {
      mockClient.schedules.deleteSchedule.mockResolvedValue({ success: true });

      const result = await handleToolCall(
        'delete_schedule',
        {
          schedule_id: 'old-schedule',
        },
        mockClient
      );

      expect(mockClient.schedules.deleteSchedule).toHaveBeenCalledWith('old-schedule');
      expect(result).toContain('deleted successfully');
    });
  });

  describe('Schema Operations', () => {
    it('should handle register_schema', async () => {
      mockClient.schemas.registerSchema.mockResolvedValue({
        schemaId: 'user.profile.v1',
        version: 1,
        createdAt: '2026-01-01T00:00:00Z',
      });

      const result = await handleToolCall(
        'register_schema',
        {
          schema_id: 'user.profile.v1',
          name: 'User Profile',
          content: '{"type":"object"}',
          description: 'User profile schema',
        },
        mockClient
      );

      expect(mockClient.schemas.registerSchema).toHaveBeenCalledWith(
        'user.profile.v1',
        '{"type":"object"}',
        expect.objectContaining({
          name: 'User Profile',
          description: 'User profile schema',
        })
      );
      expect(result).toContain('✓ Schema registered successfully');
      expect(result).toContain('user.profile.v1');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unknown tool', async () => {
      await expect(handleToolCall('unknown_tool', {}, mockClient)).rejects.toThrow(
        'Unknown tool: unknown_tool'
      );
    });

    it('should propagate client errors', async () => {
      mockClient.queues.createQueue.mockRejectedValue(new Error('Connection failed'));

      await expect(
        handleToolCall(
          'create_queue',
          {
            queue_name: 'test-queue',
          },
          mockClient
        )
      ).rejects.toThrow('Connection failed');
    });
  });
});
