import type { SummarySection } from '../types';

interface SummaryCardProps {
  section: SummarySection;
}

export function SummaryCard({ section }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
        <h3 className="text-lg font-semibold text-primary-800">{section.interest}</h3>
        <p className="text-sm text-primary-600">{section.highlights.length} highlights</p>
      </div>
      <div className="divide-y divide-gray-100">
        {section.highlights.map((highlight, index) => (
          <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900 mb-1">{highlight.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{highlight.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                {highlight.relevance}
              </span>
              {highlight.sourceUrl && (
                <a
                  href={highlight.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Source →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
