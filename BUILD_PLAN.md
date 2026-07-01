# BUILD PLAN: Daily Research Agent with Personalized Summaries

## Application Overview

A full-stack AI-powered daily research agent that delivers personalized research summaries based on user interests. The system:

1. **User Management**: Users register, authenticate, and configure research interests
2. **Daily Agent Execution**: A scheduled agent runs at midnight GMT, performing web research tailored to each user's interests and preferences
3. **Summary Delivery**: Users log in to read their daily curated research summaries
4. **Feedback Loop**: Users provide feedback that improves future summaries via long-term memory

## Technology Stack

### Frontend
- **React 18** + **Vite** + **Tailwind CSS**
- **React Router v6** for navigation
- **Amazon Cognito** integration via `@aws-amplify/auth` for authentication
- Responsive, mobile-friendly design

### Backend
- **AWS Lambda** (Node.js 20) for API handlers
- **Amazon API Gateway** (HTTP API) with Cognito JWT authorizer
- **Amazon DynamoDB** (single-table design) for data storage
- **Amazon EventBridge Scheduler** for daily midnight GMT trigger
- **Amazon Bedrock** (Claude Sonnet) for AI-powered research and summarization
- **Bedrock AgentCore Long-term Memory** for cross-session agent context

### Infrastructure
- **AWS CDK** (TypeScript) for all infrastructure as code
- **Amazon Cognito** User Pool for authentication
- **Amazon S3** + **CloudFront** for frontend hosting

### Shared
- **TypeScript** across all packages
- **Zod** for runtime validation and shared schemas

## Project Structure

```
/
├── BUILD_PLAN.md
├── packages/
│   ├── shared/                    # Shared types and schemas
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── schemas.ts         # Zod schemas
│   │       └── types.ts           # TypeScript interfaces
│   ├── infrastructure/            # CDK stack
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── cdk.json
│   │   ├── bin/
│   │   │   └── app.ts
│   │   └── lib/
│   │       ├── stack.ts           # Main CDK stack
│   │       ├── auth-construct.ts  # Cognito resources
│   │       ├── api-construct.ts   # API Gateway + Lambda
│   │       ├── database-construct.ts  # DynamoDB
│   │       ├── agent-construct.ts # EventBridge + Agent Lambda
│   │       └── frontend-construct.ts  # S3 + CloudFront
│   ├── backend/                   # Lambda handlers
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── users.ts       # User profile CRUD
│   │       │   ├── summaries.ts   # Get summaries
│   │       │   ├── feedback.ts    # Submit feedback
│   │       │   └── agent.ts       # Daily research agent handler
│   │       ├── services/
│   │       │   ├── dynamo.ts      # DynamoDB operations
│   │       │   ├── bedrock.ts     # Bedrock model invocation
│   │       │   └── memory.ts      # AgentCore memory service
│   │       └── utils/
│   │           ├── response.ts    # HTTP response helpers
│   │           └── validation.ts  # Input validation
│   └── frontend/                  # React SPA
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── components/
│           │   ├── Layout.tsx
│           │   ├── ProtectedRoute.tsx
│           │   ├── SummaryCard.tsx
│           │   ├── InterestTag.tsx
│           │   └── FeedbackWidget.tsx
│           ├── pages/
│           │   ├── Login.tsx
│           │   ├── Register.tsx
│           │   ├── Dashboard.tsx
│           │   ├── Settings.tsx
│           │   └── History.tsx
│           ├── hooks/
│           │   ├── useAuth.ts
│           │   └── useApi.ts
│           ├── services/
│           │   ├── auth.ts
│           │   └── api.ts
│           └── types/
│               └── index.ts
└── package.json                   # Root workspace
```

## API Contract

### Base URL
`{ApiGatewayUrl}/`

### Authentication
All endpoints require a valid Cognito JWT token in the `Authorization` header:
```
Authorization: Bearer <id_token>
```

### Endpoints

#### User Profile

**GET /users/me**
Get the current user's profile and interests.

