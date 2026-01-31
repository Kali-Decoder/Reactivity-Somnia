"use client";

import { Coins, Sword, Trophy } from "lucide-react";

interface PlayerStatsProps {
  coins: number;
  hasLegendarySword: boolean;
  isLoading: boolean;
}

export function PlayerStats({ coins, hasLegendarySword, isLoading }: PlayerStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Coins Card */}
      <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-monad-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Your Coins</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-monad-purple font-mono">{coins.toLocaleString()}</p>
            )}
          </div>
          <div className="h-14 w-14 rounded-xl bg-monad-purple/10 flex items-center justify-center">
            <Coins className="h-7 w-7 text-monad-purple" />
          </div>
        </div>
      </div>

      {/* Legendary Sword Card */}
      <div className={`bg-card border rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 ${
        hasLegendarySword 
          ? "border-yellow-500/50 shadow-yellow-500/20 shadow-lg" 
          : "border-card-border"
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
          hasLegendarySword 
            ? "from-yellow-500/10 to-transparent opacity-100" 
            : "from-monad-purple/5 to-transparent opacity-0 group-hover:opacity-100"
        }`} />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Legendary Sword</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <p className={`text-2xl font-bold ${hasLegendarySword ? "text-yellow-500" : "text-gray-600"}`}>
                {hasLegendarySword ? "✓ Obtained" : "Not Found"}
              </p>
            )}
          </div>
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
            hasLegendarySword ? "bg-yellow-500/10" : "bg-gray-700/50"
          }`}>
            <Sword className={`h-7 w-7 ${hasLegendarySword ? "text-yellow-500" : "text-gray-600"}`} />
          </div>
        </div>

        {hasLegendarySword && (
          <div className="absolute top-2 right-2">
            <span className="text-2xl animate-pulse">⚔️</span>
          </div>
        )}
      </div>
    </div>
  );
}

