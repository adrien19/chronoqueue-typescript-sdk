/**
 * Task Handlers
 *
 * Implements handlers for each task type in the agent system.
 * Each handler processes a specific task type and returns a result.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import {
  TaskStatus,
  TaskType,
  type AgentTaskPayload,
  type AggregationTask,
  type CustomTask,
  type DataTransformTask,
  type HttpRequestTask,
  type NotificationTask,
  type ShellCommandTask,
  type TaskResult,
} from "./types.js";

const execFileAsync = promisify(execFile);

/**
 * Handler function type
 */
type TaskHandler<T extends AgentTaskPayload> = (
  task: T,
  context: HandlerContext,
) => Promise<unknown>;

/**
 * Context passed to handlers
 */
export interface HandlerContext {
  workerId: string;
  attemptId: string;
  sendHeartbeat: () => Promise<void>;
  log: (message: string) => void;
}

/**
 * Handle shell command execution
 */
async function handleShellCommand(
  task: ShellCommandTask,
  context: HandlerContext,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { command, args = [], cwd, env } = task;

  context.log(`Executing: ${command} ${args.join(" ")}`);

  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd: cwd || process.cwd(),
      env: { ...process.env, ...env },
      timeout: task.timeoutMs || 30000,
    });

    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout?.trim() || "",
      stderr: err.stderr?.trim() || err.message,
      exitCode: err.code || 1,
    };
  }
}

/**
 * Handle HTTP request execution
 */
async function handleHttpRequest(
  task: HttpRequestTask,
  context: HandlerContext,
): Promise<{ status: number; headers: Record<string, string>; body: unknown }> {
  const { url, method, headers = {}, body, expectedStatus = [200] } = task;

  context.log(`${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: task.timeoutMs ? AbortSignal.timeout(task.timeoutMs) : undefined,
  });

  // Clone response to allow fallback to text() if json() fails
  const responseClone = response.clone();
  const responseBody = await response.json().catch(() => responseClone.text());

  if (!expectedStatus.includes(response.status)) {
    throw new Error(
      `Unexpected status ${response.status}, expected one of: ${expectedStatus.join(", ")}`,
    );
  }

  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseBody,
  };
}

/**
 * Handle data transformation
 */
async function handleDataTransform(
  task: DataTransformTask,
  context: HandlerContext,
): Promise<unknown> {
  const { inputData, transformations } = task;
  let data = inputData;

  for (const transform of transformations) {
    context.log(`Applying transformation: ${transform.type}`);

    switch (transform.type) {
      case "map":
        if (Array.isArray(data)) {
          // Simple property extraction for safety
          const key = transform.expression;
          data = data.map((item: any) => item[key]);
        }
        break;

      case "filter":
        if (Array.isArray(data)) {
          const key = transform.expression.split("=")[0]?.trim();
          const value = transform.expression.split("=")[1]?.trim();
          data = data.filter((item: any) => String(item[key]) === value);
        }
        break;

      case "sort":
        if (Array.isArray(data)) {
          const key = transform.expression;
          data = [...data].sort((a: any, b: any) => {
            if (a[key] < b[key]) return -1;
            if (a[key] > b[key]) return 1;
            return 0;
          });
        }
        break;

      case "reduce":
        if (Array.isArray(data)) {
          const key = transform.expression;
          data = data.reduce(
            (acc: number, item: any) => acc + (Number(item[key]) || 0),
            0,
          );
        }
        break;

      default:
        context.log(`Unknown transformation type: ${transform.type}`);
    }
  }

  return data;
}

/**
 * Handle notification sending
 */
async function handleNotification(
  task: NotificationTask,
  context: HandlerContext,
): Promise<{ sent: boolean; channel: string; timestamp: string }> {
  const { channel, recipient, subject, message, metadata } = task;

  context.log(`Sending ${channel} notification to ${recipient}`);

  switch (channel) {
    case "console":
      console.log("\n📬 NOTIFICATION");
      console.log(`   To: ${recipient}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Message: ${message}`);
      if (metadata) {
        console.log(`   Metadata: ${JSON.stringify(metadata)}`);
      }
      break;

    case "webhook":
      // In production, this would POST to a webhook URL
      context.log(`Would send webhook to: ${recipient}`);
      break;

    case "email":
      // In production, this would send an email
      context.log(`Would send email to: ${recipient}`);
      break;

    case "slack":
      // In production, this would send to Slack
      context.log(`Would send Slack message to: ${recipient}`);
      break;
  }

  return {
    sent: true,
    channel,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle aggregation tasks
 */
async function handleAggregation(
  task: AggregationTask,
  context: HandlerContext,
): Promise<unknown> {
  const { sourceTaskIds, aggregationType } = task;

  context.log(
    `Aggregating ${sourceTaskIds.length} tasks using ${aggregationType}`,
  );

  // In a real implementation, this would fetch results from a result store
  // For demo purposes, we return a placeholder
  return {
    aggregationType,
    sourceCount: sourceTaskIds.length,
    sourceTaskIds,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle custom tasks
 */
async function handleCustom(
  task: CustomTask,
  context: HandlerContext,
): Promise<unknown> {
  const { handlerName, params } = task;

  context.log(`Executing custom handler: ${handlerName}`);

  // Custom handlers would be registered separately
  // For demo, we just echo the params
  return {
    handlerName,
    params,
    executed: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Task handler registry
 */
const handlers: Record<TaskType, TaskHandler<any>> = {
  [TaskType.SHELL_COMMAND]: handleShellCommand,
  [TaskType.HTTP_REQUEST]: handleHttpRequest,
  [TaskType.DATA_TRANSFORM]: handleDataTransform,
  [TaskType.NOTIFICATION]: handleNotification,
  [TaskType.AGGREGATION]: handleAggregation,
  [TaskType.CUSTOM]: handleCustom,
};

/**
 * Execute a task and return the result
 */
export async function executeTask(
  task: AgentTaskPayload,
  context: HandlerContext,
): Promise<TaskResult> {
  const startedAt = new Date();

  try {
    const handler = handlers[task.taskType];
    if (!handler) {
      throw new Error(`No handler registered for task type: ${task.taskType}`);
    }

    const output = await handler(task, context);

    const completedAt = new Date();
    return {
      taskId: task.taskId,
      status: TaskStatus.COMPLETED,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      output,
    };
  } catch (err: any) {
    const completedAt = new Date();
    return {
      taskId: task.taskId,
      status: TaskStatus.FAILED,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      error: {
        message: err.message,
        code: err.code,
        stack: err.stack,
      },
    };
  }
}
