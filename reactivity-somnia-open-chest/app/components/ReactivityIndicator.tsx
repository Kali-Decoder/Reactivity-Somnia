"use client";

import { Activity, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ReactivityIndicatorProps {
  isProcessing: boolean;
  lastUpdate?: number;
}

export function ReactivityIndicator({ isProcessing, lastUpdate }: ReactivityIndicatorProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeElapsed(0);
    }
  }, [isProcessing]);

  return (
    <div className={`rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 ${
      isProcessing 
        ? "bg-monad-purple/10 border-monad-purple/30" 
        : "bg-card border-card-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isProcessing ? (
            <div className="relative">
              <Activity className="h-5 w-5 text-monad-purple animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-monad-purple/20 animate-ping" />
            </div>
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          
          <div>
            <p className="text-sm font-medium text-white">
              {isProcessing ? "On-Chain Reactivity Processing..." : "Ready"}
            </p>
            <p className="text-xs text-gray-400">
              {isProcessing 
                ? `Waiting for reactivity (${timeElapsed}s)` 
                : lastUpdate 
                ? `Last update: ${new Date(lastUpdate).toLocaleTimeString()}` 
                : "Open a chest to see reactivity in action"
              }
            </p>
          </div>
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-monad-purple">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="font-mono">{timeElapsed}s</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mt-3 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-monad-purple to-purple-400 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min((timeElapsed / 10) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

