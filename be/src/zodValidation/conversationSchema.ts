import z from "zod";

export const createConversationSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
});

export const getConversationsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
});

export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string(),
  }),
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().optional(),
  }),
});

export const exportConversationParamsSchema = z.object({
  params: z.object({
    conversationId: z.string(),
    type: z.enum(["csv", "json"]),
  }),
});
