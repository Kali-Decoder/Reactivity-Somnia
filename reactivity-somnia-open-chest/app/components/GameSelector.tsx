"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AVAILABLE_GAMES } from "../config/games";

export function GameSelector() {
  const pathname = usePathname();

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Choose Your Game</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AVAILABLE_GAMES.map((game) => {
          const isActive = pathname === game.route || 
            (pathname === '/' && game.route === '/') ||
            (pathname.startsWith('/lastplayer') && game.id === 'lastplayer');
          
          return (
            <Link
              key={game.id}
              href={game.route}
              className={`group relative overflow-hidden rounded-xl p-5 transition-all duration-300 ${
                isActive
                  ? "bg-monad-purple/20 border-2 border-monad-purple shadow-lg shadow-monad-purple/20"
                  : "bg-card border border-card-border hover:border-monad-purple/50 hover:bg-card/80"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-4xl transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}>
                  {game.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg mb-1 transition-colors ${
                    isActive ? "text-monad-purple" : "text-white group-hover:text-monad-purple"
                  }`}>
                    {game.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {game.description}
                  </p>
                  {isActive && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-monad-purple">
                      <div className="w-2 h-2 rounded-full bg-monad-purple animate-pulse" />
                      <span>Currently Playing</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
