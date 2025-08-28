import React from 'react';
import { Heart, Music, Calendar, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Confession } from '../lib/supabase';
import { createSpotifyEmbedUrl } from '../utils/spotify';

interface ConfessionCardProps {
  confession: Confession;
  showActions?: boolean;
}

export function ConfessionCard({ confession, showActions = true }: ConfessionCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when sharing
    
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

  const handleCardClick = () => {
    navigate(`/confession/${confession.unique_slug}`);
  };

  const handleSpotifyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when interacting with Spotify
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300 cursor-pointer hover:scale-105 hover:border-pink-200 dark:hover:border-pink-800/50 group"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-black dark:bg-white p-2 rounded-full group-hover:scale-110 transition-transform duration-200">
            <Heart className="h-4 w-4 text-white dark:text-black" />
          </div>
          <div>
            <h3 className="font-semibold text-xl text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200">
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
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 group/share opacity-70 group-hover:opacity-100"
            title="Share confession"
          >
            <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover/share:scale-110 group-hover/share:text-pink-600 dark:group-hover/share:text-pink-400 transition-all duration-200" />
          </button>
        )}
      </div>

      <div className="mb-8">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
          {confession.message}
        </p>
      </div>

      {confession.song_embed_id && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Music className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-pink-500 transition-colors duration-200" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200">
              A special song for you
            </span>
          </div>
          <div 
            className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
            onClick={handleSpotifyClick}
          >
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

      {/* Subtle indicator that card is clickable */}
      <div className="text-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Click to view full confession
        </span>
      </div>
    </div>
  );
}