import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigatewayv2Authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

export interface ApiConstructProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  table: dynamodb.Table;
}

export class ApiConstruct extends Construct {
  public readonly httpApi: apigatewayv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    // JWT Authorizer
    const authorizer = new apigatewayv2Authorizers.HttpJwtAuthorizer(
      'CognitoAuthorizer',
      `https://cognito-idp.${cdk.Stack.of(this).region}.amazonaws.com/${props.userPool.userPoolId}`,
      {
        jwtAudience: [props.userPoolClient.userPoolClientId],
      }
    );

    // HTTP API
    this.httpApi = new apigatewayv2.HttpApi(this, 'HttpApi', {
      apiName: 'research-agent-api',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.PUT,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.DELETE,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.hours(1),
      },
    });

    // Common Lambda environment
    const lambdaEnv = {
      TABLE_NAME: props.table.tableName,
      NODE_OPTIONS: '--enable-source-maps',
    };

    // Common Lambda props
    const commonLambdaProps: Partial<lambdaNodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: lambdaEnv,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
      },
    };

    // Users Handler
    const usersHandler = new lambdaNodejs.NodejsFunction(this, 'UsersHandler', {
      ...commonLambdaProps,
      functionName: 'research-agent-users',
      entry: path.join(__dirname, '../../backend/src/handlers/users.ts'),
      handler: 'handler',
    });
    props.table.grantReadWriteData(usersHandler);

    // Summaries Handler
    const summariesHandler = new lambdaNodejs.NodejsFunction(this, 'SummariesHandler', {
      ...commonLambdaProps,
      functionName: 'research-agent-summaries',
      entry: path.join(__dirname, '../../backend/src/handlers/summaries.ts'),
      handler: 'handler',
    });
    props.table.grantReadData(summariesHandler);

    // Feedback Handler
    const feedbackHandler = new lambdaNodejs.NodejsFunction(this, 'FeedbackHandler', {
      ...commonLambdaProps,
      functionName: 'research-agent-feedback',
      entry: path.join(__dirname, '../../backend/src/handlers/feedback.ts'),
      handler: 'handler',
    });
    props.table.grantReadWriteData(feedbackHandler);

    // API Routes
    // Users
    this.httpApi.addRoutes({
      path: '/users/me',
      methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.PUT],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration('UsersIntegration', usersHandler),
      authorizer,
    });

    // Summaries
    this.httpApi.addRoutes({
      path: '/summaries',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration('SummariesListIntegration', summariesHandler),
      authorizer,
    });

    this.httpApi.addRoutes({
      path: '/summaries/{summaryId}',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration('SummariesGetIntegration', summariesHandler),
      authorizer,
    });

    // Feedback
    this.httpApi.addRoutes({
      path: '/summaries/{summaryId}/feedback',
      methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.POST],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration('FeedbackIntegration', feedbackHandler),
      authorizer,
    });
  }
}
