'use client';

import { useState, useEffect, useRef } from 'react';
import { ChartBarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { calculateStats, type UsageStats } from '@/utils/stats';
import { DocumentList } from '@/components/DocumentList';
import { Editor, type EditorRef } from '@/components/Editor';
import { ReviewSuggestionsModal } from '@/components/ReviewSuggestionsModal';
import { analyzeContent, type AnalysisResult } from '@/utils/gemini';
import { ActionButtons } from '@/components/ActionButtons';
import { FormattingToolbar } from '@/components/FormattingToolbar';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStats, setShowStats] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Untitled_1',
      content: '',
      lastModified: new Date(),
    },
  ]);
  const [currentDocumentId, setCurrentDocumentId] = useState('1');
  const editorRef = useRef<EditorRef>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    suggestions: {
      correctness: 0,
      clarity: 0,
      engagement: 0,
      delivery: 0,
    },
    seo: {
      score: 0,
      suggestions: [],
    },
    analysis: '',
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

  // Save documents to localStorage whenever they change
  useEffect(() => {
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
  };

  const handleDocumentSelect = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setCurrentDocumentId(id);
      setInputText(doc.content);
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

  const handleAnalyzeContent = async () => {
    if (!inputText.trim()) {
      setAnalysisResult({
        suggestions: {
          correctness: 0,
          clarity: 0,
          engagement: 0,
          delivery: 0,
        },
        seo: {
          score: 0,
          suggestions: [],
        },
        analysis: '',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Get AI analysis
      const result = await analyzeContent(inputText);
      setAnalysisResult(result);
      setIsReviewModalOpen(true);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHindiRewrite = async () => {
    if (!inputText.trim()) {
      return;
    }

    setIsLoading(true);

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

      // Update document and stats
      setDocuments(
        documents.map((doc) =>
          doc.id === currentDocumentId
            ? { ...doc, content: translatedText, lastModified: new Date() }
            : doc
        )
      );

      updateStats(currentStats, inputText, translatedText);
    } catch (err) {
      console.error('Error:', err);
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

  return (
    <main className="h-screen p-1 max-w-[1920px] mx-auto flex flex-col">
      <div className="flex flex-row gap-1 flex-1 h-full overflow-hidden">
        <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border p-1">
          <DocumentList
            documents={documents}
            currentDocument={currentDocumentId}
            onDocumentSelect={handleDocumentSelect}
            onNewDocument={handleNewDocument}
            onRenameDocument={handleRenameDocument}
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex flex-row gap-1 items-center justify-between bg-white rounded-lg shadow-sm border p-1">
            <FormattingToolbar />
            <div className="flex gap-1">
              <button
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing}
                className={`flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-md ${
                  isAnalyzing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                } border border-gray-300 transition-colors`}
              >
                <MagnifyingGlassIcon className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'Review'}</span>
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-colors"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="h-full">
              <Editor
                ref={editorRef}
                value={inputText}
                onChange={handleInputChange}
                onSave={handleEnglishRewrite}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-1">
            <ActionButtons
              onHindi={handleHindiRewrite}
              onEnglish={handleEnglishRewrite}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <ReviewSuggestionsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        suggestions={analysisResult.suggestions}
        seo={analysisResult.seo}
        analysis={analysisResult.analysis}
      />
    </main>
  );
}
