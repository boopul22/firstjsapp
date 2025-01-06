'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ThemeToggle';
import { History } from '@/components/History';
import { StatsChart } from '@/components/StatsChart';
import { calculateStats, type UsageStats } from '@/utils/stats';
import { Tabs } from '@/components/Tabs';
import { StyleSelector } from '@/components/StyleSelector';
import { FormattingToolbar } from '@/components/FormattingToolbar';
import { ActionButtons } from '@/components/ActionButtons';
import { DocumentList } from '@/components/DocumentList';
import { Editor, type EditorRef } from '@/components/Editor';
import { TextStats } from '@/components/TextStats';

interface HistoryItem {
  originalText: string;
  rewrittenText: string;
  timestamp: Date;
}

interface DailyData {
  history: HistoryItem[];
  stats: UsageStats;
}

interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
}

const SavedData = ({ data }: { data: Record<string, DailyData> }) => {
  return (
    <div className="p-4">
      {Object.entries(data).length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">No saved data available.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(data)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, dayData]) => (
              <div key={date} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">{new Date(date).toLocaleDateString()}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p>Word Count: {dayData.stats.wordCount}</p>
                    <p>Token Count: {dayData.stats.tokenCount}</p>
                    <p>Cost: ${dayData.stats.cost.toFixed(4)}</p>
                  </div>
                  <div>
                    <p>Entries: {dayData.history.length}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {dayData.history.map((item, index) => (
                    <div key={index} className="border-t dark:border-gray-700 pt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm mt-1">Original: {item.originalText.substring(0, 100)}...</p>
                      <p className="text-sm mt-1">Rewritten: {item.rewrittenText.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<UsageStats>({ wordCount: 0, tokenCount: 0, cost: 0 });
  const [currentStyle, setCurrentStyle] = useState<'hindi' | 'english'>('hindi');
  const [formattedText, setFormattedText] = useState('');
  const [currentTone, setCurrentTone] = useState('');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Untitled_1',
      content: '',
      lastModified: new Date(),
    },
  ]);
  const [currentDocumentId, setCurrentDocumentId] = useState('1');
  const [selectedText, setSelectedText] = useState('');
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  } | null>(null);
  const editorRef = useRef<EditorRef>(null);

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('rewriteData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Convert string dates back to Date objects for timestamps
        Object.keys(parsedData).forEach(date => {
          parsedData[date].history = parsedData[date].history.map((item: { timestamp: string } & Omit<HistoryItem, 'timestamp'>) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
        });
        setDailyData(parsedData);
        console.log('Loaded data:', parsedData);
      }
    } catch (err) {
      console.error('Error loading saved data:', err);
      // Initialize with empty data if there's an error
      setDailyData({});
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      if (Object.keys(dailyData).length > 0) {
        localStorage.setItem('rewriteData', JSON.stringify(dailyData));
        console.log('Saved data:', dailyData);
      }
    } catch (err) {
      console.error('Error saving data:', err);
    }
  }, [dailyData]);

  // Update stats when date or data changes
  useEffect(() => {
    if (dailyData[currentDate]) {
      setStats(dailyData[currentDate].stats);
    } else {
      setStats({ wordCount: 0, tokenCount: 0, cost: 0 });
    }
  }, [dailyData, currentDate]);

  useEffect(() => {
    // Load documents from localStorage
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      const parsedDocuments = JSON.parse(savedDocuments);
      // Convert string dates back to Date objects
      parsedDocuments.forEach((doc: any) => {
        doc.lastModified = new Date(doc.lastModified);
      });
      setDocuments(parsedDocuments);
    }
  }, []);

  useEffect(() => {
    // Save documents to localStorage whenever they change
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  const handleNewDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: `Untitled_${documents.length + 1}`,
      content: '',
      lastModified: new Date(),
    };
    setDocuments([...documents, newDoc]);
    setCurrentDocumentId(newDoc.id);
    setInputText('');
    setOutputText('');
  };

  const handleDocumentSelect = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setCurrentDocumentId(id);
      setInputText(doc.content);
      setOutputText('');
    }
  };

  const handleRenameDocument = (id: string, newTitle: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id
          ? { ...doc, title: newTitle, lastModified: new Date() }
          : doc
      )
    );
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    // Update document content
    setDocuments(
      documents.map((doc) =>
        doc.id === currentDocumentId
          ? { ...doc, content: text, lastModified: new Date() }
          : doc
      )
    );
  };

  const currentDocument = documents.find((d) => d.id === currentDocumentId);

  const handleHindiRewrite = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate to Hindi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const currentStats = calculateStats(inputText);

      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText, style: 'hindi' }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate to Hindi');
      }

      const data = await response.json();
      const translatedText = data.rewrittenText;
      setInputText(translatedText); // Update the input text with the translation
      setOutputText(translatedText);

      // Create history item with current timestamp
      const historyItem: HistoryItem = {
        originalText: inputText,
        rewrittenText: translatedText,
        timestamp: new Date(),
      };

      // Update document content with translated text
      setDocuments(
        documents.map((doc) =>
          doc.id === currentDocumentId
            ? { ...doc, content: translatedText, lastModified: new Date() }
            : doc
        )
      );

      // Update daily data with new entry
      setDailyData(prev => {
        const updatedData = { ...prev };
        if (!updatedData[currentDate]) {
          updatedData[currentDate] = {
            history: [],
            stats: currentStats
          };
        }

        // Update stats
        updatedData[currentDate].stats = {
          wordCount: (updatedData[currentDate].stats.wordCount || 0) + currentStats.wordCount,
          tokenCount: (updatedData[currentDate].stats.tokenCount || 0) + currentStats.tokenCount,
          cost: (updatedData[currentDate].stats.cost || 0) + currentStats.cost,
        };

        // Add new history item
        updatedData[currentDate].history = [
          historyItem,
          ...(updatedData[currentDate].history || [])
        ];

        return updatedData;
      });

    } catch (error) {
      console.error('Error:', error);
      setError('Failed to translate to Hindi. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnglishRewrite = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate to English');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const currentStats = calculateStats(inputText);

      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText, style: 'english' }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate to English');
      }

      const data = await response.json();
      const translatedText = data.rewrittenText;
      setInputText(translatedText); // Update the input text with the translation
      setOutputText(translatedText);

      // Create history item with current timestamp
      const historyItem: HistoryItem = {
        originalText: inputText,
        rewrittenText: translatedText,
        timestamp: new Date(),
      };

      // Update document content with translated text
      setDocuments(
        documents.map((doc) =>
          doc.id === currentDocumentId
            ? { ...doc, content: translatedText, lastModified: new Date() }
            : doc
        )
      );

      // Update daily data with new entry
      setDailyData(prev => {
        const updatedData = { ...prev };
        if (!updatedData[currentDate]) {
          updatedData[currentDate] = {
            history: [],
            stats: currentStats
          };
        }

        // Update stats
        updatedData[currentDate].stats = {
          wordCount: (updatedData[currentDate].stats.wordCount || 0) + currentStats.wordCount,
          tokenCount: (updatedData[currentDate].stats.tokenCount || 0) + currentStats.tokenCount,
          cost: (updatedData[currentDate].stats.cost || 0) + currentStats.cost,
        };

        // Add new history item
        updatedData[currentDate].history = [
          historyItem,
          ...(updatedData[currentDate].history || [])
        ];

        return updatedData;
      });

    } catch (error) {
      console.error('Error:', error);
      setError('Failed to translate to English. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneChange = async (tone: string) => {
    if (!inputText.trim()) {
      setError('Please enter some text to adjust tone');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentTone(tone);

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText, action: 'tone', tone }),
      });

      if (!response.ok) {
        throw new Error('Failed to adjust tone');
      }

      const data = await response.json();
      setOutputText(data.rewrittenText);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to adjust tone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setInputText(item.originalText);
    setOutputText(item.rewrittenText);
  };

  const handleClearHistory = () => {
    const shouldClear = window.confirm('Are you sure you want to clear all history? This cannot be undone.');
    if (shouldClear) {
      setDailyData({});
      localStorage.removeItem('rewriteData');
      setStats({ wordCount: 0, tokenCount: 0, cost: 0 });
    }
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  const handleFormatClick = (format: string) => {
    // This is a simple implementation. In a real app, you'd want to use a proper rich text editor
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;

    const selectedText = selection.toString();
    let formattedContent = '';

    switch (format) {
      case 'h1':
        formattedContent = `# ${selectedText}`;
        break;
      case 'h2':
        formattedContent = `## ${selectedText}`;
        break;
      case 'h3':
        formattedContent = `### ${selectedText}`;
        break;
      case 'bold':
        formattedContent = `**${selectedText}**`;
        break;
      case 'italic':
        formattedContent = `*${selectedText}*`;
        break;
      case 'underline':
        formattedContent = `_${selectedText}_`;
        break;
      default:
        formattedContent = selectedText;
    }

    const textArea = document.querySelector('textarea');
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = textArea.value;
      setInputText(text.substring(0, start) + formattedContent + text.substring(end));
    }
  };

  // Handle text selection from the editor
  const handleSelectionChange = useCallback((
    selection: string,
    range?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
  ) => {
    if (selection.trim()) {
      setSelectedText(selection);
      setSelectedRange(range || null);
    } else {
      setSelectedText('');
      setSelectedRange(null);
    }
  }, []);

  /**
   * Handles rewriting of selected text
   * This function is specifically designed for rewriting portions of text while maintaining context
   */
  const handleRewriteSelection = async () => {
    // Validate selected text
    if (!selectedText.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Make API request with isSelectedText flag for specialized handling
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: selectedText, 
          style: currentStyle,
          isSelectedText: true // Flag to use specialized prompt for selected text
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite text');
      }

      const data = await response.json();
      const rewrittenText = data.rewrittenText;

      // Create history item for the selection
      const historyItem: HistoryItem = {
        originalText: selectedText,
        rewrittenText: rewrittenText,
        timestamp: new Date(),
      };

      // Update statistics for the selected portion only
      const currentStats = calculateStats(selectedText);
      setDailyData(prev => {
        const updatedData = { ...prev };
        if (!updatedData[currentDate]) {
          updatedData[currentDate] = {
            history: [],
            stats: currentStats
          };
        }

        // Accumulate stats for the day
        updatedData[currentDate].stats = {
          wordCount: (updatedData[currentDate].stats.wordCount || 0) + currentStats.wordCount,
          tokenCount: (updatedData[currentDate].stats.tokenCount || 0) + currentStats.tokenCount,
          cost: (updatedData[currentDate].stats.cost || 0) + currentStats.cost,
        };

        // Add new history item at the beginning of the array
        updatedData[currentDate].history = [
          historyItem,
          ...(updatedData[currentDate].history || [])
        ];

        return updatedData;
      });

      // Replace the selected text using Monaco editor's API
      if (editorRef.current) {
        editorRef.current.replaceSelectedText(rewrittenText);
      }

      // Clear the selection after successful rewrite
      setSelectedText('');
      setSelectedRange(null);

    } catch (error) {
      console.error('Error:', error);
      setError('Failed to rewrite selected text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Document List */}
      <div className="w-52 border-r border-gray-200 bg-white">
        <DocumentList
          documents={documents}
          currentDocument={currentDocumentId}
          onDocumentSelect={handleDocumentSelect}
          onNewDocument={handleNewDocument}
          onRenameDocument={handleRenameDocument}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with document title and stats */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">{currentDocument?.title}</h1>
              <FormattingToolbar onFormatClick={handleFormatClick} />
            </div>
            <TextStats text={inputText} />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-4 relative">
          <Editor
            value={inputText}
            onChange={handleInputChange}
            onSelectionChange={handleSelectionChange}
            ref={editorRef}
            onSave={() => {
              const doc = documents.find((d) => d.id === currentDocumentId);
              if (doc) {
                handleRenameDocument(doc.id, doc.title);
              }
            }}
          />

          {/* Fixed Position Rewrite Options - Appears when text is selected */}
          {selectedText && !isLoading && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-up">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 px-2 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCurrentStyle('hindi');
                    handleRewriteSelection();
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-1.5 text-sm font-medium"
                  disabled={isLoading}
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Rewrite in Hindi</span>
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <button
                  onClick={() => {
                    setCurrentStyle('english');
                    handleRewriteSelection();
                  }}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-1.5 text-sm font-medium"
                  disabled={isLoading}
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Rewrite in English</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 px-4 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <div className="text-sm text-gray-600">Rewriting...</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="fixed bottom-20 right-6 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg z-50 flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Actions */}
      <div className="w-64 border-l border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Actions</span>
            <span className="text-xs text-gray-500">78</span>
          </div>
        </div>
        <div className="p-4">
          <ActionButtons
            onHindi={handleHindiRewrite}
            onEnglish={handleEnglishRewrite}
            onToneChange={handleToneChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
