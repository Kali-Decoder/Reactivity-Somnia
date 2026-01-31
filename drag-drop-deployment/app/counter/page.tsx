"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  PushUI,
  PushUniversalAccountButton,
  usePushChain,
  usePushChainClient,
  usePushWalletContext,
} from "@pushchain/ui-kit";
import { ethers } from "ethers";
import { UNIVERSAL_COUNTER_ADDRESS, UniversalCounterABI } from "../config/abi_config";
import { Activity } from "lucide-react";
import { TransactionCanvas } from "../components/TransactionCanvas";
import { TransactionDetails } from "../components/TransactionDetails";
import { UniversalFlowCanvas } from "../components/UniversalFlowCanvas";
import { NetworkSwitcher } from "../components/NetworkSwitcher";
import { allChains } from "../config/chains";
import { Chain } from "viem";
// Interface for chain data
export interface ChainData {
  chainHash: string;
  chainName: string;
  totalCount: number;
  uniqueCount: number;
  color: string;
}

// Interface for transactions
interface Transaction {
  id: string;
  hash: string;
  chainName: string;
  chainColor: string;
  timestamp: number;
  caller: string;
  count: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

// Chain colors matching your theme
const PUSH_CHAIN_COLOR = "#876dff";
const ETHEREUM_COLOR = "#627eea";
const SOLANA_COLOR = "#14f195";
const ARBITRUM_COLOR = "#28a0f0";
const BASE_COLOR = "#0052ff";

export default function CounterPage() {
  // Counter state variables
  const [chainData, setChainData] = useState<ChainData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showCanvas, setShowCanvas] = useState(true);
  const [selectedChainId, setSelectedChainId] = useState<number>(42101); // Default to Push Chain

  // Get PushChain context and client
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const { PushChain } = usePushChain();

  // Function to encode transaction data for increment function
  const getTxData = () => {
    if (!pushChainClient) return "0x";

    return PushChain.utils.helpers.encodeTxData({
      abi: UniversalCounterABI as any,
      functionName: "increment",
    });
  };

  // Helper function to get chain name from raw bytes
  const getChainName = (chainHash: string): string => {
    try {
      const hexString = chainHash.startsWith("0x") ? chainHash.slice(2) : chainHash;
      const bytes = ethers.getBytes("0x" + hexString);
      const chainString = ethers.toUtf8String(bytes);

      const chainHumanName = PushChain.utils.chains.getChainName(chainString);

      if (chainHumanName) {
        const chainName = chainHumanName.split("_")[0];
        return chainName.charAt(0).toUpperCase() + chainName.slice(1).toLowerCase();
      } else {
        return "Unknown";
      }
    } catch (error) {
      return "Unknown";
    }
  };

  // Helper function to get chain color
  const getChainColor = (chainHash: string): string => {
    const chainHumanName = getChainName(chainHash);

    if (chainHumanName.toUpperCase().includes("PUSH")) return PUSH_CHAIN_COLOR;
    if (chainHumanName.toUpperCase().includes("ETHEREUM")) return ETHEREUM_COLOR;
    if (chainHumanName.toUpperCase().includes("SOLANA")) return SOLANA_COLOR;
    if (chainHumanName.toUpperCase().includes("ARBITRUM")) return ARBITRUM_COLOR;
    if (chainHumanName.toUpperCase().includes("BASE")) return BASE_COLOR;

    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd"];
    return colors[Math.abs(chainHash.charCodeAt(0)) % colors.length];
  };

  // Function to fetch counter values
  const fetchCounters = async () => {
    try {
      setIsLoading(true);

      const provider = new ethers.JsonRpcProvider("https://evm.donut.rpc.push.org/");
      const contract = new ethers.Contract(
        UNIVERSAL_COUNTER_ADDRESS,
        UniversalCounterABI,
        provider
      );

      // Collect all valid chainHashes
      const chainHashes: string[] = [];
      for (let chainIndex = 0; ; chainIndex++) {
        try {
          const chainHash: string = await contract.chainIds(chainIndex);

          try {
            const hexString = chainHash.startsWith("0x") ? chainHash : `0x${chainHash}`;
            const bytes = ethers.getBytes(hexString);
            const chainString = ethers.toUtf8String(bytes).trim();

            if (!chainString || chainString === ":") {
              continue;
            }
          } catch {
            continue;
          }

          chainHashes.push(chainHash);
        } catch {
          break;
        }
      }

      if (chainHashes.length === 0) {
        setChainData([]);
        return;
      }

      // Fetch counts in parallel
      const newChainData: ChainData[] = await Promise.all(
        chainHashes.map(async (chainHash) => {
          const [totalCountBN, uniqueCountBN] = await Promise.all([
            contract.chainCount(chainHash),
            contract.chainCountUnique(chainHash),
          ]);

          const chainName = getChainName(chainHash);
          const color = getChainColor(chainHash);

          return {
            chainHash,
            chainName,
            totalCount: Number(totalCountBN),
            uniqueCount: Number(uniqueCountBN),
            color,
          };
        })
      );

      setChainData(newChainData);
    } catch (err) {
      console.error("Error fetching counter values:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle network switch
  const handleSwitchNetwork = async (chain: Chain) => {
    try {
      setSelectedChainId(chain.id);
      
      // Switch network in the wallet
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          // Try to switch to the network
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chain.id.toString(16)}` }],
          });
          
          // Show success notification
          const successDiv = document.createElement('div');
          successDiv.className = 'fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-3 rounded-lg backdrop-blur-sm animate-fade-in';
          successDiv.innerHTML = `
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Switched to ${chain.name}</span>
            </div>
          `;
          document.body.appendChild(successDiv);
          setTimeout(() => successDiv.remove(), 3000);
          
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to wallet
          if (switchError.code === 4902) {
            try {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${chain.id.toString(16)}`,
                    chainName: chain.name,
                    nativeCurrency: chain.nativeCurrency,
                    rpcUrls: chain.rpcUrls.default.http,
                    blockExplorerUrls: chain.blockExplorers?.default?.url 
                      ? [chain.blockExplorers.default.url] 
                      : undefined,
                  },
                ],
              });
              
