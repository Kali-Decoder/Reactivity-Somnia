"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Network } from "lucide-react";
import { Chain } from "viem";

interface NetworkSwitcherProps {
  chains: Chain[];
  currentChainId?: number;
  onSwitchNetwork: (chain: Chain) => void;
}

export function NetworkSwitcher({ chains, currentChainId, onSwitchNetwork }: NetworkSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current chain
  const currentChain = chains.find((c) => c.id === currentChainId) || chains[0];

  // Filter chains based on search
  const filteredChains = chains.filter((chain) => {
    const query = searchQuery.toLowerCase();
    return (
      chain.name.toLowerCase().includes(query) ||
      chain.id.toString().includes(query)
    );
  });

  // Group chains by type
  const mainnets = filteredChains.filter((c) => !c.testnet);
  const testnets = filteredChains.filter((c) => c.testnet);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectChain = async (chain: Chain) => {
    setIsSwitching(true);
    try {
      await onSwitchNetwork(chain);
      setIsOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Network Button */}
      <button
        onClick={() => !isSwitching && setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-lg hover:bg-white/5 transition-colors min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Network className={`w-4 h-4 text-monad-purple ${isSwitching ? 'animate-spin' : ''}`} />
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white truncate">
            {isSwitching ? 'Switching...' : currentChain.name}
          </p>
          <p className="text-xs text-gray-400">Chain ID: {currentChain.id}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-card-border rounded-lg shadow-xl z-50 max-h-[400px] overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-card-border">
            <input
              type="text"
              placeholder="Search networks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-monad-purple"
              autoFocus
            />
          </div>

          {/* Chain List */}
          <div className="overflow-y-auto custom-scrollbar">
            {mainnets.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 bg-black/30">
                  Mainnets
                </div>
                {mainnets.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleSelectChain(chain)}
                    disabled={isSwitching}
                    className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentChainId === chain.id ? "bg-monad-purple/10" : ""
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{chain.name}</p>
                      <p className="text-xs text-gray-400">Chain ID: {chain.id}</p>
                    </div>
                    {currentChainId === chain.id && (
                      <Check className="w-4 h-4 text-monad-purple" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {testnets.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 bg-black/30">
                  Testnets
                </div>
                {testnets.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleSelectChain(chain)}
                    disabled={isSwitching}
                    className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentChainId === chain.id ? "bg-monad-purple/10" : ""
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{chain.name}</p>
                      <p className="text-xs text-gray-400">Chain ID: {chain.id}</p>
                    </div>
                    {currentChainId === chain.id && (
                      <Check className="w-4 h-4 text-monad-purple" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {filteredChains.length === 0 && (
              <div className="px-3 py-8 text-center text-gray-400 text-sm">
                No networks found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

