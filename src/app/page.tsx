'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ThemeToggle';
import { History } from '@/components/History';
import { StatsChart } from '@/components/StatsChart';
import { calculateStats, type UsageStats } from '@/utils/stats';
import { Tabs } from '@/components/Tabs';
import { supabase, type UsageRecord } from '@/utils/supabase';

interface HistoryItem {
  originalText: string;
  rewrittenText: string;
  timestamp: Date;
}

interface DailyData {
  history: HistoryItem[];
  stats: UsageStats;
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

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('rewriteData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Convert string dates back to Date objects for timestamps
        Object.keys(parsedData).forEach(date => {
          parsedData[date].history = parsedData[date].history.map((item: any) => ({
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

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to rewrite');
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
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite text');
      }

      const data = await response.json();
      setOutputText(data.rewrittenText);

      // Create history item with current timestamp
      const historyItem: HistoryItem = {
        originalText: inputText,
        rewrittenText: data.rewrittenText,
        timestamp: new Date(),
      };

      // Save to Supabase
      const usageRecord: UsageRecord = {
        original_text: inputText,
        rewritten_text: data.rewrittenText,
        word_count: currentStats.wordCount,
        token_count: currentStats.tokenCount,
        cost: currentStats.cost,
      };

      const { error: supabaseError } = await supabase
        .from('usage_records')
        .insert(usageRecord);

      if (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError);
      }

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
      setError('Failed to rewrite text. Please try again.');
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
              {
                label: 'Saved Data',
                content: <SavedData data={dailyData} />,
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
