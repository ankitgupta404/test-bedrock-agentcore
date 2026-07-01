#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ResearchAgentStack } from '../lib/stack';

const app = new cdk.App();

new ResearchAgentStack(app, 'ResearchAgentStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
  },
  description: 'Daily Research Agent with Personalized Summaries',
});
