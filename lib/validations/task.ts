import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().optional().default(""),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).default([]),
  meetingId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  position: z.number().int().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
