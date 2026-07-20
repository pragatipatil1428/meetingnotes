import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  notes: z.string().default(""),
  meetingAt: z.string().min(1, "Meeting date is required"),
  tags: z.array(z.string()).default([]),
  participants: z
    .array(z.object({ email: z.string().email(), name: z.string().optional() }))
    .default([]),
});

export const updateMeetingSchema = createMeetingSchema.partial().extend({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  summary: z.string().optional(),
  keyDecisions: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
  startedAt: z.string().datetime().optional().nullable(),
  timeSpent: z.number().int().min(0).optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
