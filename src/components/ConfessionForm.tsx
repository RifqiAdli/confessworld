import React, { useState } from 'react';
import { Heart, Music, Send, Loader2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractSpotifyEmbedId } from '../utils/spotify';

interface ConfessionFormProps {
  onConfessionSubmitted?: () => void;
}

// Kode rahasia untuk developer (tersembunyi)
const DEV_CODES = [
  'LOVECODE2024',
  'HEARTDEV',
  'DEVCONFESS',
  'BLUECHECK',
  'VERIFIED_LOVE'
];

export function ConfessionForm({ onConfessionSubmitted }: ConfessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [extractedCode, setExtractedCode] = useState('');
  const [formData, setFormData] = useState({
    targetName: '',
    message: '',
    songUrl: '',
  });

  const parseTargetName = (input: string) => {
    // Check format {CODE} Name
    const codeMatch = input.match(/^{([^}]+)}\s*(.+)$/);
    if (codeMatch) {
      const [, code, name] = codeMatch;
      const isValidCode = DEV_CODES.includes(code.toUpperCase().trim());
      return {
        isVerified: isValidCode,
        code: isValidCode ? code.toUpperCase().trim() : '',
        targetName: name.trim()
      };
    }
    
    return {
      isVerified: false,
      code: '',
      targetName: input.trim()
    };
  };

  const handleTargetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, targetName: value }));
    
    const parsed = parseTargetName(value);
    setIsVerified(parsed.isVerified);
    setExtractedCode(parsed.code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.targetName.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);

    try {
      const songEmbedId = formData.songUrl ? extractSpotifyEmbedId(formData.songUrl) : null;
      const parsed = parseTargetName(formData.targetName);

      const insertData = {
        target_name: parsed.targetName,
        message: formData.message.trim(),
        song_url: formData.songUrl.trim() || null,
        song_embed_id: songEmbedId,
        is_approved: true,
        is_verified: parsed.isVerified,
        dev_code: parsed.isVerified ? parsed.code : null,
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
      setIsVerified(false);
      setExtractedCode('');
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
            Confession sent and published successfully! 
            {isVerified && <span className="ml-1">✨ With verified badge!</span>} 💕
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            To whom?
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.targetName}
              onChange={handleTargetNameChange}
              placeholder="Name or initials..."
              className={`w-full px-4 py-4 pr-12 rounded-2xl bg-gray-50 dark:bg-gray-800 border transition-all duration-200 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg ${
                isVerified 
                  ? 'border-blue-500 focus:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'
              }`}
              required
            />
            {isVerified && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="bg-blue-500 text-white rounded-full p-1.5 shadow-lg">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
          {isVerified && (
            <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400 text-sm">
              <Shield className="h-3 w-3 mr-1" />
              <span>Verified confession - will display with blue checkmark</span>
            </div>
          )}
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
              {isVerified && <Shield className="h-4 w-4 text-blue-400 ml-1" />}
            </>
          )}
        </button>
      </form>
    </div>
  );
}