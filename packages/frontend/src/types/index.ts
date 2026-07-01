export interface User {
  userId: string;
  email: string;
  interests: string[];
  preferencePrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryHighlight {
  title: string;
  summary: string;
  sourceUrl?: string;
  relevance: string;
}

export interface SummarySection {
  interest: string;
  highlights: SummaryHighlight[];
}

export interface Summary {
  summaryId: string;
  userId: string;
  date: string;
  sections: SummarySection[];
  createdAt: string;
}

export interface Feedback {
  feedbackId: string;
  summaryId: string;
  userId: string;
  rating: 'up' | 'down';
  comment?: string;
  createdAt: string;
}

export interface ListSummariesResponse {
  summaries: Summary[];
  nextToken?: string;
}
