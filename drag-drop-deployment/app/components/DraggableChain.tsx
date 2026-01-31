"use client";

import { Chain } from "viem";
import { Network, Check } from "lucide-react";

interface DraggableChainProps {
  chain: Chain;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function DraggableChain({ chain, isSelected, isDisabled, onClick }: DraggableChainProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`group w-full text-left rounded-xl border p-4 backdrop-blur-sm transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
        isSelected 
          ? 'border-monad-purple bg-monad-purple/20 shadow-[0_0_20px_-5px_rgba(135,109,255,0.5)]' 
          : 'border-white/10 bg-white/5 hover:border-monad-purple/50 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          isSelected ? 'bg-monad-purple' : 'bg-monad-purple/20'
        }`}>
          {isSelected ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <Network className="h-5 w-5 text-monad-purple" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{chain.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">ID: {chain.id}</span>
            {chain.testnet && (
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-xs">
                Testnet
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={`mt-3 text-xs transition-opacity ${
        isSelected 
          ? 'text-monad-purple opacity-100' 
          : 'text-gray-500 opacity-0 group-hover:opacity-100'
      }`}>
        {isSelected ? '✓ Selected' : '👆 Click to select'}
      </div>
    </button>
  );
}

