import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Eye, Search, Music } from 'lucide-react';
import { supabase, Confession } from '../lib/supabase';

export function AdminPage() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfessions(data || []);
    } catch (error) {
      console.error('Error loading confessions:', error);
      alert('Error loading confessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this confession? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('confessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConfessions(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting confession:', error);
      alert('Error deleting confession. Please try again.');
    }
  };

  const filteredConfessions = confessions.filter(
    (confession) =>
      confession.target_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      confession.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-full mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola semua confess yang telah dipublikasi
        </p>
      </div>

      {/* Search and Stats */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-pink-200 dark:border-purple-800/30 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg font-medium">
              Total Confessions: {confessions.length}
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium">
              With Songs: {confessions.filter(c => c.song_url).length}
            </div>
          </div>

          <div className="w-full sm:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search confessions..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Confessions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-32"></div>
          ))}
        </div>
      ) : filteredConfessions.length > 0 ? (
        <div className="space-y-6">
          {filteredConfessions.map((confession) => (
            <div
              key={confession.id}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-green-200 dark:border-green-800/30 p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Untuk {confession.target_name}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      Published
                    </span>
                    {confession.song_url && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Music className="h-3 w-3" />
                        <span>With Song</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Published: {formatDate(confession.created_at)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {confession.message}
                </p>
              </div>

              {confession.song_url && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center space-x-1">
                    <Music className="h-4 w-4" />
                    <span>Spotify Song:</span>
                  </p>
                  <a
                    href={confession.song_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline break-all"
                  >
                    {confession.song_url}
                  </a>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`/confession/${confession.unique_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Live</span>
                </a>

                <button
                  onClick={() => handleDelete(confession.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
            {searchQuery ? 'No matching confessions' : 'No confessions yet'}
          </h3>
          <p className="text-gray-400 dark:text-gray-500">
            {searchQuery ? 'Try different search terms' : 'Confessions will appear here once submitted'}
          </p>
        </div>
      )}
    </div>
  );
}