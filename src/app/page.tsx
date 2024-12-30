'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ThemeToggle';
import { History } from '@/components/History';
import { StatsChart } from '@/components/StatsChart';
import { calculateStats, type UsageStats } from '@/utils/stats';
import { Tabs } from '@/components/Tabs';

interface HistoryItem {
  originalText: string;
  rewrittenText: string;
  timestamp: Date;
}

interface DailyData {
  history: HistoryItem[];
  stats: UsageStats;
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<UsageStats>({ wordCount: 0, tokenCount: 0, cost: 0 });

  useEffect(() => {
    const storedData = localStorage.getItem('rewriteData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setDailyData(parsedData);
    }
  }, []);

  useEffect(() => {
    if (dailyData[currentDate]) {
      setStats(dailyData[currentDate].stats);
    } else {
      setStats({ wordCount: 0, tokenCount: 0, cost: 0 });
    }
  }, [dailyData, currentDate]);

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to rewrite');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const currentStats = calculateStats(inputText);
      setStats(currentStats);

      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite text');
      }

      const data = await response.json();
      setOutputText(data.rewrittenText);

      // Add to history
      const historyItem: HistoryItem = {
        originalText: inputText,
        rewrittenText: data.rewrittenText,
        timestamp: new Date(),
      };

      setDailyData(prev => {
        const updatedData = { ...prev };
        if (!updatedData[currentDate]) {
          updatedData[currentDate] = { history: [], stats: currentStats };
        } else {
          // Accumulate stats
          updatedData[currentDate].stats = {
            wordCount: updatedData[currentDate].stats.wordCount + currentStats.wordCount,
            tokenCount: updatedData[currentDate].stats.tokenCount + currentStats.tokenCount,
            cost: updatedData[currentDate].stats.cost + currentStats.cost,
          };
        }
        updatedData[currentDate].history = [historyItem, ...updatedData[currentDate].history];
        localStorage.setItem('rewriteData', JSON.stringify(updatedData));
        setStats(updatedData[currentDate].stats);
        return updatedData;
      });
    } catch (err) {
      setError('Failed to rewrite text. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setInputText(item.originalText);
    setOutputText(item.rewrittenText);
  };

  const handleClearHistory = () => {
    setDailyData({});
    localStorage.removeItem('rewriteData');
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
        <div className="fixed bottom-8 right-8">
          <ThemeToggle />
        </div>

        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Text Rewriter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your text with AI-powered rewriting. Perfect for content creators and writers.
          </p>
        </header>

        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="p-2 border rounded-lg bg-transparent text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <Tabs
            tabs={[
              {
                label: 'Rewrite',
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label htmlFor="inputText" className="mb-4 text-lg font-medium">
                        Enter text to rewrite:
                      </label>
                      <textarea
                        id="inputText"
                        className="w-full p-3 text-gray-900 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 shadow-md resize-y min-h-[150px] text-lg placeholder:text-gray-500 transition-border duration-200 border border-gray-300 focus:border-blue-500"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter your sentence or paragraph here."
                      />
                      {error && (
                        <div className="mt-2 text-red-500">
                          {error}
                        </div>
                      )}
                      <button
                        onClick={handleRewrite}
                        disabled={isLoading}
                        className="mt-4 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {isLoading ? (
                          <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <SparklesIcon className="w-5 h-5 mr-2" />
                        )}
                        Rewrite
                      </button>
                      {outputText && (
                        <div className="mt-2 text-green-500">
                          Text successfully rewritten!
                        </div>
                      )}
                    </div>

                    {outputText && (
                      <div className="flex flex-col animate-in">
                        <h2 className="text-xl font-bold mb-2">Rewritten Text:</h2>
                        <div className="p-4 bg-secondary rounded-lg shadow-md transition-shadow duration-200 border text-lg">
                          {outputText}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'History',
                content: (
                  <div className="mt-4  max-h-[400px] overflow-y-auto">
                    <History
                      items={dailyData[currentDate]?.history || []}
                      onSelect={handleHistorySelect}
                      onClear={handleClearHistory}
                    />
                  </div>
                ),
              },
              {
                label: 'Stats',
                content: <StatsChart stats={stats} />,
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
