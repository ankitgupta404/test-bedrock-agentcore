import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { User, Summary, ListSummariesResponse, Feedback } from '../types';

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await api.getProfile();
      setUser(profile);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (interests: string[], preferencePrompt?: string) => {
    const updated = await api.updateProfile(interests, preferencePrompt);
    setUser(updated);
    return updated;
  };

  return { user, loading, error, updateProfile, refetch: fetchProfile };
}

export function useSummaries(limit?: number) {
  const [data, setData] = useState<ListSummariesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.listSummaries(limit);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return { data, loading, error, refetch: fetchSummaries };
}

export function useFeedback(summaryId: string) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      const result = await api.getFeedback(summaryId);
      setFeedback(result.feedback);
    } catch {
      // Ignore errors for feedback fetching
    }
  }, [summaryId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const submitFeedback = async (rating: 'up' | 'down', comment?: string) => {
    setLoading(true);
    try {
      const result = await api.submitFeedback(summaryId, rating, comment);
      setFeedback(result);
    } finally {
      setLoading(false);
    }
  };

  return { feedback, loading, submitFeedback };
}
