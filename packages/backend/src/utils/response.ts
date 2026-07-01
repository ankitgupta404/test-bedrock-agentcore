import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';

export function success(body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export function created(body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export function badRequest(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    },
    body: JSON.stringify({ error: message }),
  };
}

export function notFound(message: string = 'Not found'): APIGatewayProxyResultV2 {
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    },
    body: JSON.stringify({ error: message }),
  };
}

export function serverError(message: string = 'Internal server error'): APIGatewayProxyResultV2 {
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    },
    body: JSON.stringify({ error: message }),
  };
}

export function getUserId(event: APIGatewayProxyEventV2WithJWTAuthorizer): string {
  const claims = event.requestContext.authorizer.jwt.claims;
  return claims.sub as string;
}

export function getUserEmail(event: APIGatewayProxyEventV2WithJWTAuthorizer): string {
  const claims = event.requestContext.authorizer.jwt.claims;
  return claims.email as string;
}
