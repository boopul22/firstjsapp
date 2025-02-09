import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface Document {
  id: string;
  title: string;
  lastModified: Date;
}

interface DocumentListProps {
  documents: Document[];
  currentDocument?: string;
  onDocumentSelect: (id: string) => void;
  onNewDocument: () => void;
  onRenameDocument?: (id: string, newTitle: string) => void;
}

export function DocumentList({ documents, currentDocument, onDocumentSelect, onNewDocument, onRenameDocument }: DocumentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleDoubleClick = (doc: Document) => {
    if (onRenameDocument) {
      setEditingId(doc.id);
      setEditTitle(doc.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, doc: Document) => {
    if (e.key === 'Enter' && editingId && onRenameDocument) {
      e.preventDefault();
      onRenameDocument(doc.id, editTitle);
      setEditingId(null);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleBlur = (doc: Document) => {
    if (editingId && onRenameDocument) {
      onRenameDocument(doc.id, editTitle);
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4">
        <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center text-white font-bold">
          W
        </div>
        <span className="ml-2 text-lg font-semibold">Wordo</span>
      </div>

      <div className="px-4 py-2">
        <button
          onClick={onNewDocument}
          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <DocumentTextIcon className="w-4 h-4" />
          <span>+ New Document</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onDocumentSelect(doc.id)}
              onDoubleClick={() => handleDoubleClick(doc)}
              className={`w-full px-2 py-1.5 text-left rounded-lg transition-colors ${
                currentDocument === doc.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4" />
                {editingId === doc.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, doc)}
                    onBlur={() => handleBlur(doc)}
                    className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm truncate">{doc.title}</span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {doc.lastModified.toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 