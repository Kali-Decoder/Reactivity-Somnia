"use client";

import { useState } from "react";
import { ContractTemplate } from "@/app/config/contract_templates";
import { Chain } from "viem";
import { FileCode, Network, ChevronDown, ChevronRight, CheckCircle, Search, X } from "lucide-react";
import { PushUI, PushUniversalAccountButton, usePushWalletContext } from "@pushchain/ui-kit";

interface SidebarProps {
  templates: ContractTemplate[];
  chains: Chain[];
}

export function Sidebar({ templates, chains }: SidebarProps) {
  const [templatesExpanded, setTemplatesExpanded] = useState(true);
  const [chainsExpanded, setChainsExpanded] = useState(true);
  const [chainFilter, setChainFilter] = useState<"all" | "mainnet" | "testnet">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const walletContext = usePushWalletContext();
  const connectionStatus = walletContext?.connectionStatus;
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  const handleTemplateDragStart = (e: React.DragEvent, template: ContractTemplate) => {
    e.dataTransfer.setData("template", JSON.stringify(template));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleChainDragStart = (e: React.DragEvent, chain: Chain) => {
    e.dataTransfer.setData("chain", JSON.stringify({ id: chain.id, name: chain.name }));
    e.dataTransfer.effectAllowed = "copy";
  };

  const filteredChains = chains.filter((chain) => {
    // Filter by type (mainnet/testnet)
    if (chainFilter === "mainnet" && chain.testnet) return false;
    if (chainFilter === "testnet" && !chain.testnet) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = chain.name.toLowerCase().includes(query);
      const matchesId = chain.id.toString().includes(query);
      return matchesName || matchesId;
    }
    
    return true;
  });

  return (
    <div className="h-screen w-80 bg-black border-r border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Drag Deployer</h2>
            <p className="text-xs text-gray-400">Drag & drop to deploy</p>
          </div>
        </div>
        
        {/* Wallet Connect Button */}
        <div className="mb-4">
          <PushUniversalAccountButton />
        </div>
        
        {/* Current Network Indicator */}
        {isConnected && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-500 font-medium">Wallet Connected</p>
                <p className="text-sm text-white font-semibold truncate">
                  Push Chain Universal Wallet
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Templates Section */}
        <div className="border-b border-white/10">
          <button
            onClick={() => setTemplatesExpanded(!templatesExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-monad-purple" />
              <span className="font-semibold text-white">Contract Templates</span>
              <span className="text-xs text-gray-500">({templates.length})</span>
            </div>
            {templatesExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {templatesExpanded && (
            <div className="p-3 space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  draggable
                  onDragStart={(e) => handleTemplateDragStart(e, template)}
                  className="group cursor-grab active:cursor-grabbing rounded-lg border border-white/10 bg-white/5 p-3 hover:border-monad-purple/50 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-monad-purple/10 text-monad-purple text-xs">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ⬅️ Drag to canvas
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chains Section */}
        <div>
          <button
            onClick={() => setChainsExpanded(!chainsExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-monad-purple" />
              <span className="font-semibold text-white">Blockchain Networks</span>
              <span className="text-xs text-gray-500">({filteredChains.length})</span>
            </div>
            {chainsExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {chainsExpanded && (
            <div className="p-3">
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search networks..."
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-monad-purple focus:ring-1 focus:ring-monad-purple transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setChainFilter("all")}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    chainFilter === "all"
                      ? "bg-monad-purple text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setChainFilter("mainnet")}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    chainFilter === "mainnet"
                      ? "bg-monad-purple text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  Mainnet
                </button>
                <button
                  onClick={() => setChainFilter("testnet")}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    chainFilter === "testnet"
                      ? "bg-monad-purple text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  Testnet
                </button>
              </div>

              {/* Chains List */}
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredChains.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No networks found</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-xs text-monad-purple hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredChains.map((chain) => {
                  const isCurrentChain = false; // Chain detection with Push Chain - to be implemented
                  return (
                    <div
                      key={chain.id}
                      draggable
                      onDragStart={(e) => handleChainDragStart(e, chain)}
                      className={`group cursor-grab active:cursor-grabbing rounded-lg border p-3 transition-all ${
                        isCurrentChain
                          ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/15"
                          : "border-white/10 bg-white/5 hover:border-monad-purple/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCurrentChain ? "bg-green-500/20" : "bg-monad-purple/20"
                        }`}>
                          {isCurrentChain ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Network className="h-4 w-4 text-monad-purple" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white truncate">
                              {chain.name}
                            </h3>
                            {isCurrentChain && (
                              <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-500 text-xs font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">ID: {chain.id}</span>
                            {chain.testnet && (
                              <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-xs">
                                Testnet
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ⬅️ Drag to canvas
                    </div>
                  </div>
                  );
                })
                )}
              </div>
              
              {/* Results Count */}
              {searchQuery && filteredChains.length > 0 && (
                <div className="mt-2 text-xs text-center text-gray-500">
                  Found {filteredChains.length} network{filteredChains.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="text-xs text-gray-500">
          💡 <span className="text-gray-400">Tip:</span> Drag items to the canvas and connect them to deploy
        </div>
      </div>
    </div>
  );
}

