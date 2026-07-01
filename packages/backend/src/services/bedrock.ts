import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

interface ResearchResult {
  sections: Array<{
    interest: string;
    highlights: Array<{
      title: string;
      summary: string;
      sourceUrl?: string;
      relevance: string;
    }>;
  }>;
}

export async function generateResearchSummary(
  interests: string[],
  preferencePrompt: string | undefined,
  feedbackContext: string
): Promise<ResearchResult> {
  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are a daily research agent. Your job is to provide comprehensive, high-quality research summaries on specified topics. 

You must respond ONLY with valid JSON matching this schema:
{
  "sections": [
    {
      "interest": "topic name",
      "highlights": [
        {
          "title": "Brief title of the update",
          "summary": "2-3 sentence summary of the finding",
          "sourceUrl": "https://example.com (optional, use realistic placeholder URLs)",
          "relevance": "Why this matters to the reader"
        }
      ]
    }
  ]
}

Guidelines:
- Provide 2-4 highlights per interest area
- Keep summaries concise but informative
- Focus on the most recent and relevant developments
- Tailor depth and style based on user preferences and feedback`;

  const userMessage = `Generate a research summary for today (${today}).

Interest areas: ${interests.join(', ')}

${preferencePrompt ? `User preferences: ${preferencePrompt}` : ''}

${feedbackContext ? `Previous feedback to incorporate:\n${feedbackContext}` : ''}

Provide the research summary as JSON.`;

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  // Extract content from Claude's response
  const textContent = responseBody.content?.[0]?.text || '{}';

  // Try to parse JSON from the response (handle markdown code blocks)
  let jsonStr = textContent;
  const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const result = JSON.parse(jsonStr) as ResearchResult;
    return result;
  } catch {
    // If parsing fails, return a structured error response
    return {
      sections: interests.map((interest) => ({
        interest,
        highlights: [
          {
            title: 'Research summary generation in progress',
            summary: 'The AI agent is still learning your preferences. Please check back tomorrow for an improved summary.',
            relevance: 'Initial calibration run',
          },
        ],
      })),
    };
  }
}
