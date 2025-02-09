interface TextStatsProps {
  text: string;
}

export function TextStats({ text }: TextStatsProps) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      <div>
        <span className="font-medium">{wordCount}</span> words
      </div>
      <div>
        <span className="font-medium">{charCount}</span> characters
      </div>
    </div>
  );
} 