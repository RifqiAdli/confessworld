import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';
import { supabase, Confession } from '../lib/supabase';
import { ConfessionForm } from '../components/ConfessionForm';
import { ConfessionCard } from '../components/ConfessionCard';
import { SearchBar } from '../components/SearchBar';

export function HomePage() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newConfessionAlert, setNewConfessionAlert] = useState(false);

  const loadConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfessions(data || []);
    } catch (error) {
      console.error('Error loading confessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfessions();

    // Set up real-time subscription
    const channel = supabase
      .channel('confessions_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'confessions',
          filter: 'is_approved=eq.true'
        },
        (payload) => {
          const newConfession = payload.new as Confession;
          setConfessions(prev => {
            const exists = prev.some(c => c.id === newConfession.id);
            if (!exists) {
              setNewConfessionAlert(true);
              setTimeout(() => setNewConfessionAlert(false), 3000);
              return [newConfession, ...prev];
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredConfessions = confessions.filter(
    (confession) =>
      confession.target_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      confession.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block bg-black dark:bg-white p-6 rounded-full mb-8">
          <Heart className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-black dark:text-white mb-6">
          ConfessWorld
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          A place to express your feelings beautifully. Share love, hopes, and dreams ✨
        </p>
      </div>

      {/* New Confession Alert */}
      {newConfessionAlert && (
        <div className="fixed top-20 right-4 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl shadow-lg flex items-center space-x-2 z-50 animate-bounce">
          <Sparkles className="h-5 w-5" />
          <span>New confession! 💕</span>
        </div>
      )}

      <div className="mb-20">
        {/* Confession Form */}
        <ConfessionForm onConfessionSubmitted={loadConfessions} />
      </div>

      {/* Search and Confessions List */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl font-bold text-black dark:text-white">
            All Confessions
          </h2>
          <button
            onClick={loadConfessions}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or message..."
          />
        </div>
      </div>

      {/* Confessions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-3xl h-64"></div>
            </div>
          ))}
        </div>
      ) : filteredConfessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredConfessions.map((confession) => (
            <ConfessionCard key={confession.id} confession={confession} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
            {searchQuery ? 'No confessions found' : 'No confessions yet'}
          </h3>
          <p className="text-gray-300 dark:text-gray-600">
            {searchQuery ? 'Try different keywords' : 'Be the first to confess 💕'}
          </p>
        </div>
      )}
    </div>
  );
}