import { ScheduledEvent } from 'aws-lambda';
import { getAllUsers, putSummary, getRecentFeedback } from '../services/dynamo';
import { generateResearchSummary } from '../services/bedrock';
import { getAgentMemory, updateAgentMemory } from '../services/memory';

export async function handler(event: ScheduledEvent): Promise<void> {
  console.log('Daily Research Agent triggered:', JSON.stringify(event));

  const today = new Date().toISOString().split('T')[0];

  try {
    // Get all users with configured interests
    const users = await getAllUsers();
    console.log(`Processing ${users.length} users`);

    for (const user of users) {
      try {
        console.log(`Processing user: ${user.userId} with interests: ${user.interests.join(', ')}`);

        // Get recent feedback for context
        const recentFeedback = await getRecentFeedback(user.userId, 5);
        const feedbackContext = recentFeedback
          .filter((f) => f.comment)
          .map((f) => `${f.rating === 'up' ? '👍' : '👎'}: ${f.comment}`)
          .join('\n');

        // Get agent memory for additional context
        const memory = await getAgentMemory(user.userId);

        // Generate research summary using Bedrock
        const result = await generateResearchSummary(
          user.interests,
          user.preferencePrompt,
          feedbackContext
        );

        // Store the summary
        const summaryId = crypto.randomUUID();
        await putSummary({
          summaryId,
          userId: user.userId,
          date: today,
          sections: result.sections,
          createdAt: new Date().toISOString(),
        });

        // Update agent memory
        await updateAgentMemory({
          userId: user.userId,
          lastRunDate: today,
          summaryCount: (memory?.summaryCount || 0) + 1,
          feedbackThemes: [
            ...(memory?.feedbackThemes || []),
            ...recentFeedback.filter((f) => f.comment).map((f) => f.comment!),
          ],
          preferenceHistory: [
            ...(memory?.preferenceHistory || []),
            user.preferencePrompt || '',
          ],
        });

        console.log(`Successfully generated summary for user: ${user.userId}`);
      } catch (userError) {
        console.error(`Error processing user ${user.userId}:`, userError);
        // Continue processing other users
      }
    }

    console.log('Daily Research Agent completed successfully');
  } catch (error) {
    console.error('Daily Research Agent failed:', error);
    throw error;
  }
}
