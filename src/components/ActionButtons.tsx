import { SparklesIcon } from '@heroicons/react/24/outline';
import { UsageStats, formatCost } from '@/utils/stats';

interface ActionButtonsProps {
  onHindi: () => void;
  onEnglish: () => void;
  isLoading?: boolean;
  stats?: UsageStats;
}

export function ActionButtons({ onHindi, onEnglish, isLoading, stats }: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">REWRITE</h3>
        <div className="space-y-2">
          <button 
            onClick={onHindi}
            disabled={isLoading}
            className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4" />
              <span>Hindi</span>
            </div>
            <span className="text-xs">⌘H</span>
          </button>
          <button 
            onClick={onEnglish}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4" />
              <span>English</span>
            </div>
            <span className="text-xs">⌘E</span>
          </button>
        </div>
      </div>
    </div>
  );
} 