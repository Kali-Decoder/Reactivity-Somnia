"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Clock, User, Package, Zap, ExternalLink, RefreshCw, Filter } from "lucide-react";

interface GameEvent {
  type: "ChestOpened" | "Reacted";
  player: string;
  chestType: number;
  chestTypeName: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

interface EventsHistoryProps {
  contractAddress: string;
  account?: string;
  abi: string[];
}

const CHEST_TYPE_NAMES: { [key: number]: string } = {
  1: "Common",
  2: "Rare",
  3: "Legendary",
};

export function EventsHistory({ contractAddress, account, abi }: EventsHistoryProps) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "ChestOpened" | "Reacted" | "mine">("all");
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!contractAddress || typeof window === "undefined" || !(window as any).ethereum) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      // Fetch events from last 1000 blocks (adjust as needed)
      const blockRange = BigInt(1000);
      const currentBlockBigInt = typeof currentBlock === 'bigint' ? currentBlock : BigInt(currentBlock);
      const fromBlock = currentBlockBigInt > blockRange ? currentBlockBigInt - blockRange : BigInt(0);

      // Fetch ChestOpened events
      const chestOpenedFilter = contract.filters.ChestOpened();
      const chestOpenedEvents = await contract.queryFilter(chestOpenedFilter, fromBlock);

      // Fetch Reacted events
      const reactedFilter = contract.filters.Reacted();
      const reactedEvents = await contract.queryFilter(reactedFilter, fromBlock);

      // Combine and format events
      const allEvents: GameEvent[] = [];

      // Process ChestOpened events
      for (const event of chestOpenedEvents) {
        if ('args' in event && event.args) {
          const block = await provider.getBlock(event.blockNumber);
          const player = event.args.player || event.args[0];
          const chestType = event.args.chestType || event.args[1];
          const chestTypeNum = Number(chestType);
          allEvents.push({
            type: "ChestOpened",
            player: typeof player === 'string' ? player : String(player),
            chestType: chestTypeNum,
            chestTypeName: CHEST_TYPE_NAMES[chestTypeNum] || "Unknown",
            blockNumber: Number(event.blockNumber),
            transactionHash: event.transactionHash,
            timestamp: block?.timestamp ? Number(block.timestamp) * 1000 : Date.now(),
          });
        }
      }

      // Process Reacted events
      for (const event of reactedEvents) {
        if ('args' in event && event.args) {
          const block = await provider.getBlock(event.blockNumber);
          const player = event.args.player || event.args[0];
          const chestType = event.args.chestType || event.args[1];
          const chestTypeNum = Number(chestType);
          allEvents.push({
            type: "Reacted",
            player: typeof player === 'string' ? player : String(player),
            chestType: chestTypeNum,
            chestTypeName: CHEST_TYPE_NAMES[chestTypeNum] || "Unknown",
            blockNumber: Number(event.blockNumber),
            transactionHash: event.transactionHash,
            timestamp: block?.timestamp ? Number(block.timestamp) * 1000 : Date.now(),
          });
        }
      }

      // Sort by timestamp (newest first)
      allEvents.sort((a, b) => b.timestamp - a.timestamp);

      setEvents(allEvents);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [contractAddress, account]);

  const filteredEvents = events.filter((event) => {
    if (filter === "mine" && account) {
      return event.player.toLowerCase() === account.toLowerCase();
    }
    if (filter === "all") return true;
    return event.type === filter;
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getChestTypeColor = (chestType: number) => {
    switch (chestType) {
      case 1:
        return "text-gray-400";
      case 2:
        return "text-blue-400";
      case 3:
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
          Events History
        </h2>
        <button
          onClick={fetchEvents}
          disabled={isLoading}
          className="p-2 bg-monad-purple/10 hover:bg-monad-purple/20 text-monad-purple rounded-lg transition-colors disabled:opacity-50"
          title="Refresh Events"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-monad-purple text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter("ChestOpened")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === "ChestOpened"
              ? "bg-monad-purple text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <Package className="w-4 h-4" />
          Chest Opened
        </button>
        <button
          onClick={() => setFilter("Reacted")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === "Reacted"
              ? "bg-monad-purple text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <Zap className="w-4 h-4" />
          Reactivity
        </button>
        {account && (
          <button
            onClick={() => setFilter("mine")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === "mine"
                ? "bg-monad-purple text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <User className="w-4 h-4" />
            My Events
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No events found</p>
          <p className="text-xs mt-1">Try refreshing or opening a chest!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredEvents.map((event, index) => (
            <div
              key={`${event.transactionHash}-${event.type}-${index}`}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {event.type === "ChestOpened" ? (
                      <Package className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Zap className="w-4 h-4 text-yellow-400" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        event.type === "ChestOpened" ? "text-blue-400" : "text-yellow-400"
                      }`}
                    >
                      {event.type === "ChestOpened" ? "Chest Opened" : "Reactivity Executed"}
                    </span>
                    <span className={`text-sm font-medium ${getChestTypeColor(event.chestType)}`}>
                      {event.chestTypeName} Chest
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-mono">
                        {event.player.toLowerCase() === account?.toLowerCase() ? (
                          <span className="text-monad-purple">You</span>
                        ) : (
                          formatAddress(event.player)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(event.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Block:</span>
                      <span className="font-mono">{event.blockNumber.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://shannon-explorer.somnia.network/tx/${event.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-monad-purple/10 hover:bg-monad-purple/20 text-monad-purple rounded-lg transition-colors flex-shrink-0"
                  title="View on Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-gray-400">
          <span>
            Total Events: <span className="text-white font-semibold">{events.length}</span>
          </span>
          <span>
            ChestOpened:{" "}
            <span className="text-white font-semibold">
              {events.filter((e) => e.type === "ChestOpened").length}
            </span>
          </span>
          <span>
            Reacted:{" "}
            <span className="text-white font-semibold">
              {events.filter((e) => e.type === "Reacted").length}
            </span>
          </span>
          {account && (
            <span>
              Your Events:{" "}
              <span className="text-white font-semibold">
                {events.filter(
                  (e) => e.player.toLowerCase() === account.toLowerCase()
                ).length}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
