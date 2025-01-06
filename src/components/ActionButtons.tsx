import { SparklesIcon } from '@heroicons/react/24/outline';

interface ActionButtonsProps {
  onHindi: () => void;
  onEnglish: () => void;
  onToneChange: (tone: string) => void;
  isLoading?: boolean;
}

export function ActionButtons({ onHindi, onEnglish, onToneChange, isLoading }: ActionButtonsProps) {
  const toneButtons = [
    { label: 'Anticipatory', value: 'anticipatory', emoji: '🌟' },
    { label: 'Assertive', value: 'assertive', emoji: '💪' },
    { label: 'Compassionate', value: 'compassionate', emoji: '❤️' },
    { label: 'Confident', value: 'confident', emoji: '😊' },
    { label: 'Constructive', value: 'constructive', emoji: '🛠️' },
  ];

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

      <div>
        <h3 className="text-sm font-medium mb-2">ADJUST TONE</h3>
        <div className="grid grid-cols-2 gap-2">
          {toneButtons.map((button) => (
            <button
              key={button.value}
              onClick={() => onToneChange(button.value)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <span>{button.emoji}</span>
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 