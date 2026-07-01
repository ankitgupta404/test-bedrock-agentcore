import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export interface AgentConstructProps {
  table: dynamodb.Table;
}

export class AgentConstruct extends Construct {
  public readonly agentFunction: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: AgentConstructProps) {
    super(scope, id);

    // Agent Lambda - longer timeout and more memory for AI processing
    this.agentFunction = new lambdaNodejs.NodejsFunction(this, 'AgentHandler', {
      functionName: 'research-agent-daily-runner',
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 512,
      timeout: cdk.Duration.minutes(5),
      entry: path.join(__dirname, '../../backend/src/handlers/agent.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: props.table.tableName,
        BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
      },
    });

    // Grant DynamoDB access
    props.table.grantReadWriteData(this.agentFunction);

    // Grant Bedrock InvokeModel permission (least privilege)
    this.agentFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: [
          `arn:aws:bedrock:${cdk.Stack.of(this).region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`,
        ],
      })
    );

    // EventBridge Scheduler - midnight UTC daily
    const rule = new events.Rule(this, 'DailySchedule', {
      ruleName: 'research-agent-daily-schedule',
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '0',
        day: '*',
        month: '*',
        year: '*',
      }),
      description: 'Triggers the daily research agent at midnight UTC',
    });

    rule.addTarget(new eventsTargets.LambdaFunction(this.agentFunction));
  }
}
