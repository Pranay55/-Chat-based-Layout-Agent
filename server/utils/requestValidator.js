import { z } from "zod";

const HistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(5000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),

  layout: z.object({
    rootNodes: z.array(z.string()).min(1),
    nodes: z.record(z.any()),
  }),

  history: z.array(HistoryMessageSchema).max(20).default([]),
});

export function validateChatRequest(payload) {
  const result = ChatRequestSchema.safeParse(payload);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}