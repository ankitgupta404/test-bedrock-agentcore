import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { z } from 'zod';
import { listSummaries, getSummary } from '../services/dynamo';
import { success, badRequest, notFound, serverError, getUserId } from '../utils/response';

const ListSummariesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(30).default(7),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nextToken: z.string().optional(),
});

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = getUserId(event);
    const path = event.rawPath;

    // GET /summaries/:summaryId
    const summaryIdMatch = path.match(/\/summaries\/([^/]+)$/);
    if (summaryIdMatch && event.requestContext.http.method === 'GET') {
      const summaryId = summaryIdMatch[1];
      const summary = await getSummary(summaryId);

      if (!summary) {
        return notFound('Summary not found');
      }

      // Ensure user can only access their own summaries
      if (summary.userId !== userId) {
        return notFound('Summary not found');
      }

      return success(summary);
    }

    // GET /summaries
    if (event.requestContext.http.method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      const parsed = ListSummariesQuerySchema.safeParse(queryParams);

      if (!parsed.success) {
        return badRequest(`Validation error: ${parsed.error.message}`);
      }

      const { limit, startDate, endDate, nextToken } = parsed.data;
      const result = await listSummaries(userId, limit, startDate, endDate, nextToken);

      return success(result);
    }

    return badRequest('Method not allowed');
  } catch (error) {
    console.error('Summaries handler error:', error);
    return serverError('Internal server error');
  }
}
