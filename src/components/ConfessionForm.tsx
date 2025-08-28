import React, { useState } from 'react';
import { Heart, Music, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractSpotifyEmbedId } from '../utils/spotify';

interface ConfessionFormProps {
  onConfessionSubmitted?: () => void;
}

export function ConfessionForm({ onConfessionSubmitted }: ConfessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    targetName: '',
    message: '',
    songUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.targetName.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);

    try {
      const songEmbedId = formData.songUrl ? extractSpotifyEmbedId(formData.songUrl) : null;

      // Debug: log data yang akan dikirim
      const insertData = {
        target_name: formData.targetName.trim(),
        message: formData.message.trim(),
        song_url: formData.songUrl.trim() || null,
        song_embed_id: songEmbedId,
        is_approved: true, // Langsung approve
      };
      
      console.log('Sending data:', insertData);

      const { error, data } = await supabase.from('confessions').insert([insertData]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Success response:', data);

      setFormData({ targetName: '', message: '', songUrl: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onConfessionSubmitted?.();
    } catch (error) {
      console.error('Error submitting confession:', error);
      alert('Terjadi kesalahan saat mengirim confess. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block bg-black dark:bg-white p-4 rounded-full mb-6">
          <Heart className="h-8 w-8 text-white dark:text-black" />
        </div>
        <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
          Send your confession
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Express your feelings beautifully
        </p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-8">
          <p className="text-green-700 dark:text-green-300 text-center">
            Confession sent and published successfully! 💕
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            To whom?
          </label>
          <input
            type="text"
            value={formData.targetName}
            onChange={(e) => setFormData(prev => ({ ...prev, targetName: e.target.value }))}
            placeholder="Name or initials..."
            className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Your message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Write your feelings here..."
            rows={6}
            className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 outline-none transition-all duration-200 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg leading-relaxed"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            <Music className="inline h-4 w-4 mr-1" />
            Spotify song (optional)
          </label>
          <input
            type="url"
            value={formData.songUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, songUrl: e.target.value }))}
            placeholder="https://open.spotify.com/track/..."
            className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
          />
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Copy the song link from Spotify to add a romantic touch
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.targetName.trim() || !formData.message.trim()}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-medium py-4 px-6 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Send Confession</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}