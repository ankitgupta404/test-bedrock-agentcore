import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { z } from 'zod';
import { putFeedback, getFeedback, getSummary } from '../services/dynamo';
import { success, created, badRequest, notFound, serverError, getUserId } from '../utils/response';

const CreateFeedbackSchema = z.object({
  rating: z.enum(['up', 'down']),
  comment: z.string().max(500).optional(),
});

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = getUserId(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;

    // Extract summaryId from path: /summaries/:summaryId/feedback
    const match = path.match(/\/summaries\/([^/]+)\/feedback/);
    if (!match) {
      return badRequest('Invalid path');
    }
    const summaryId = match[1];

    // Verify user owns this summary
    const summary = await getSummary(summaryId);
    if (!summary || summary.userId !== userId) {
      return notFound('Summary not found');
    }

    if (method === 'POST') {
      if (!event.body) {
        return badRequest('Request body is required');
      }

      const parsed = CreateFeedbackSchema.safeParse(JSON.parse(event.body));
      if (!parsed.success) {
        return badRequest(`Validation error: ${parsed.error.message}`);
      }

      const now = new Date().toISOString();
      const feedbackId = crypto.randomUUID();

      const feedback = {
        feedbackId,
        summaryId,
        userId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        createdAt: now,
      };

      await putFeedback(feedback);
      return created(feedback);
    }

    if (method === 'GET') {
      const feedback = await getFeedback(userId, summaryId);
      return success({ feedback });
    }

    return badRequest('Method not allowed');
  } catch (error) {
    console.error('Feedback handler error:', error);
    return serverError('Internal server error');
  }
}
