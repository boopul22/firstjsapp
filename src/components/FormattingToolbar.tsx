import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Link2Icon,
  ImageIcon,
  QuoteIcon,
  ListIcon,
  ListOrderedIcon,
  Code2Icon,
  Heading1,
  Heading2,
  Heading3,
  XIcon,
} from 'lucide-react';

interface FormattingToolbarProps {
  onFormatClick?: (format: string) => void;
}

interface FormatButton {
  label: string | React.ReactNode;
  format?: string;
  className?: string;
  type?: 'divider';
  tooltip?: string;
}

export function FormattingToolbar({ onFormatClick }: FormattingToolbarProps) {
  const formatButtons: FormatButton[] = [
    { label: <Heading1 size={18} />, format: 'h1', tooltip: 'Heading 1' },
    { label: <Heading2 size={18} />, format: 'h2', tooltip: 'Heading 2' },
    { label: <Heading3 size={18} />, format: 'h3', tooltip: 'Heading 3' },
    { type: 'divider', label: '' },
    { label: <BoldIcon size={18} />, format: 'bold', tooltip: 'Bold (⌘B)' },
    { label: <ItalicIcon size={18} />, format: 'italic', tooltip: 'Italic (⌘I)' },
    { label: <UnderlineIcon size={18} />, format: 'underline', tooltip: 'Underline (⌘U)' },
    { type: 'divider', label: '' },
    { label: <AlignLeftIcon size={18} />, format: 'align-left', tooltip: 'Align Left' },
    { label: <AlignCenterIcon size={18} />, format: 'align-center', tooltip: 'Align Center' },
    { label: <AlignRightIcon size={18} />, format: 'align-right', tooltip: 'Align Right' },
    { label: <AlignJustifyIcon size={18} />, format: 'align-justify', tooltip: 'Justify' },
    { type: 'divider', label: '' },
    { label: <ListIcon size={18} />, format: 'bullet', tooltip: 'Bullet List' },
    { label: <ListOrderedIcon size={18} />, format: 'number', tooltip: 'Numbered List' },
    { type: 'divider', label: '' },
    { label: <Link2Icon size={18} />, format: 'link', tooltip: 'Insert Link (⌘K)' },
    { label: <ImageIcon size={18} />, format: 'image', tooltip: 'Insert Image' },
    { type: 'divider', label: '' },
    { label: <Code2Icon size={18} />, format: 'code', tooltip: 'Code Block' },
    { label: <QuoteIcon size={18} />, format: 'quote', tooltip: 'Blockquote' },
    { type: 'divider', label: '' },
    { label: <XIcon size={18} />, format: 'clear-format', tooltip: 'Clear Formatting' },
  ];

  const handleButtonClick = (format: string | undefined) => {
    if (!format) return;

    if (format === 'link') {
      const url = prompt('Enter URL:');
      if (url) onFormatClick?.('link:' + url);
      return;
    }

    if (format === 'image') {
      const url = prompt('Enter image URL:');
      if (url) onFormatClick?.('image:' + url);
      return;
    }

    onFormatClick?.(format);
  };

  return (
    <div className="flex items-center space-x-1 flex-wrap">
      {formatButtons.map((button, index) => 
        button.type === 'divider' ? (
          <div key={index} className="w-px h-6 bg-gray-200 mx-1" />
        ) : (
          <button
            key={button.format}
            onClick={() => handleButtonClick(button.format)}
            className={`p-1.5 text-gray-600 hover:bg-gray-100 rounded group relative ${button.className || ''}`}
            title={button.tooltip}
          >
            {button.label}
            {button.tooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {button.tooltip}
              </div>
            )}
          </button>
        )
      )}
    </div>
  );
} 