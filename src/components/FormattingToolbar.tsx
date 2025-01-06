interface FormattingToolbarProps {
  onFormatClick?: (format: string) => void;
}

export function FormattingToolbar({ onFormatClick }: FormattingToolbarProps) {
  const formatButtons = [
    { label: 'H₁', format: 'h1' },
    { label: 'H₂', format: 'h2' },
    { label: 'H₃', format: 'h3' },
    { type: 'divider' },
    { label: 'B', format: 'bold', className: 'font-bold' },
    { label: 'I', format: 'italic', className: 'italic' },
    { label: 'U', format: 'underline', className: 'underline' },
    { type: 'divider' },
    { label: '•', format: 'bullet' },
    { label: '1.', format: 'number' },
    { type: 'divider' },
    { label: '@', format: 'mention' },
  ];

  return (
    <div className="flex items-center space-x-1">
      {formatButtons.map((button, index) => 
        button.type === 'divider' ? (
          <div key={index} className="w-px h-4 bg-gray-200 mx-1" />
        ) : (
          <button
            key={button.format}
            onClick={() => onFormatClick?.(button.format)}
            className={`px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded ${button.className || ''}`}
          >
            {button.label}
          </button>
        )
      )}
    </div>
  );
} 