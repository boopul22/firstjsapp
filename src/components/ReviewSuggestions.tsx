import { ChartBarIcon, LightBulbIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-800">Content Analysis</h3>
        <div className="text-base text-gray-700 font-medium">
          Overall Score: {Math.round(Object.values(suggestions).reduce((a, b) => a + b, 0) / 4 * 100)}%
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const needsImprovement = metric.value < 0.7;
          const score = Math.round(metric.value * 100);
          return (
            <div
              key={metric.label}
              className="relative overflow-hidden rounded-lg bg-gradient-to-br p-3 transition-all duration-300 hover:shadow-md"
              style={{
                background: `linear-gradient(to bottom right, ${metric.value >= 0.7 ? '#f0fdf4' : '#fef2f2'}, white)`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Icon className="w-4 h-4 text-gray-700" />
                  <span className="text-base font-medium text-gray-800">{metric.label}</span>
                </div>
                <div className="text-base font-semibold text-gray-700">
                  {score}%
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                  style={{ width: `${score}%` }}
                />
              </div>
              {needsImprovement && (
                <div className="text-xs text-gray-600 mt-1.5">
                  {metric.solution}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {analysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Detailed Analysis</h4>
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis}</p>
        </div>
      )}

      {seo && seo.suggestions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">SEO Suggestions</h4>
          <ul className="space-y-2">
            {seo.suggestions.map((suggestion, index) => (
              <li key={index} className="text-base text-gray-700 leading-relaxed flex items-start">
                <span className="mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 