"use client";

import Link from "next/link";
import { Home, BookOpen, ArrowRight, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-monad-purple/10 border-2 border-monad-purple/30">
            <AlertCircle className="w-12 h-12 text-monad-purple" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-bold bg-gradient-to-r from-monad-purple via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        {/* Message */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-monad-purple hover:bg-monad-purple/90 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-monad-purple/20"
          >
            <Home className="w-5 h-5" />
            <span>Go to Game</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-medium transition-all"
          >
            <BookOpen className="w-5 h-5" />
            <span>View Documentation</span>
          </Link>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Lost in the blockchain? No worries, we've got you covered! 💜
          </p>
        </div>
      </div>
    </div>
  );
}
