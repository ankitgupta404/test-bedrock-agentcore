import { useState } from 'react';
import { useSummaries } from '../hooks/useApi';
import { SummaryCard } from '../components/SummaryCard';
import { FeedbackWidget } from '../components/FeedbackWidget';
import type { Summary } from '../types';

export function History() {
  const { data, loading, error } = useSummaries(30);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Failed to load history: {error}</p>
      </div>
    );
  }

  const summaries = data?.summaries || [];

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📜</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No History Yet</h2>
        <p className="text-gray-600">
          Your research summaries will appear here after the first daily run.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Summary History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Showing {summaries.length} summaries from the past 30 days
        </p>
      </div>

      <div className="space-y-4">
        {summaries.map((summary: Summary) => (
          <div key={summary.summaryId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header - clickable */}
            <button
              onClick={() => setExpandedId(expandedId === summary.summaryId ? null : summary.summaryId)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  {new Date(summary.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {summary.sections.length} topics • {summary.sections.reduce((acc, s) => acc + s.highlights.length, 0)} highlights
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedId === summary.summaryId ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded content */}
            {expandedId === summary.summaryId && (
              <div className="border-t border-gray-200 px-6 py-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {summary.sections.map((section, index) => (
                    <SummaryCard key={index} section={section} />
                  ))}
                </div>
                <FeedbackWidget summaryId={summary.summaryId} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
