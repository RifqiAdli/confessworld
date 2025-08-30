import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Moon, Sun, Music } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from memory (since localStorage isn't available in Claude.ai)
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">

      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-black dark:bg-white p-2 rounded-full group-hover:scale-110 transition-transform duration-200">
                <Music className="h-5 w-5 text-white dark:text-black" />
              </div>
              <h1 className="text-xl font-bold text-black dark:text-white">
                ConfessWorld
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {children}
      </main>

      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Made with <Heart className="inline h-4 w-4 text-red-500 mx-1" /> for spreading love
          </p>
        </div>
      </footer>
    </div>
  );
}