Response (200):
```json
{
  "userId": "string",
  "email": "string",
  "interests": ["AI/ML", "AWS services", "Distributed systems"],
  "preferencePrompt": "I prefer technical deep-dives over news summaries...",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

**PUT /users/me**
Update user profile, interests, and preferences.

Request:
```json
{
  "interests": ["AI/ML", "AWS services", "Rust programming"],
  "preferencePrompt": "Focus on practical implementations and new open-source tools"
}
```

Response (200):
```json
{
  "userId": "string",
  "email": "string",
  "interests": ["AI/ML", "AWS services", "Rust programming"],
  "preferencePrompt": "Focus on practical implementations...",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

#### Summaries

**GET /summaries**
Get summaries for the current user. Supports pagination and date filtering.

Query Params:
- `limit` (optional, default: 7, max: 30)
- `startDate` (optional, ISO date)
- `endDate` (optional, ISO date)

Response (200):
```json
{
  "summaries": [
    {
      "summaryId": "string",
      "userId": "string",
      "date": "2026-01-01",
      "sections": [
        {
          "interest": "AI/ML",
          "highlights": [
            {
              "title": "New breakthrough in LLM efficiency",
              "summary": "Researchers published...",
              "sourceUrl": "https://...",
              "relevance": "Directly relates to your interest in practical implementations"
            }
          ]
        }
      ],
      "createdAt": "2026-01-01T00:05:00Z"
    }
  ],
  "nextToken": "string|null"
}
```

**GET /summaries/:summaryId**
Get a single summary by ID.

Response (200): Same as individual summary object above.

#### Feedback

**POST /summaries/:summaryId/feedback**
Submit feedback for a summary.

Request:
```json
{
  "rating": "up|down",
  "comment": "More depth on the Rust section please"
}
```

Response (201):
```json
{
  "feedbackId": "string",
  "summaryId": "string",
  "rating": "up",
  "comment": "More depth on the Rust section please",
  "createdAt": "2026-01-01T10:00:00Z"
}
```

**GET /summaries/:summaryId/feedback**
Get feedback for a specific summary.

Response (200):
```json
{
  "feedback": {
    "feedbackId": "string",
    "summaryId": "string",
    "rating": "up",
    "comment": "string",
    "createdAt": "string"
  }
}
```

## Data Models (Zod Schemas)

```typescript
// User Profile
const UserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  interests: z.array(z.string().min(1).max(100)).min(1).max(4),
  preferencePrompt: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Summary
const SummaryHighlightSchema = z.object({
  title: z.string(),
  summary: z.string(),
  sourceUrl: z.string().url().optional(),
  relevance: z.string(),
});

const SummarySectionSchema = z.object({
  interest: z.string(),
  highlights: z.array(SummaryHighlightSchema),
});

const SummarySchema = z.object({
  summaryId: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sections: z.array(SummarySectionSchema),
  createdAt: z.string().datetime(),
});

// Feedback
const FeedbackSchema = z.object({
  feedbackId: z.string().uuid(),
  summaryId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.enum(["up", "down"]),
  comment: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
});
```

## DynamoDB Single-Table Design

### Table Name: `ResearchAgent-Table`

**Partition Key**: `PK` (String)
**Sort Key**: `SK` (String)
**GSI1**: `GSI1PK` (String) / `GSI1SK` (String)

### Access Patterns

| Entity | PK | SK | GSI1PK | GSI1SK | Attributes |
|--------|----|----|--------|--------|------------|
| User | `USER#<userId>` | `PROFILE` | `EMAIL#<email>` | `USER` | email, interests, preferencePrompt, createdAt, updatedAt |
| Summary | `USER#<userId>` | `SUMMARY#<date>#<summaryId>` | `SUMMARY#<summaryId>` | `USER#<userId>` | date, sections (JSON), createdAt |
| Feedback | `USER#<userId>` | `FEEDBACK#<summaryId>` | `SUMMARY#<summaryId>` | `FEEDBACK#<userId>` | rating, comment, createdAt |

### Access Pattern Queries

1. **Get user by ID**: PK = `USER#<userId>`, SK = `PROFILE`
2. **Get user by email**: GSI1PK = `EMAIL#<email>`, GSI1SK = `USER`
3. **List user summaries (by date)**: PK = `USER#<userId>`, SK begins_with `SUMMARY#`, ScanIndexForward = false
4. **Get summary by ID**: GSI1PK = `SUMMARY#<summaryId>`
5. **Get feedback for summary**: PK = `USER#<userId>`, SK = `FEEDBACK#<summaryId>`
6. **List all users (for agent)**: Scan with filter SK = `PROFILE` (acceptable for small user count; add GSI for scale)

## CDK Infrastructure

### Stack: `ResearchAgentStack`

#### Cognito Construct
- User Pool with email sign-up
- User Pool Client (SPA, no secret)
- Password policy: 8+ chars, require lowercase, uppercase, digits
- Email verification enabled

#### Database Construct
- DynamoDB table with on-demand billing
- GSI1 for email lookups and summary access
- Point-in-time recovery enabled
- Removal policy: RETAIN

#### API Construct
- HTTP API (API Gateway v2)
- Cognito JWT Authorizer
- Lambda functions (NodejsFunction with esbuild bundling):
  - `GET /users/me` → usersHandler
  - `PUT /users/me` → usersHandler
  - `GET /summaries` → summariesHandler
  - `GET /summaries/{summaryId}` → summariesHandler
  - `POST /summaries/{summaryId}/feedback` → feedbackHandler
  - `GET /summaries/{summaryId}/feedback` → feedbackHandler
- All Lambdas: 256MB memory, 30s timeout, Node.js 20

#### Agent Construct
- Lambda function for the research agent (512MB, 5min timeout)
- EventBridge Scheduler rule: `cron(0 0 * * ? *)` (midnight UTC daily)
- IAM permissions for Bedrock InvokeModel
- IAM permissions for DynamoDB read/write

#### Frontend Construct
- S3 bucket (private, website hosting via CloudFront)
- CloudFront distribution with OAC
- Auto-delete objects on destroy (for dev environments)

### Stack Outputs
- `ApiUrl` - API Gateway endpoint
- `UserPoolId` - Cognito User Pool ID
- `UserPoolClientId` - Cognito User Pool Client ID
- `FrontendBucketName` - S3 bucket for frontend assets
- `DistributionId` - CloudFront distribution ID
- `DistributionDomainName` - CloudFront domain for the app

## UI Pages & Components

### Pages

1. **Login** (`/login`)
   - Email + password form
   - Link to register page
   - Cognito authentication

2. **Register** (`/register`)
   - Email + password form
   - Password requirements displayed
   - Email verification step
   - Redirect to settings on first login

3. **Dashboard** (`/` - default authenticated route)
   - Today's research summary (or latest available)
   - Summary grouped by interest area
   - Each highlight shows title, summary, source link, relevance
   - Feedback widget (thumbs up/down + comment)
   - "No summary yet" state for new users

4. **Settings** (`/settings`)
   - Interest tags (add/remove, max 4)
   - Free-text preference prompt textarea
   - Save button with confirmation

5. **History** (`/history`)
   - List of past summaries (past 30 days)
   - Date picker/filter
   - Click to expand individual summary
   - Shows feedback status per summary

### Components

- **Layout**: Nav bar with app name, user menu (settings, logout), responsive sidebar/hamburger
- **ProtectedRoute**: Auth guard, redirects to login if not authenticated
- **SummaryCard**: Displays a single interest section with highlights
- **InterestTag**: Pill/chip component for interest areas (add/remove)
- **FeedbackWidget**: Thumbs up/down buttons + optional comment modal

## Agent Logic (Research Agent Lambda)

The daily research agent runs as follows:

1. **Scan for all users** with configured interests
2. **For each user**:
   a. Read user interests and preference prompt from DynamoDB
   b. Read previous feedback from AgentCore Long-term Memory (or DynamoDB fallback)
   c. Construct a personalized research prompt including:
      - Interest areas
      - Preference prompt
      - Recent feedback themes
      - Date context (what to research)
   d. Invoke Bedrock Claude with the research prompt
   e. Parse the structured response into summary sections
   f. Store the summary in DynamoDB
   g. Update long-term memory with execution context
3. **Log execution metrics** to CloudWatch

### Bedrock Prompt Strategy
- System prompt defines the research agent's role and output format
- User message includes interests, preferences, and feedback context
- Response is requested in structured JSON matching the Summary schema
- maxTokens set explicitly (4096) to avoid quota issues

## Security Considerations

- All API endpoints require valid Cognito JWT
- DynamoDB operations scoped to authenticated user's ID (from JWT claims)
- Lambda IAM roles follow least-privilege:
  - API Lambdas: DynamoDB read/write on specific table only
  - Agent Lambda: DynamoDB read/write + Bedrock InvokeModel
- S3 bucket is private, accessed only via CloudFront OAC
- No hardcoded secrets; all configuration via environment variables
- HTTPS enforced via CloudFront

## Implementation Order

1. Shared types package (schemas + types)
2. CDK infrastructure (all constructs)
3. Backend Lambda handlers (users, summaries, feedback)
4. Agent Lambda handler (research + Bedrock integration)
5. Frontend React application (all pages + components)
6. Testing and validation
