"use client";

import React from "react";
import { ExternalLink, User, Hash, Clock, TrendingUp } from "lucide-react";

interface TransactionDetailsProps {
  transaction: {
    id: string;
    hash: string;
    chainName: string;
    chainColor: string;
    timestamp: number;
    caller: string;
    count: number;
  };
  explorerUrl?: string;
  onClose?: () => void;
}

export function TransactionDetails({ transaction, explorerUrl, onClose }: TransactionDetailsProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: `${transaction.chainColor}20`, color: transaction.chainColor }}
          >
            {transaction.chainName[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{transaction.chainName}</h3>
            <p className="text-xs text-gray-400">Transaction Details</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Transaction Hash */}
        <div className="flex items-start gap-2">
          <Hash className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-monad-purple font-mono truncate">
                {transaction.hash}
              </p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-monad-purple hover:text-monad-purple/80 transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Caller Address */}
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">Caller</p>
            <p className="text-sm text-white font-mono truncate">
              {transaction.caller}
            </p>
          </div>
        </div>

        {/* Count Value */}
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Count Value</p>
            <p className="text-2xl font-bold text-monad-purple">
              {transaction.count.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Time</p>
            <p className="text-sm text-white">
              {formatTime(transaction.timestamp)}
            </p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {new Date(transaction.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

