"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
}

export default function ContentPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/articles/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch article');
        }
        const articleData = await res.json();
        setArticle(articleData);
        
        // Check if audio file exists
        const checkAudio = async () => {
          try {
            const audioResponse = await fetch(`/articles/${articleData.id}.mp3`, { method: 'HEAD' });
            setHasAudio(audioResponse.ok);
          } catch {
            setHasAudio(false);
          }
        };
        
        checkAudio();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500/20"></div>
        </div>
        <span className="ml-6 text-white/80 text-lg">Loading story...</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-white mb-4">Story Not Found</h2>
          <p className="text-white/70 mb-6">We couldn't find this story.</p>
          <Link 
            href="/" 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
          >
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Logo */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="KidScoop Logo"
              width={60}
              height={60}
              className="rounded-full shadow-2xl hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
          </div>
        </Link>
      </div>

      {/* Back Button */}
      <div className="fixed top-8 right-8 z-50">
        <Link href="/">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center text-white/80 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Stories
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Article Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
              <span className="text-purple-300 text-sm font-medium">
                {new Date(article.published_date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {article.title}
            </h1>
          </div>

          {/* Article Image */}
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={article.image_path}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="prose prose-invert max-w-none">
              <div className="text-white/90 leading-relaxed text-lg space-y-6">
                {article.content_text.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Section - Only show if audio file exists */}
          {hasAudio && (
            <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🎵 Story Song!</h2>
                <p className="text-white/70">Listen to the musical version of this story!</p>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 w-full max-w-md">
                  <audio 
                    controls 
                    className="w-full h-12 bg-white/10 rounded-lg"
                    style={{
                      filter: 'invert(1) hue-rotate(180deg)',
                    }}
                  >
                    <source src={`/articles/${article.id}.mp3`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="mt-4 text-center">
                    <p className="text-white/60 text-sm">
                      🎶 {article.title} - Musical Version
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coloring Section */}
          <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🎨 Coloring Fun!</h2>
              <p className="text-white/70">Download and color this picture!</p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative group">
                <Image
                  src={`/articles/${article.id}c.png`}
                  alt={`Coloring page for ${article.title}`}
                  width={400}
                  height={400}
                  className="rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-purple-500/90 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white text-sm font-medium">Click to download</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Link 
              href="/" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Read More Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
