'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { calculateStats, type UsageStats } from '@/utils/stats';
import { FormattingToolbar } from '@/components/FormattingToolbar';
import { ActionButtons } from '@/components/ActionButtons';
import { DocumentList } from '@/components/DocumentList';
import { Editor, type EditorRef } from '@/components/Editor';
import { TextStats } from '@/components/TextStats';
import { ReviewSuggestionsModal } from '@/components/ReviewSuggestionsModal';
import { analyzeContent, type AnalysisResult } from '@/utils/gemini';

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
  const editorRef = useRef<EditorRef>(null);
  const [suggestions, setSuggestions] = useState({
    correctness: 0,
    clarity: 0,
    engagement: 0,
    delivery: 0,
  });
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
      // Update suggestions based on word count
      const wordCount = inputText.trim().split(/\s+/).length;
      setSuggestions({
        correctness: Math.min(wordCount / 100, 1),
        clarity: Math.min(wordCount / 80, 1),
        engagement: Math.min(wordCount / 120, 1),
        delivery: Math.min(wordCount / 90, 1),
      });

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
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 border-r bg-white">
        <DocumentList
          documents={documents}
          currentDocument={currentDocumentId}
          onDocumentSelect={handleDocumentSelect}
          onNewDocument={handleNewDocument}
          onRenameDocument={handleRenameDocument}
        />
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <FormattingToolbar onFormatClick={() => {}} />
          </div>
          <div className="flex-1 p-4">
            <Editor
              ref={editorRef}
              value={inputText}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-4 border-t">
            <TextStats text={inputText} />
          </div>
        </div>
        <div className="w-64 border-l bg-white p-4 space-y-4">
          <ActionButtons
            onHindi={handleHindiRewrite}
            onEnglish={handleEnglishRewrite}
            isLoading={isLoading}
            stats={dailyData[currentDate]?.stats}
          />
          <div>
            <button
              onClick={handleAnalyzeContent}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Content'}</span>
              </div>
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              )}
            </button>
          </div>
          <ReviewSuggestionsModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            suggestions={analysisResult.suggestions}
            seo={analysisResult.seo}
            analysis={analysisResult.analysis}
          />
        </div>
      </div>
    </div>
  );
}
