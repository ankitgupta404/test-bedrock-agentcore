import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { z } from 'zod';
import { getUser, createUser, updateUser } from '../services/dynamo';
import { success, badRequest, notFound, serverError, getUserId, getUserEmail } from '../utils/response';

const UpdateUserSchema = z.object({
  interests: z.array(z.string().min(1).max(100)).min(1).max(4),
  preferencePrompt: z.string().max(1000).optional(),
});

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> {
  try {
    const method = event.requestContext.http.method;
    const userId = getUserId(event);
    const email = getUserEmail(event);

    if (method === 'GET') {
      let user = await getUser(userId);

      // Auto-create user profile on first access
      if (!user) {
        const now = new Date().toISOString();
        user = {
          userId,
          email,
          interests: [],
          createdAt: now,
          updatedAt: now,
        };
        await createUser(user);
      }

      return success(user);
    }

    if (method === 'PUT') {
      if (!event.body) {
        return badRequest('Request body is required');
      }

      const parsed = UpdateUserSchema.safeParse(JSON.parse(event.body));
      if (!parsed.success) {
        return badRequest(`Validation error: ${parsed.error.message}`);
      }

      // Ensure user exists first
      let existingUser = await getUser(userId);
      if (!existingUser) {
        const now = new Date().toISOString();
        existingUser = {
          userId,
          email,
          interests: [],
          createdAt: now,
          updatedAt: now,
        };
        await createUser(existingUser);
      }

      const updated = await updateUser(userId, parsed.data.interests, parsed.data.preferencePrompt);
      if (!updated) {
        return notFound('User not found');
      }

      return success(updated);
    }

    return badRequest('Method not allowed');
  } catch (error) {
    console.error('Users handler error:', error);
    return serverError('Internal server error');
  }
}
