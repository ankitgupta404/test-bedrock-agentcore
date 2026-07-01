import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.TABLE_NAME!;

export interface UserRecord {
  userId: string;
  email: string;
  interests: string[];
  preferencePrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryRecord {
  summaryId: string;
  userId: string;
  date: string;
  sections: Array<{
    interest: string;
    highlights: Array<{
      title: string;
      summary: string;
      sourceUrl?: string;
      relevance: string;
    }>;
  }>;
  createdAt: string;
}

export interface FeedbackRecord {
  feedbackId: string;
  summaryId: string;
  userId: string;
  rating: 'up' | 'down';
  comment?: string;
  createdAt: string;
}

// User operations
export async function getUser(userId: string): Promise<UserRecord | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
    })
  );
  if (!result.Item) return null;
  return {
    userId: result.Item.userId,
    email: result.Item.email,
    interests: result.Item.interests || [],
    preferencePrompt: result.Item.preferencePrompt,
    createdAt: result.Item.createdAt,
    updatedAt: result.Item.updatedAt,
  };
}

export async function createUser(user: UserRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${user.userId}`,
        SK: 'PROFILE',
        GSI1PK: `EMAIL#${user.email}`,
        GSI1SK: 'USER',
        userId: user.userId,
        email: user.email,
        interests: user.interests,
        preferencePrompt: user.preferencePrompt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  );
}

export async function updateUser(
  userId: string,
  interests: string[],
  preferencePrompt?: string
): Promise<UserRecord | null> {
  const now = new Date().toISOString();
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET interests = :interests, preferencePrompt = :prompt, updatedAt = :now',
      ExpressionAttributeValues: {
        ':interests': interests,
        ':prompt': preferencePrompt,
        ':now': now,
      },
      ReturnValues: 'ALL_NEW',
      ConditionExpression: 'attribute_exists(PK)',
    })
  );
  if (!result.Attributes) return null;
  return {
    userId: result.Attributes.userId,
    email: result.Attributes.email,
    interests: result.Attributes.interests || [],
    preferencePrompt: result.Attributes.preferencePrompt,
    createdAt: result.Attributes.createdAt,
    updatedAt: result.Attributes.updatedAt,
  };
}

// Summary operations
export async function putSummary(summary: SummaryRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${summary.userId}`,
        SK: `SUMMARY#${summary.date}#${summary.summaryId}`,
        GSI1PK: `SUMMARY#${summary.summaryId}`,
        GSI1SK: `USER#${summary.userId}`,
        summaryId: summary.summaryId,
        userId: summary.userId,
        date: summary.date,
        sections: summary.sections,
        createdAt: summary.createdAt,
      },
    })
  );
}

export async function listSummaries(
  userId: string,
  limit: number = 7,
  startDate?: string,
  endDate?: string,
  nextToken?: string
): Promise<{ summaries: SummaryRecord[]; nextToken?: string }> {
  let keyCondition = 'PK = :pk AND begins_with(SK, :prefix)';
  const expressionValues: Record<string, unknown> = {
    ':pk': `USER#${userId}`,
    ':prefix': 'SUMMARY#',
  };

  if (startDate && endDate) {
    keyCondition = 'PK = :pk AND SK BETWEEN :start AND :end';
    expressionValues[':start'] = `SUMMARY#${startDate}`;
    expressionValues[':end'] = `SUMMARY#${endDate}~`;
  } else if (startDate) {
    keyCondition = 'PK = :pk AND SK >= :start';
    expressionValues[':start'] = `SUMMARY#${startDate}`;
  }

  const params: Record<string, unknown> = {
    TableName: TABLE_NAME,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: expressionValues,
    Limit: limit,
    ScanIndexForward: false,
  };

  if (nextToken) {
    params.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
  }

  const result = await docClient.send(new QueryCommand(params as any));

  const summaries: SummaryRecord[] = (result.Items || []).map((item) => ({
    summaryId: item.summaryId,
    userId: item.userId,
    date: item.date,
    sections: item.sections,
    createdAt: item.createdAt,
  }));

  let token: string | undefined;
  if (result.LastEvaluatedKey) {
    token = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
  }

  return { summaries, nextToken: token };
}

export async function getSummary(summaryId: string): Promise<SummaryRecord | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `SUMMARY#${summaryId}` },
      Limit: 1,
    })
  );
  if (!result.Items || result.Items.length === 0) return null;
  const item = result.Items[0];
  return {
    summaryId: item.summaryId,
    userId: item.userId,
    date: item.date,
    sections: item.sections,
    createdAt: item.createdAt,
  };
}

// Feedback operations
export async function putFeedback(feedback: FeedbackRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${feedback.userId}`,
        SK: `FEEDBACK#${feedback.summaryId}`,
        GSI1PK: `SUMMARY#${feedback.summaryId}`,
        GSI1SK: `FEEDBACK#${feedback.userId}`,
        feedbackId: feedback.feedbackId,
        summaryId: feedback.summaryId,
        userId: feedback.userId,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
      },
    })
  );
}

export async function getFeedback(userId: string, summaryId: string): Promise<FeedbackRecord | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `FEEDBACK#${summaryId}` },
    })
  );
  if (!result.Item) return null;
  return {
    feedbackId: result.Item.feedbackId,
    summaryId: result.Item.summaryId,
    userId: result.Item.userId,
    rating: result.Item.rating,
    comment: result.Item.comment,
    createdAt: result.Item.createdAt,
  };
}

// Agent operations - get all users for agent processing
export async function getAllUsers(): Promise<UserRecord[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'SK = :sk AND size(interests) > :zero',
      ExpressionAttributeValues: {
        ':sk': 'PROFILE',
        ':zero': 0,
      },
    })
  );
  return (result.Items || []).map((item) => ({
    userId: item.userId,
    email: item.email,
    interests: item.interests || [],
    preferencePrompt: item.preferencePrompt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

// Get recent feedback for a user (for agent context)
export async function getRecentFeedback(userId: string, limit: number = 5): Promise<FeedbackRecord[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':prefix': 'FEEDBACK#',
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items || []).map((item) => ({
    feedbackId: item.feedbackId,
    summaryId: item.summaryId,
    userId: item.userId,
    rating: item.rating,
    comment: item.comment,
    createdAt: item.createdAt,
  }));
}
