import { getIdToken } from './auth';
import type { User, Summary, ListSummariesResponse, Feedback } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

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
  const response = await fetchWithAuth('/users/me');
  return response.json();
}

export async function updateProfile(interests: string[], preferencePrompt?: string): Promise<User> {
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
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit.toString());
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchWithAuth(`/summaries${query}`);
  return response.json();
}

export async function getSummary(summaryId: string): Promise<Summary> {
  const response = await fetchWithAuth(`/summaries/${summaryId}`);
  return response.json();
}

// Feedback API
export async function submitFeedback(
  summaryId: string,
  rating: 'up' | 'down',
  comment?: string
): Promise<Feedback> {
  const response = await fetchWithAuth(`/summaries/${summaryId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
  return response.json();
}

export async function getFeedback(summaryId: string): Promise<{ feedback: Feedback | null }> {
  const response = await fetchWithAuth(`/summaries/${summaryId}/feedback`);
  return response.json();
}
