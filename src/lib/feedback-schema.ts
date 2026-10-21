import { z } from "zod";

export const feedbackSchema = z
  .object({
    score: z.number().int().min(1).max(5),
    comment: z.string().trim().min(1).max(2000),
  })
  .strict();

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export type ProductFeedback = {
  id: string;
  score: number;
  comment: string;
  created_at: string;
};
