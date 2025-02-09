import { SparklesIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline';

interface ActionButtonsProps {
  onHindi: () => void;
  onEnglish: () => void;
  isLoading?: boolean;
}

export function ActionButtons({ onHindi, onEnglish, isLoading }: ActionButtonsProps) {
  const actions = [
    {
      icon: SparklesIcon,
      label: 'Hindi',
      shortcut: '⌘H',
      onClick: onHindi,
      variant: 'primary'
    },
    {
      icon: BoltIcon,
      label: 'English',
      shortcut: '⌘E',
      onClick: onEnglish,
    },
    {
      icon: StarIcon,
      label: 'Simplify',
      shortcut: '⌘P',
      onClick: onEnglish,
    },
  ];

  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          disabled={isLoading}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            action.variant === 'primary'
              ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center space-x-2">
            <action.icon className="w-4 h-4" />
            <span className="text-sm">{action.label}</span>
          </div>
          <span className="text-xs">{action.shortcut}</span>
        </button>
      ))}
    </div>
  );
} 