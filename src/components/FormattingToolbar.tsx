interface FormattingToolbarProps {
  onFormatClick: (format: string) => void;
}

export function FormattingToolbar({ onFormatClick }: FormattingToolbarProps) {
  const formatButtons = [
    { label: 'H₁', format: 'h1' },
    { label: 'H₂', format: 'h2' },
    { label: 'H₃', format: 'h3' },
    { label: 'B', format: 'bold', className: 'font-bold' },
    { label: 'I', format: 'italic', className: 'italic' },
    { label: 'U', format: 'underline', className: 'underline' },
  ];

  return (
    <div className="flex space-x-2">
      {formatButtons.map((button) => (
        <button
          key={button.format}
          onClick={() => onFormatClick(button.format)}
          className={`px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded ${button.className || ''}`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
} 