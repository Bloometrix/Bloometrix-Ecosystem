import { z } from "zod"

/** Schema for scheduling a new task via Typeform submission. */
export const cronRegex =
  /^(\*|[0-5]?\d) (\*|[01]?\d|2[0-3]) (\*|[1-9]|[12]\d|3[01]) (\*|[1-9]|1[0-2]) (\*|[0-6])$/

export const TaskFormSchema = z
  .object({
    taskName: z
      .string()
      .trim()
      .min(3, "Task name must be at least 3 characters")
      .max(100, "Task name must be at most 100 characters"),
    taskType: z.enum(["anomalyScan", "tokenAnalytics", "whaleMonitor"]),
    parameters: z
      .record(z.string(), z.string())
      .refine(obj => Object.keys(obj).length > 0, {
        message: "At least one parameter must be provided",
      }),
    scheduleCron: z
      .string()
      .regex(cronRegex, { message: "Invalid cron expression (m h D M d)" }),
  })
  .strict()

export type TaskFormInput = z.infer<typeof TaskFormSchema>
export type TaskType = TaskFormInput["taskType"]

/** Safe parser that returns success/data or error details (no throw). */
export function parseTaskForm(input: unknown) {
  const res = TaskFormSchema.safeParse(input)
  if (res.success) return { success: true as const, data: res.data }
  return { success: false as const, error: res.error.flatten().fieldErrors }
}
