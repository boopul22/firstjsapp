import { CheckIcon, XMarkIcon, ChartBarIcon, LightBulbIcon, MagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ReviewSuggestionsProps {
  suggestions: {
    correctness: number;
    clarity: number;
    engagement: number;
    delivery: number;
  };
  seo?: {
    score: number;
    suggestions: string[];
  };
  analysis?: string;
}

export function ReviewSuggestions({ suggestions, seo, analysis }: ReviewSuggestionsProps) {
  const metrics = [
    { 
      label: 'Correctness', 
      value: suggestions.correctness, 
      color: 'from-red-500 to-red-300', 
      icon: ChartBarIcon,
      solution: 'Check grammar and spelling, ensure factual accuracy'
    },
    { 
      label: 'Clarity', 
      value: suggestions.clarity, 
      color: 'from-blue-500 to-blue-300', 
      icon: LightBulbIcon,
      solution: 'Use simpler words, shorter sentences, clear structure'
    },
    { 
      label: 'Engagement', 
      value: suggestions.engagement, 
      color: 'from-green-500 to-green-300', 
      icon: ChartBarIcon,
      solution: 'Add examples, stories, or interactive elements'
    },
    { 
      label: 'Delivery', 
      value: suggestions.delivery, 
      color: 'from-indigo-500 to-indigo-300', 
      icon: MagnifyingGlassIcon,
      solution: 'Improve formatting, use bullet points, highlight key points'
    },
  ];

  return (
    <div className="bg-white rounded-md shadow p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">SEO Score</h3>
        <div className="text-xs text-gray-500">
          Overall Score: {Math.round(Object.values(suggestions).reduce((a, b) => a + b, 0) / 4 * 100)}%
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const needsImprovement = metric.value < 0.7;
          return (
            <div
              key={metric.label}
              className="relative overflow-hidden rounded-md bg-gradient-to-br p-1.5 transition-all duration-300 hover:shadow-sm group"
              style={{
                background: `linear-gradient(to bottom right, ${metric.value >= 0.7 ? '#f0fdf4' : '#fef2f2'}, white)`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <Icon className="w-3 h-3 text-gray-600" />
                  <span className="text-[10px] font-medium text-gray-800">{metric.label}</span>
                </div>
                {metric.value >= 0.7 ? (
                  <CheckIcon className="w-3 h-3 text-green-600" />
                ) : (
                  <ExclamationCircleIcon className="w-3 h-3 text-red-600" />
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div
                  className={`h-1 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                  style={{ width: `${metric.value * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <div className="text-[10px] font-medium text-gray-600">
                  {Math.round(metric.value * 100)}%
                </div>
                {needsImprovement && (
                  <div className="text-[8px] text-red-600 font-medium">
                    Needs improvement
                  </div>
                )}
              </div>
              {needsImprovement && (
                <div className="mt-1 text-[8px] text-gray-600 border-t border-gray-100 pt-1">
                  {metric.solution}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {seo && (
        <div className="mt-2">
          <h3 className="text-xs font-semibold text-gray-800 mb-1">SEO Analysis</h3>
          <div className="bg-gradient-to-br from-yellow-50 to-white rounded-md p-1.5 border border-yellow-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-800">Overall SEO Score</span>
              <span className="text-sm font-bold text-yellow-600">{Math.round(seo.score * 100)}%</span>
            </div>
            <div className="w-1/2 mx-auto bg-white rounded-full h-1 mb-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-1 rounded-full transition-all duration-500"
                style={{ width: `${seo.score * 100}%` }}
              />
            </div>
            {seo.suggestions.length > 0 && (
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-gray-700">Improvement Actions:</p>
                <ul className="space-y-1">
                  {seo.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-[10px] text-gray-600 bg-white rounded p-1 border border-gray-100">
                      <div className="flex items-start space-x-1">
                        <span className="mt-0.5 text-yellow-500">•</span>
                        <div>
                          <p className="font-medium">Issue: {suggestion}</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">
                            Solution: {getSEOSolution(suggestion)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {analysis && (
        <div className="mt-2">
          <h3 className="text-xs font-semibold text-gray-800 mb-1">Detailed Analysis</h3>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-md p-1.5 border border-blue-100">
            <p className="text-[10px] text-gray-700 leading-relaxed">{analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getSEOSolution(suggestion: string): string {
  // Map common SEO issues to specific solutions
  if (suggestion.toLowerCase().includes('keyword')) {
    return 'Add relevant keywords naturally in title, headings, and first paragraph';
  }
  if (suggestion.toLowerCase().includes('meta')) {
    return 'Write compelling meta description with keywords (150-160 characters)';
  }
  if (suggestion.toLowerCase().includes('heading')) {
    return 'Structure content with H1, H2, H3 tags in hierarchical order';
  }
  if (suggestion.toLowerCase().includes('length')) {
    return 'Aim for content length of 1000+ words for comprehensive coverage';
  }
  if (suggestion.toLowerCase().includes('link')) {
    return 'Add internal links to related content and authoritative external sources';
  }
  return 'Review and implement SEO best practices for this specific issue';
} 