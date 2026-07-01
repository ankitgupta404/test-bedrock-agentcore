import { useState } from 'react';
import { useFeedback } from '../hooks/useApi';

interface FeedbackWidgetProps {
  summaryId: string;
}

export function FeedbackWidget({ summaryId }: FeedbackWidgetProps) {
  const { feedback, loading, submitFeedback } = useFeedback(summaryId);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleSubmit = async (rating: 'up' | 'down') => {
    if (showComment && comment.trim()) {
      await submitFeedback(rating, comment.trim());
      setShowComment(false);
      setComment('');
    } else if (!showComment) {
      setShowComment(true);
    } else {
      await submitFeedback(rating);
      setShowComment(false);
    }
  };

  if (feedback) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-lg border border-green-200">
        <span className="text-green-600 font-medium">
          {feedback.rating === 'up' ? '👍' : '👎'} Feedback submitted
        </span>
        {feedback.comment && (
          <span className="text-sm text-green-700 italic">"{feedback.comment}"</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-600 mb-3">How was today's summary?</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleSubmit('up')}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
        >
          👍 Helpful
        </button>
        <button
          onClick={() => handleSubmit('down')}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
        >
          👎 Could improve
        </button>
      </div>
      {showComment && (
        <div className="mt-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any specific feedback? (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={2}
            maxLength={500}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => { setShowComment(false); setComment(''); }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => submitFeedback('up', comment.trim() || undefined)}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
