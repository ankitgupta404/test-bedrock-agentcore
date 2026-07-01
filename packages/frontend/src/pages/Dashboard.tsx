import { useSummaries } from '../hooks/useApi';
import { SummaryCard } from '../components/SummaryCard';
import { FeedbackWidget } from '../components/FeedbackWidget';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { data, loading, error } = useSummaries(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Failed to load summaries: {error}</p>
      </div>
    );
  }

  const latestSummary = data?.summaries?.[0];

  if (!latestSummary) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Summaries Yet</h2>
          <p className="text-gray-600 mb-6">
            Your daily research agent runs at midnight UTC. Configure your interests to start receiving
            personalized summaries.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            ⚙️ Configure Interests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Research Summary</h1>
          <p className="text-sm text-gray-500 mt-1">
            📅 {new Date(latestSummary.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          to="/history"
          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          View History →
        </Link>
      </div>

      {/* Summary sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {latestSummary.sections.map((section, index) => (
          <SummaryCard key={index} section={section} />
        ))}
      </div>

      {/* Feedback */}
      <div className="mt-8">
        <FeedbackWidget summaryId={latestSummary.summaryId} />
      </div>
    </div>
  );
}
