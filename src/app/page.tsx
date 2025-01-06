'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { calculateStats, type UsageStats } from '@/utils/stats';
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

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<UsageStats>({ wordCount: 0, tokenCount: 0, cost: 0 });
  const [currentStyle, setCurrentStyle] = useState<'hindi' | 'english'>('hindi');
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

  // Update documents from localStorage
  useEffect(() => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      const parsedDocuments: Document[] = JSON.parse(savedDocuments);
      // Convert string dates back to Date objects
      parsedDocuments.forEach((doc) => {
        doc.lastModified = new Date(doc.lastModified);
      });
      setDocuments(parsedDocuments);
    }
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, style: 'hindi' }),
      });

      if (!response.ok) throw new Error('Failed to translate to Hindi');

      const data = await response.json();
      const translatedText = data.rewrittenText;
      setInputText(translatedText);
      setOutputText(translatedText);

      // Update document and stats
      setDocuments(
        documents.map((doc) =>
          doc.id === currentDocumentId
            ? { ...doc, content: translatedText, lastModified: new Date() }
            : doc
        )
      );

      updateStats(currentStats, inputText, translatedText);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, style: 'english' }),
      });

      if (!response.ok) throw new Error('Failed to translate to English');

      const data = await response.json();
      const translatedText = data.rewrittenText;
      setInputText(translatedText);
      setOutputText(translatedText);

      // Update document and stats
      setDocuments(
        documents.map((doc) =>
          doc.id === currentDocumentId
            ? { ...doc, content: translatedText, lastModified: new Date() }
            : doc
        )
      );

      updateStats(currentStats, inputText, translatedText);
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

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, action: 'tone', tone }),
      });

      if (!response.ok) throw new Error('Failed to adjust tone');

      const data = await response.json();
      setOutputText(data.rewrittenText);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to adjust tone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (currentStats: UsageStats, originalText: string, rewrittenText: string) => {
    const historyItem: HistoryItem = {
      originalText,
      rewrittenText,
      timestamp: new Date(),
    };

    setDailyData(prev => {
      const updatedData = { ...prev };
      if (!updatedData[currentDate]) {
        updatedData[currentDate] = {
          history: [],
          stats: currentStats
        };
      }

      updatedData[currentDate].stats = {
        wordCount: (updatedData[currentDate].stats.wordCount || 0) + currentStats.wordCount,
        tokenCount: (updatedData[currentDate].stats.tokenCount || 0) + currentStats.tokenCount,
        cost: (updatedData[currentDate].stats.cost || 0) + currentStats.cost,
      };

      updatedData[currentDate].history = [
        historyItem,
        ...(updatedData[currentDate].history || [])
      ];

      return updatedData;
    });
  };

  const handleSelectionChange = useCallback((
    selection: string,
    range?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
  ) => {
    setSelectedText(selection.trim() ? selection : '');
  }, []);

  const handleRewriteSelection = async () => {
    if (!selectedText.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: selectedText, 
          style: currentStyle,
          isSelectedText: true
        }),
      });

      if (!response.ok) throw new Error('Failed to rewrite text');

      const data = await response.json();
      const rewrittenText = data.rewrittenText;

      const currentStats = calculateStats(selectedText);
      updateStats(currentStats, selectedText, rewrittenText);

      if (editorRef.current) {
        editorRef.current.replaceSelectedText(rewrittenText);
      }

      setSelectedText('');
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
      <div className="w-52 border-r border-gray-200 bg-white p-4">
        <DocumentList
          documents={documents}
          currentDocument={currentDocumentId}
          onDocumentSelect={handleDocumentSelect}
          onNewDocument={handleNewDocument}
          onRenameDocument={handleRenameDocument}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with document title and stats */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">{currentDocument?.title}</h1>
              <FormattingToolbar onFormatClick={() => {}} />
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
      
      {/* Right Sidebar */}
      <div className="w-64 border-l border-gray-200 bg-white p-4">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Actions</span>
            <span className="text-xs text-gray-500">78</span>
          </div>
        </div>
        <div className="mt-4">
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
