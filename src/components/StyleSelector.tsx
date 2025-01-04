import { useState } from 'react';

type RewriteStyle = 'hindi' | 'english';

interface StyleSelectorProps {
  onStyleChange: (style: RewriteStyle) => void;
  currentStyle: RewriteStyle;
}

export function StyleSelector({ onStyleChange, currentStyle }: StyleSelectorProps) {
  const styles: { value: RewriteStyle; label: string; description: string }[] = [
    {
      value: 'hindi',
      label: 'Hindi',
      description: 'Natural Hindi language translation'
    },
    {
      value: 'english',
      label: 'English',
      description: 'Natural English language writing'
    }
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {styles.map((style) => (
        <button
          key={style.value}
          onClick={() => onStyleChange(style.value)}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            currentStyle === style.value
              ? 'bg-blue-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
          title={style.description}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
} 