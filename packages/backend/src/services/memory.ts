// AgentCore Long-term Memory service
// This provides a simple interface for storing and retrieving agent context

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.TABLE_NAME!;

export interface AgentMemory {
  userId: string;
  lastRunDate: string;
  summaryCount: number;
  feedbackThemes: string[];
  preferenceHistory: string[];
}

export async function getAgentMemory(userId: string): Promise<AgentMemory | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: 'AGENT_MEMORY' },
    })
  );
  if (!result.Item) return null;
  return {
    userId: result.Item.userId,
    lastRunDate: result.Item.lastRunDate,
    summaryCount: result.Item.summaryCount || 0,
    feedbackThemes: result.Item.feedbackThemes || [],
    preferenceHistory: result.Item.preferenceHistory || [],
  };
}

export async function updateAgentMemory(memory: AgentMemory): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${memory.userId}`,
        SK: 'AGENT_MEMORY',
        userId: memory.userId,
        lastRunDate: memory.lastRunDate,
        summaryCount: memory.summaryCount,
        feedbackThemes: memory.feedbackThemes.slice(-10), // Keep last 10 themes
        preferenceHistory: memory.preferenceHistory.slice(-5), // Keep last 5 preference snapshots
      },
    })
  );
}
