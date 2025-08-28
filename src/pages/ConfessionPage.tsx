import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { supabase, Confession } from '../lib/supabase';
import { ConfessionCard } from '../components/ConfessionCard';

export function ConfessionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        }
      } catch (error) {
        console.error('Error loading confession:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfession();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96"></div>
        </div>
      </div>
    );
  }

  if (notFound || !confession) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Confess tidak ditemukan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Confess mungkin belum disetujui atau link sudah tidak valid
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Confess Spesial 💕
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Seseorang telah mengungkapkan perasaannya dengan indah
          </p>
        </div>
      </div>

      <ConfessionCard confession={confession} showActions={false} />

      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-pink-200 dark:border-purple-800/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Tersentuh dengan confess ini? 
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bagikan perasaan kamu juga di ConfessWorld
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            <Heart className="h-4 w-4" />
            <span>Buat Confess</span>
          </Link>
        </div>
      </div>
    </div>
  );
}