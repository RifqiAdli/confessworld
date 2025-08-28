import React from 'react';
import { Heart, Music, Calendar, Share2 } from 'lucide-react';
import { Confession } from '../lib/supabase';
import { createSpotifyEmbedUrl } from '../utils/spotify';

interface ConfessionCardProps {
  confession: Confession;
  showActions?: boolean;
}

export function ConfessionCard({ confession, showActions = true }: ConfessionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/confession/${confession.unique_slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Confess untuk ${confession.target_name}`,
          text: confession.message.substring(0, 100) + '...',
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to clipboard
        await navigator.clipboard.writeText(url);
        alert('Link berhasil disalin ke clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link berhasil disalin ke clipboard!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-black dark:bg-white p-2 rounded-full">
            <Heart className="h-4 w-4 text-white dark:text-black" />
          </div>
          <div>
            <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
              To {confession.target_name}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-400 dark:text-gray-500 mt-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(confession.created_at)}</span>
            </div>
          </div>
        </div>

        {showActions && (
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
            title="Share confession"
          >
            <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-200" />
          </button>
        )}
      </div>

      <div className="mb-8">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
          {confession.message}
        </p>
      </div>

      {confession.song_embed_id && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Music className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              A special song for you
            </span>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <iframe
              src={createSpotifyEmbedUrl(confession.song_embed_id)}
              width="100%"
              height="152"
              frameBorder="0"
              allowTransparency
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}