import { z } from 'zod';

// User Profile
export const UpdateUserSchema = z.object({
  interests: z.array(z.string().min(1).max(100)).min(1).max(4),
  preferencePrompt: z.string().max(1000).optional(),
});

export const UserSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  interests: z.array(z.string().min(1).max(100)).min(1).max(4),
  preferencePrompt: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Summary
export const SummaryHighlightSchema = z.object({
  title: z.string(),
  summary: z.string(),
  sourceUrl: z.string().url().optional(),
  relevance: z.string(),
});

export const SummarySectionSchema = z.object({
  interest: z.string(),
  highlights: z.array(SummaryHighlightSchema),
});

export const SummarySchema = z.object({
  summaryId: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sections: z.array(SummarySectionSchema),
  createdAt: z.string().datetime(),
});

// Feedback
export const CreateFeedbackSchema = z.object({
  rating: z.enum(['up', 'down']),
  comment: z.string().max(500).optional(),
});

export const FeedbackSchema = z.object({
  feedbackId: z.string(),
  summaryId: z.string(),
  userId: z.string(),
  rating: z.enum(['up', 'down']),
  comment: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
});

// Query params
export const ListSummariesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(30).default(7),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nextToken: z.string().optional(),
});
