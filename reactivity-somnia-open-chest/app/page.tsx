"use client";
import Link from "next/link";
import { Gamepad2, BookOpen, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-monad-purple/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-monad-purple/10 border border-monad-purple/30 rounded-full text-sm text-monad-purple mb-6">
            <Zap className="w-4 h-4" />
            <span>Powered by Somnia On-Chain Reactivity</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-monad-purple via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Magic Chest Game
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Experience blockchain's future with automatic smart contract reactions. 
            Open chests, earn rewards—all powered by on-chain reactivity.
          </p>

          {/* Main CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Play Game Card */}
            <Link href="/game" className="group">
              <div className="bg-card border border-card-border rounded-2xl p-8 hover:border-monad-purple/50 transition-all hover:shadow-lg hover:shadow-monad-purple/20">
                <div className="w-16 h-16 rounded-full bg-monad-purple/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-8 h-8 text-monad-purple" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Play the Game</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Connect your wallet and start opening chests to experience on-chain reactivity in action!
                </p>
                <div className="flex items-center justify-center gap-2 text-monad-purple font-medium">
                  <span>Start Playing</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Learn More Card */}
            <Link href="/docs" className="group">
              <div className="bg-card border border-card-border rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Learn How It Works</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Explore interactive documentation to understand the technology behind on-chain reactivity.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-400 font-medium">
                  <span>View Documentation</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-white mb-2">Automatic Reactions</h3>
            <p className="text-sm text-gray-400">
              No manual callbacks or off-chain infrastructure needed
            </p>
          </div>
          
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-white mb-2">Gas Efficient</h3>
            <p className="text-sm text-gray-400">
              Users only pay for their actions, not reactive logic
            </p>
          </div>
          
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold text-white mb-2">Fully On-Chain</h3>
            <p className="text-sm text-gray-400">
              Everything executes on-chain via Somnia validators
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p className="mb-2">Made with 💜 by Nikku.Dev</p>
          <p>Powered by Somnia Network's On-Chain Reactivity</p>
        </div>
      </div>
    </div>
  );
}
