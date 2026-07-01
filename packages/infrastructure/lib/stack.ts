import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthConstruct } from './auth-construct';
import { DatabaseConstruct } from './database-construct';
import { ApiConstruct } from './api-construct';
import { AgentConstruct } from './agent-construct';
import { FrontendConstruct } from './frontend-construct';

export class ResearchAgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Authentication
    const auth = new AuthConstruct(this, 'Auth');

    // Database
    const database = new DatabaseConstruct(this, 'Database');

    // API
    const api = new ApiConstruct(this, 'Api', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
      table: database.table,
    });

    // Agent (scheduled research)
    new AgentConstruct(this, 'Agent', {
      table: database.table,
    });

    // Frontend hosting
    const frontend = new FrontendConstruct(this, 'Frontend');

    // Stack outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.httpApi.apiEndpoint,
      description: 'API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: auth.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: auth.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontend.bucket.bucketName,
      description: 'S3 bucket for frontend assets',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: frontend.distribution.distributionId,
      description: 'CloudFront distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: frontend.distribution.distributionDomainName,
      description: 'CloudFront domain name',
    });
  }
}
