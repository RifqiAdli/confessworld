import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Copy, Check, Sparkles, MessageCircle, Download, Camera } from 'lucide-react';
import { supabase, Confession } from '../lib/supabase';
import { ConfessionCard } from '../components/ConfessionCard';

export function ConfessionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadConfession = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('confessions')
          .select('*')
          .eq('unique_slug', slug)
          .eq('is_approved', true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setConfession(data);
          // Increment view count
          await supabase
            .from('confessions')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', data.id);
        }
      } catch (error) {
        console.error('Error loading confession:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
        // Reduced delay for faster appearance
        setTimeout(() => setFadeIn(true), 50);
      }
    };

    loadConfession();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Confess Spesial - ConfessWorld',
          text: 'Lihat confess yang menyentuh hati ini',
          url: url
        });
      } catch (error) {
        // Fallback to copy
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const saveAsImage = async () => {
    if (!confession || !canvasRef.current) {
      console.log('Missing confession or canvas:', { confession, canvas: canvasRef.current });
      return;
    }
    
    setIsGeneratingImage(true);
    
    // Debug: Log confession data
    console.log('Confession data:', confession);
    console.log('Confession content:', confession.content);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size for high quality
      const width = 800;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#fdf2f8'); // pink-50
      gradient.addColorStop(0.5, '#faf5ff'); // purple-50
      gradient.addColorStop(1, '#eef2ff'); // indigo-50
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(236, 72, 153, 0.03)'; // pink with very low opacity
      for (let i = 0; i < width; i += 60) {
        for (let j = 0; j < height; j += 60) {
          ctx.fillRect(i, j, 30, 30);
        }
      }

      // Card background with shadow
      const cardY = 120;
      const cardHeight = height - 240;
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(52, cardY + 8, width - 104, cardHeight);
      
      // Card background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(50, cardY, width - 100, cardHeight);
      
      // Card border
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, cardY, width - 100, cardHeight);

      // Header
      ctx.fillStyle = '#ec4899'; // pink-500
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💕 ConfessWorld 💕', width / 2, 80);

      // Confession content - show target_name if available
      ctx.fillStyle = '#374151'; // gray-700
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.textAlign = 'left';
      
      const maxWidth = width - 140;
      const lineHeight = 35;
      let currentY = cardY + 60;
      
      // Draw target name if available
      if (confession?.target_name) {
        ctx.fillStyle = '#ec4899'; // pink-500
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Untuk: ${confession.target_name}`, width / 2, currentY);
        currentY += 50;
      }
      
      // Reset for message text
      ctx.fillStyle = '#374151'; // gray-700
      ctx.font = '24px Arial, sans-serif';
      ctx.textAlign = 'left';
      
      // Word wrap function
      const wrapText = (text: string, maxWidth: number) => {
        // Add safety check for undefined/null text
        if (!text || typeof text !== 'string') {
          console.log('Invalid text for wrapText:', text);
          return ['Content tidak dapat dimuat'];
        }
        
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        return lines;
      };

      // Draw confession text with better safety check
      const confessionContent = confession.message || confession.song_url || 'Content tidak tersedia';
      console.log('Final confession content for image:', confessionContent);
      const confessionLines = wrapText(confessionContent, maxWidth);
      confessionLines.forEach((line, index) => {
        if (currentY < cardY + cardHeight - 100) { // Leave space for bottom elements
          ctx.fillText(line, 90, currentY + (index * lineHeight));
        }
      });
      
      currentY += confessionLines.length * lineHeight + 40;

      // Category and date
      if (currentY < cardY + cardHeight - 60) {
        ctx.fillStyle = '#9333ea'; // purple-600
        ctx.font = '18px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        
        
        
        ctx.fillStyle = '#6b7280'; // gray-500
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        const dateText = new Date(confession.created_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        ctx.fillText(dateText, width / 2, currentY + 30);
      }

      // Watermark at bottom
      const watermarkY = height - 40;
      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'; // gray-400 with opacity
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ConfessWorld - Platform Confess Terpercaya', width / 2, watermarkY);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `confession-${confession.unique_slug}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsGeneratingImage(false);
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('Error generating image:', error);
      setIsGeneratingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Simplified loading animation - no animate-pulse on container */}
          <div className="space-y-8">
            {/* Back button skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
            
            {/* Header skeleton */}
            <div className="text-center space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80 mx-auto animate-pulse"></div>
            </div>
            
            {/* Card skeleton - simplified */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg h-96 border border-gray-200 dark:border-gray-700 animate-pulse"></div>
            
            {/* CTA skeleton */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl h-48 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !confession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* Simplified bounce animation */}
          <div className="mb-8 animate-bounce">
            <Heart className="h-24 w-24 text-pink-400 dark:text-pink-500 mx-auto" />
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Confess Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
            Mungkin confess ini belum disetujui atau link sudah tidak valid. 
            Jangan khawatir, masih banyak confess indah lainnya yang menanti! 💕
          </p>
          
          <Link
            to="/"
            className="group inline-flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-semibold">Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="group inline-flex items-center space-x-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Header Section - Simplified animations */}
        <div className="text-center mb-12 relative">
          {/* Static background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-5">
            <Sparkles className="h-32 w-32 text-pink-400" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Confess Spesial ✨
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Seseorang telah mengungkapkan perasaannya dengan indah. 
              Mari kita rasakan kehangatan kata-kata yang tulus ini 💕
            </p>
          </div>
        </div>

        {/* Main Confession Card - Reduced animation intensity */}
        <div className="mb-12 hover:scale-[1.01] transition-transform duration-200">
          <div className="relative">
            {/* Simplified glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-600/10 rounded-3xl"></div>
            <div className="relative">
              <ConfessionCard confession={confession} showActions={false} />
            </div>
          </div>
        </div>

        {/* Stats and Share Section - UPDATED dengan tombol Save to Image */}
        <div className="mb-12">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                {confession.views && (
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{confession.views.toLocaleString('id-ID')} views</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>Dibuat dengan cinta</span>
                </div>
              </div>
              
              {/* Button group untuk Share dan Save to Image */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={saveAsImage}
                  disabled={isGeneratingImage}
                  className="group inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGeneratingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 group-hover:rotate-6 transition-transform duration-200" />
                      <span className="font-medium">Save as Image</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="group inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 group-hover:rotate-6 transition-transform duration-200" />
                      <span className="font-medium">Bagikan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action - Optimized */}
        <div className="relative">
          {/* Simplified background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 to-purple-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl"></div>
          
          <div className="relative bg-white/95 dark:bg-gray-800/95 rounded-3xl p-8 md:p-12 border border-pink-200/50 dark:border-purple-800/30 shadow-lg">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Tersentuh dengan Confess Ini? 
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  Setiap cerita cinta layak untuk didengar. Bagikan perasaan terdalam kamu 
                  dan biarkan dunia merasakan kehangatan kata-kata yang tulus ✨
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/"
                  className="group inline-flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-pink-600 hover:to-purple-700 hover:scale-105 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Buat Confess Kamu</span>
                </Link>
                
                <Link
                  to="/"
                  className="group inline-flex items-center space-x-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-pink-400 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:scale-105 transition-all duration-200 font-semibold"
                >
                  <Sparkles className="h-5 w-5 group-hover:rotate-6 transition-transform duration-200" />
                  <span>Baca Confess Lainnya</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas for image generation */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
          width={800}
          height={1000}
        />
      </div>
    </div>
  );
}