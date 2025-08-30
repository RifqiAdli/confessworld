import React, { useState } from 'react';
import { Heart, Music, Calendar, Share2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Confession } from '../lib/supabase';
import { createSpotifyEmbedUrl } from '../utils/spotify';

interface ConfessionCardProps {
  confession: Confession & { 
    like_count?: number; 
    user_has_liked?: boolean; 
  };
  showActions?: boolean;
  onLike?: (confessionId: string, isLiked: boolean) => Promise<void>;
}

export function ConfessionCard({ confession, showActions = true, onLike }: ConfessionCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(confession.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(confession.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when liking
    
    if (isLiking || !onLike) return;
    
    setIsLiking(true);
    const newLikedState = !isLiked;
    
    // Optimistic update
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    try {
      await onLike(confession.id, newLikedState);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
      console.error('Error liking confession:', error);
    } finally {
      setIsLiking(false);
    }
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
      className={`bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-xl border transition-all duration-300 cursor-pointer hover:scale-105 group p-8 ${
        confession.is_verified 
          ? 'border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700/50 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20'
          : 'border-gray-100 dark:border-gray-800 hover:border-pink-200 dark:hover:border-pink-800/50'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full group-hover:scale-110 transition-transform duration-200 ${
            confession.is_verified 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-black dark:bg-white'
          }`}>
            <Heart className={`h-4 w-4 ${
              confession.is_verified 
                ? 'text-white' 
                : 'text-white dark:text-black'
            }`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold text-xl transition-colors duration-200 ${
                confession.is_verified
                  ? 'text-blue-900 dark:text-blue-100 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                  : 'text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400'
              }`}>
                To {confession.target_name}
              </h3>
              {confession.is_verified && (
                <div className="relative group/verified">
                  <div className="bg-blue-500 text-white rounded-full p-1 shadow-lg">
                    <Shield className="h-3 w-3" />
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/verified:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Verified
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-400 dark:text-gray-500 mt-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(confession.created_at)}</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 p-2 rounded-full transition-all duration-200 group/like opacity-70 group-hover:opacity-100 ${
                isLiked
                  ? confession.is_verified
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-pink-500 hover:bg-pink-600'
                  : confession.is_verified
                    ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-pink-100 dark:hover:bg-pink-900/30'
              } ${isLiking ? 'scale-95' : 'hover:scale-105'}`}
              title={isLiked ? "Unlike confession" : "Like confession"}
            >
              <Heart className={`h-4 w-4 transition-all duration-200 ${
                isLiked
                  ? 'text-white fill-current'
                  : confession.is_verified
                    ? 'text-blue-600 dark:text-blue-400 group-hover/like:text-blue-700 dark:group-hover/like:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 group-hover/like:text-pink-600 dark:group-hover/like:text-pink-400'
              } ${isLiking ? 'scale-90' : 'group-hover/like:scale-110'}`} />
              {likeCount > 0 && (
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  isLiked
                    ? 'text-white'
                    : confession.is_verified
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {likeCount}
                </span>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`p-2 rounded-full transition-all duration-200 group/share opacity-70 group-hover:opacity-100 ${
                confession.is_verified
                  ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 hover:text-blue-600 dark:hover:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400'
              }`}
              title="Share confession"
            >
              <Share2 className={`h-4 w-4 transition-all duration-200 group-hover/share:scale-110 ${
                confession.is_verified
                  ? 'text-blue-600 dark:text-blue-400 group-hover/share:text-blue-700 dark:group-hover/share:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 group-hover/share:text-pink-600 dark:group-hover/share:text-pink-400'
              }`} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <p className={`leading-relaxed whitespace-pre-wrap text-lg transition-colors duration-200 ${
          confession.is_verified
            ? 'text-blue-800 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-blue-100'
            : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
        }`}>
          {confession.message}
        </p>
      </div>

      {confession.song_embed_id && (
        <div className={`border-t pt-6 ${
          confession.is_verified 
            ? 'border-blue-200 dark:border-blue-800/50' 
            : 'border-gray-100 dark:border-gray-800'
        }`}>
          <div className="flex items-center space-x-2 mb-4">
            <Music className={`h-4 w-4 transition-colors duration-200 ${
              confession.is_verified
                ? 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 group-hover:text-pink-500'
            }`} />
            <span className={`text-sm font-medium transition-colors duration-200 ${
              confession.is_verified
                ? 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400'
            }`}>
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

      {/* Stats and verified badge */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {/* Like count display */}
          <div className="flex items-center space-x-4">
            {likeCount > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Heart className="h-3 w-3 fill-current text-pink-500" />
                <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
              </div>
            )}
          </div>

          {/* Verified badge */}
          {confession.is_verified && (
            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
              <Shield className="h-3 w-3" />
              <span>Verified Confession</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle indicator that card is clickable */}
      <div className="text-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Click to view full confession
        </span>
      </div>
    </div>
  );
}