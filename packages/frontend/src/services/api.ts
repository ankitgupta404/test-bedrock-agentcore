import { getIdToken } from './auth';
import type { User, Summary, ListSummariesResponse, Feedback } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';
const DEMO_MODE = !API_URL;

// Demo data
const DEMO_USER: User = {
  userId: 'demo-user-123',
  email: 'demo@example.com',
  interests: ['AI/ML', 'AWS Services', 'Distributed Systems'],
  preferencePrompt: 'I prefer technical deep-dives over news summaries, focus on practical implementations and new open-source tools, skip marketing announcements.',
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_SUMMARIES: Summary[] = [
  {
    summaryId: 'summary-001',
    userId: 'demo-user-123',
    date: new Date().toISOString().split('T')[0],
    sections: [
      {
        interest: 'AI/ML',
        highlights: [
          {
            title: 'Claude 4 Launches with Enhanced Reasoning',
            summary: 'Anthropic released Claude 4 with significantly improved reasoning capabilities, longer context windows (500K tokens), and native tool use support. The model shows 40% improvement on math and coding benchmarks.',
            sourceUrl: 'https://anthropic.com/news',
            relevance: 'Major advancement in LLM capabilities relevant to your AI/ML interests.',
          },
          {
            title: 'New Open-Source Vision-Language Model: LLaVA-Next-34B',
            summary: 'Meta released LLaVA-Next-34B, an open-source multimodal model that achieves GPT-4V parity on visual reasoning tasks. Available on HuggingFace with Apache 2.0 license.',
            sourceUrl: 'https://huggingface.co/llava-hf',
            relevance: 'Open-source alternative for multimodal AI applications.',
          },
        ],
      },
      {
        interest: 'AWS Services',
        highlights: [
          {
            title: 'Amazon Bedrock AgentCore GA Release',
            summary: 'AWS announces General Availability of Bedrock AgentCore, enabling production-grade AI agent deployments with built-in observability, long-term memory, and automated scaling. Supports multi-agent orchestration patterns.',
            sourceUrl: 'https://aws.amazon.com/bedrock/agentcore',
            relevance: 'Directly relevant to building production AI agents on AWS.',
          },
          {
            title: 'DynamoDB Zero-ETL Integration with Redshift',
            summary: 'New zero-ETL integration allows real-time analytics on DynamoDB data through Amazon Redshift without managing data pipelines. Supports incremental updates with sub-minute latency.',
            sourceUrl: 'https://aws.amazon.com/dynamodb',
            relevance: 'Simplifies analytics on DynamoDB data without additional infrastructure.',
          },
        ],
      },
      {
        interest: 'Distributed Systems',
        highlights: [
          {
            title: 'TigerBeetle v1.0: Financial Transactions Database',
            summary: 'TigerBeetle reaches 1.0 milestone - a purpose-built database for financial transactions achieving 1M TPS with strict serializability. Written in Zig, uses io_uring for I/O.',
            sourceUrl: 'https://tigerbeetle.com',
            relevance: 'Novel approach to high-performance financial systems with strong consistency guarantees.',
          },
          {
            title: 'Jepsen Analysis of FoundationDB 7.3',
            summary: 'Kyle Kingsbury published Jepsen test results for FoundationDB 7.3, confirming its strict serializability claims hold even under extreme network partitions and clock skew.',
            sourceUrl: 'https://jepsen.io',
            relevance: 'Rigorous distributed systems testing with practical implications for system design.',
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    summaryId: 'summary-002',
    userId: 'demo-user-123',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sections: [
      {
        interest: 'AI/ML',
        highlights: [
          {
            title: 'Mixture of Experts at Scale: DeepSeek-V3 Architecture Deep Dive',
            summary: 'Technical paper analyzing DeepSeek-V3\'s MoE architecture, showing how sparse expert selection enables 671B parameter models with only 37B active parameters per inference. Load balancing innovations reduce expert collapse.',
            sourceUrl: 'https://arxiv.org',
            relevance: 'Practical insights into scaling transformer architectures efficiently.',
          },
        ],
      },
      {
        interest: 'AWS Services',
        highlights: [
          {
            title: 'Lambda SnapStart Now Supports Python and Node.js',
            summary: 'AWS extends SnapStart to Python 3.12+ and Node.js 20+ runtimes, reducing cold start latency by up to 90% through memory snapshot restoration.',
            sourceUrl: 'https://aws.amazon.com/lambda',
            relevance: 'Significant performance improvement for serverless workloads.',
          },
        ],
      },
      {
        interest: 'Distributed Systems',
        highlights: [
          {
            title: 'CockroachDB Introduces Global Tables',
            summary: 'CockroachDB 24.2 introduces Global Tables with guaranteed 150ms read latency worldwide through a novel read-replica protocol that maintains linearizability.',
            sourceUrl: 'https://cockroachlabs.com',
            relevance: 'New approach to geo-distributed strong consistency.',
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

let demoFeedback: Record<string, Feedback> = {};

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response;
}

// User API
export async function getProfile(): Promise<User> {
  if (DEMO_MODE) {
    const email = localStorage.getItem('demo_email') || 'demo@example.com';
    return { ...DEMO_USER, email };
  }
  const response = await fetchWithAuth('/users/me');
  return response.json();
}

export async function updateProfile(interests: string[], preferencePrompt?: string): Promise<User> {
  if (DEMO_MODE) {
    DEMO_USER.interests = interests;
    if (preferencePrompt !== undefined) DEMO_USER.preferencePrompt = preferencePrompt;
    DEMO_USER.updatedAt = new Date().toISOString();
    return { ...DEMO_USER };
  }
  const response = await fetchWithAuth('/users/me', {
    method: 'PUT',
    body: JSON.stringify({ interests, preferencePrompt }),
  });
  return response.json();
}

// Summaries API
export async function listSummaries(
  limit?: number,
  startDate?: string,
  endDate?: string
): Promise<ListSummariesResponse> {
  if (DEMO_MODE) {
    let summaries = [...DEMO_SUMMARIES];
    if (startDate) summaries = summaries.filter(s => s.date >= startDate);
    if (endDate) summaries = summaries.filter(s => s.date <= endDate);
    if (limit) summaries = summaries.slice(0, limit);
    return { summaries };
  }
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit.toString());
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchWithAuth(`/summaries${query}`);
  return response.json();
}

export async function getSummary(summaryId: string): Promise<Summary> {
  if (DEMO_MODE) {
    const summary = DEMO_SUMMARIES.find(s => s.summaryId === summaryId);
    if (!summary) throw new Error('Summary not found');
    return summary;
  }
  const response = await fetchWithAuth(`/summaries/${summaryId}`);
  return response.json();
}

// Feedback API
export async function submitFeedback(
  summaryId: string,
  rating: 'up' | 'down',
  comment?: string
): Promise<Feedback> {
  if (DEMO_MODE) {
    const feedback: Feedback = {
      feedbackId: `fb-${Date.now()}`,
      summaryId,
      userId: 'demo-user-123',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    demoFeedback[summaryId] = feedback;
    return feedback;
  }
  const response = await fetchWithAuth(`/summaries/${summaryId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
  return response.json();
}

export async function getFeedback(summaryId: string): Promise<{ feedback: Feedback | null }> {
  if (DEMO_MODE) {
    return { feedback: demoFeedback[summaryId] || null };
  }
  const response = await fetchWithAuth(`/summaries/${summaryId}/feedback`);
  return response.json();
}