              // Show success notification for adding network
              const successDiv = document.createElement('div');
              successDiv.className = 'fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-3 rounded-lg backdrop-blur-sm animate-fade-in';
              successDiv.innerHTML = `
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Added and switched to ${chain.name}</span>
                </div>
              `;
              document.body.appendChild(successDiv);
              setTimeout(() => successDiv.remove(), 3000);
              
            } catch (addError) {
              console.error('Error adding network:', addError);
              throw addError;
            }
          } else if (switchError.code === 4001) {
            // User rejected the request
            throw new Error('User rejected network switch');
          } else {
            throw switchError;
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      // Show error notification
      if (error.message !== 'User rejected network switch') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 z-50 bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-3 rounded-lg backdrop-blur-sm animate-fade-in';
        errorDiv.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Failed to switch network</span>
          </div>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
      }
    }
  };

  // Handle transaction to increment counter
  const handleIncrement = async () => {
    if (connectionStatus === "connected" && pushChainClient) {
      try {
        setIsLoading(true);
        setIsIncrementing(true);

        const tx = await pushChainClient.universal.sendTransaction({
          to: UNIVERSAL_COUNTER_ADDRESS,
          data: getTxData(),
          value: BigInt(0),
        });

        setTxHash(tx.hash);
        await tx.wait();
        await fetchCounters();

        setIsLoading(false);
      } catch (err) {
        console.error("Transaction error:", err);
        setIsLoading(false);
      } finally {
        setIsIncrementing(false);
      }
    } else {
      alert("Please connect your wallet first");
    }
  };

  const initialFetchDoneRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const FETCH_DEBOUNCE_MS = 1000;

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      fetchCounters();
      initialFetchDoneRef.current = true;
      lastFetchTimeRef.current = Date.now();
    }

    const wsUrl = "wss://evm.ws-testnet-donut-node1.push.org/";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      const subscribeMsg = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_subscribe",
        params: [
          "logs",
          {
            address: UNIVERSAL_COUNTER_ADDRESS,
            topics: [
              "0x3d4a04291c66b06f39a4ecb817875b12b5485a05ec563133a56a905305c48e55",
            ],
          },
        ],
      };
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.method === "eth_subscription" && data.params?.result?.topics) {
          // Extract event data
          const txHash = data.params.result.transactionHash || "0x" + Math.random().toString(16).slice(2);
          const logData = data.params.result.data;
          
          // Decode event data to get chain info
          try {
            const provider = new ethers.JsonRpcProvider("https://evm.donut.rpc.push.org/");
            const iface = new ethers.Interface(UniversalCounterABI);
            const decodedLog = iface.parseLog({
              topics: data.params.result.topics,
              data: logData,
            });

            if (decodedLog) {
              const caller = decodedLog.args.caller;
              const newCount = Number(decodedLog.args.newCount);
              const chainNamespace = decodedLog.args.chainNamespace;
              const chainId = decodedLog.args.chainId;
              
              // Get chain name and color
              const chainString = `${chainNamespace}:${chainId}`;
              const chainName = PushChain?.utils.chains.getChainName(chainString) || chainNamespace;
              const displayName = chainName.split("_")[0].charAt(0).toUpperCase() + chainName.split("_")[0].slice(1).toLowerCase();
              
              // Determine color
              let color = PUSH_CHAIN_COLOR;
              if (displayName.toUpperCase().includes("ETHEREUM")) color = ETHEREUM_COLOR;
              else if (displayName.toUpperCase().includes("SOLANA")) color = SOLANA_COLOR;
              else if (displayName.toUpperCase().includes("ARBITRUM")) color = ARBITRUM_COLOR;
              else if (displayName.toUpperCase().includes("BASE")) color = BASE_COLOR;

              // Add transaction to canvas
              const newTx: Transaction = {
                id: `${txHash}-${Date.now()}`,
                hash: txHash,
                chainName: displayName,
                chainColor: color,
                timestamp: Date.now(),
                caller,
                count: newCount,
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 8 + Math.random() * 8,
                alpha: 1,
              };

              setTransactions((prev) => [...prev, newTx]);
            }
          } catch (decodeErr) {
            console.error("Error decoding event:", decodeErr);
          }

          const now = Date.now();
          if (now - lastFetchTimeRef.current > FETCH_DEBOUNCE_MS) {
            fetchCounters();
            lastFetchTimeRef.current = now;
          }
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [pushChainClient, connectionStatus]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-monad-purple/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
              Universal Counter
            </h1>
            <NetworkSwitcher
              chains={allChains}
              currentChainId={selectedChainId}
              onSwitchNetwork={handleSwitchNetwork}
            />
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
            A cross-chain counter powered by Push Chain. Every chain battles for glory - 
            your clicks count towards your chain's leaderboard, no matter which blockchain you're on.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Wallet Connect Card */}
          <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-sm text-gray-400 mb-3">Connect Wallet</h3>
            <PushUniversalAccountButton />
          </div>

          {/* Increment Card */}
          {connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED && (
            <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-sm text-gray-400 mb-3">Increment Counter</h3>
              <button
                onClick={handleIncrement}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  isLoading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-monad-purple hover:bg-monad-purple/90 text-white hover:shadow-lg hover:shadow-monad-purple/20"
                }`}
              >
                {isLoading ? (isIncrementing ? "Processing..." : "Loading...") : "Increment Counter"}
              </button>
            </div>
          )}
        </div>

        {/* Transaction Info */}
        {txHash && pushChainClient && (
          <div className="bg-card border border-card-border rounded-xl p-4 mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                <p className="text-sm text-monad-purple truncate font-mono">{txHash}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={pushChainClient.explorer.getTransactionUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2 bg-monad-purple/10 text-monad-purple rounded-lg hover:bg-monad-purple/20 transition-colors"
                >
                  View in Explorer
                </a>
                <button
                  onClick={fetchCounters}
                  className="text-sm px-4 py-2 bg-monad-purple/10 text-monad-purple rounded-lg hover:bg-monad-purple/20 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Universal Flow Visualization Canvas */}
        <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-monad-purple" />
              <span className="bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
                Universal Transaction Flow
              </span>
            </h2>
            <button
              onClick={() => setShowCanvas(!showCanvas)}
              className="text-sm px-3 py-1 bg-monad-purple/10 text-monad-purple rounded-lg hover:bg-monad-purple/20 transition-colors"
            >
              {showCanvas ? "Hide" : "Show"}
            </button>
          </div>

          {showCanvas && (
            <div className="bg-black/50 rounded-lg border border-card-border overflow-hidden" style={{ height: "500px" }}>
              <UniversalFlowCanvas
                chainData={chainData}
                latestTransaction={
                  transactions.length > 0
                    ? {
                        chainName: transactions[transactions.length - 1].chainName,
                        count: transactions[transactions.length - 1].count,
                        color: transactions[transactions.length - 1].chainColor,
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
              Universal Leaderboard
            </span>
            <span className="text-sm text-gray-400 font-normal">
              ({chainData.length} {chainData.length === 1 ? "chain" : "chains"})
            </span>
          </h2>

          {isLoading && chainData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-4 border-monad-purple/30 border-t-monad-purple animate-spin"></div>
            </div>
          ) : chainData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No chain data available yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Chain
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Count
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Unique Users
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {chainData
                    .sort((a, b) => b.totalCount - a.totalCount)
                    .map((chain, index) => (
                      <tr
                        key={chain.chainHash}
                        className={`transition-colors ${
                          index === 0
                            ? "bg-monad-purple/5"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="px-4 py-4 text-sm">
                          {index === 0 ? (
                            <span className="text-2xl">🥇</span>
                          ) : index === 1 ? (
                            <span className="text-2xl">🥈</span>
                          ) : index === 2 ? (
                            <span className="text-2xl">🥉</span>
                          ) : (
                            <span className="text-gray-400">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: chain.color }}
                            />
                            <span className="font-medium">{chain.chainName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-bold text-monad-purple text-lg">
                            {chain.totalCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-gray-400">
                          {chain.uniqueCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p className="mb-2">Made with 💜 and powered by Push Chain</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href={`https://donut.push.network/address/${UNIVERSAL_COUNTER_ADDRESS}?tab=contract`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-monad-purple hover:text-monad-purple/80 transition-colors"
            >
              Smart Contract
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="https://push.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-monad-purple hover:text-monad-purple/80 transition-colors"
            >
              Push Protocol
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

