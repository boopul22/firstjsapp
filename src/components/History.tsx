import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

interface HistoryItem {
  originalText: string;
  rewrittenText: string;
  timestamp: Date;
}

interface HistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export function History({ items, onSelect, onClear }: HistoryProps) {
  if (items.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <ClockIcon className="w-5 h-5 mx-auto mb-2" />
        <p>No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-primary" />
          History
        </h2>
        <button
          onClick={onClear}
          className="text-sm text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors duration-200"
        >
          <TrashIcon className="w-4 h-4" />
          Clear
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item)}
            className="w-full p-3 text-left rounded-md border bg-card hover:bg-accent/50 transition-colors duration-200 space-y-1 shadow-sm hover:shadow-md"
          >
            <p className="text-sm font-medium truncate">{item.originalText}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
} 