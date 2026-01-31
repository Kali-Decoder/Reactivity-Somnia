"use client";

import { useState } from "react";
import { Package, Sparkles, Crown } from "lucide-react";

interface ChestCardProps {
  type: "COMMON" | "RARE" | "LEGENDARY";
  reward: string;
  isOpening: boolean;
  onOpen: () => void;
  disabled?: boolean;
}

const chestConfig = {
  COMMON: {
    icon: Package,
    color: "from-gray-600 to-gray-800",
    borderColor: "border-gray-600/50",
    glowColor: "shadow-gray-600/20",
    emoji: "📦",
    title: "Common Chest",
  },
  RARE: {
    icon: Sparkles,
    color: "from-blue-600 to-purple-600",
    borderColor: "border-blue-500/50",
    glowColor: "shadow-blue-500/30",
    emoji: "✨",
    title: "Rare Chest",
  },
  LEGENDARY: {
    icon: Crown,
    color: "from-yellow-500 to-orange-600",
    borderColor: "border-yellow-500/50",
    glowColor: "shadow-yellow-500/40",
    emoji: "👑",
    title: "Legendary Chest",
  },
};

export function ChestCard({ type, reward, isOpening, onOpen, disabled }: ChestCardProps) {
  const config = chestConfig[type];
  const Icon = config.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.color} p-6 transition-all duration-300 ${
        isHovered && !disabled ? `scale-105 ${config.glowColor} shadow-2xl` : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Animated glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Chest emoji with animation */}
        <div className={`text-6xl transition-transform duration-300 ${isHovered && !disabled ? "scale-110 rotate-6" : ""} ${isOpening ? "animate-bounce" : ""}`}>
          {config.emoji}
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">{config.title}</h3>
          <p className="text-sm text-gray-300">{reward}</p>
        </div>

        {/* Open button */}
        <button
          onClick={onOpen}
          disabled={disabled || isOpening}
          className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
            disabled || isOpening
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          }`}
        >
          {isOpening ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              Opening...
            </span>
          ) : (
            "Open Chest"
          )}
        </button>
      </div>

      {/* Shine effect on hover */}
      {isHovered && !disabled && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shine_1.5s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  );
}

