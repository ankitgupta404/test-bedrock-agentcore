import { z } from 'zod';
import {
  UserSchema,
  SummarySchema,
  SummaryHighlightSchema,
  SummarySectionSchema,
  FeedbackSchema,
  UpdateUserSchema,
  CreateFeedbackSchema,
  ListSummariesQuerySchema,
} from './schemas';

export type User = z.infer<typeof UserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type Summary = z.infer<typeof SummarySchema>;
export type SummaryHighlight = z.infer<typeof SummaryHighlightSchema>;
export type SummarySection = z.infer<typeof SummarySectionSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type CreateFeedbackInput = z.infer<typeof CreateFeedbackSchema>;
export type ListSummariesQuery = z.infer<typeof ListSummariesQuerySchema>;

// API Response types
export interface ListSummariesResponse {
  summaries: Summary[];
  nextToken?: string;
}

export interface GetFeedbackResponse {
  feedback: Feedback | null;
}

// DynamoDB item types
export interface DynamoDBItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  [key: string]: unknown;
}
