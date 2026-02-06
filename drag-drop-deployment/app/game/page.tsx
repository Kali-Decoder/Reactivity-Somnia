"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Gamepad2, RefreshCw, ExternalLink, AlertTriangle, Network } from "lucide-react";
import { ChestCard } from "../components/ChestCard";
import { PlayerStats } from "../components/PlayerStats";
import { ReactivityIndicator } from "../components/ReactivityIndicator";
import { EventsHistory } from "../components/EventsHistory";
import { WalletConnect } from "../components/WalletConnect";
import { somniaTestnet } from "../config/chains";

// Contract ABI
const MAGIC_CHEST_ABI = [
  "function openChest(uint256 chestType) external",
  "function coins(address player) external view returns (uint256)",
  "function hasLegendarySword(address player) external view returns (bool)",
  "event ChestOpened(address indexed player, uint256 chestType)",
  "event Reacted(address player, uint256 chestType)"
];

// Chest types
const CHEST_TYPES = {
  COMMON: 1,
  RARE: 2,
  LEGENDARY: 3,
};

// Contract address - UPDATE THIS with your deployed contract
const CONTRACT_ADDRESS = "0xa4D7312A3e178C34079678f47070a6f5027A2Fdf";
export default function GamePage() {
  // State management
  const [account, setAccount] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [coins, setCoins] = useState(0);
  const [hasLegendarySword, setHasLegendarySword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpening, setIsOpening] = useState<string | null>(null);
  const [isProcessingReactivity, setIsProcessingReactivity] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<number | undefined>();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Check wallet connection and network
  useEffect(() => {
    checkConnection();
    checkNetwork();
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Check network periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkNetwork();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch player stats when account changes
  useEffect(() => {
    if (account) {
      fetchPlayerStats();
    }
  }, [account]);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ 
          method: "eth_accounts" 
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setAccount("");
      setIsConnected(false);
    }
    checkNetwork();
  };

  const handleChainChanged = () => {
    checkNetwork();
    // Reload after a short delay to ensure state is updated
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const checkNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
        const chainIdNumber = parseInt(chainId, 16);
        setCurrentChainId(chainIdNumber);
      } catch (error) {
        console.error("Error checking network:", error);
        setCurrentChainId(null);
      }
    } else {
      setCurrentChainId(null);
    }
  };

  const switchToSomniaTestnet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Please install MetaMask or another Web3 wallet!");
      return;
    }

    try {
      setIsSwitchingNetwork(true);
      const chainIdHex = `0x${somniaTestnet.id.toString(16)}`;

      try {
        // Try to switch to Somnia Testnet
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: somniaTestnet.name,
                nativeCurrency: somniaTestnet.nativeCurrency,
                rpcUrls: somniaTestnet.rpcUrls.default.http,
                blockExplorerUrls: somniaTestnet.blockExplorers?.default
                  ? [somniaTestnet.blockExplorers.default.url]
                  : undefined,
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // Wait a moment for the switch to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
      checkNetwork();
    } catch (error: any) {
      console.error("Error switching network:", error);
      showNotification("error", error.message || "Failed to switch network");
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const isCorrectNetwork = currentChainId === somniaTestnet.id;

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        
        // Check if on correct network
        const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
        if (parseInt(chainId, 16) !== somniaTestnet.id) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${somniaTestnet.id.toString(16)}` }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${somniaTestnet.id.toString(16)}`,
                    chainName: somniaTestnet.name,
                    nativeCurrency: somniaTestnet.nativeCurrency,
                    rpcUrls: somniaTestnet.rpcUrls.default.http,
                    blockExplorerUrls: somniaTestnet.blockExplorers?.default 
                      ? [somniaTestnet.blockExplorers.default.url] 
                      : undefined,
                  },
                ],
              });
            }
          }
        }
        
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet!");
    }
  };

  const fetchPlayerStats = async () => {
    if (!account) return;
    
    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // Verify contract exists
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        console.error("Contract not found at address:", CONTRACT_ADDRESS);
        showNotification("error", "Contract not found. Please check the contract address.");
        return;
      }
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MAGIC_CHEST_ABI, provider);
      
      // Use try-catch for each call to handle individual errors
      let coinsBalance = 0;
      let hasSword = false;
      
      try {
        const coinsResult = await contract.coins(account);
        coinsBalance = coinsResult !== null && coinsResult !== undefined ? Number(coinsResult) : 0;
      } catch (err: any) {
        console.warn("Error fetching coins:", err);
        // If it's a decoding error, the value is likely 0 (default mapping value)
        if (err.code === "BAD_DATA" || err.message?.includes("decode")) {
          coinsBalance = 0;
        } else {
          throw err;
        }
      }
      
      try {
        const swordResult = await contract.hasLegendarySword(account);
        hasSword = swordResult === true;
      } catch (err: any) {
        console.warn("Error fetching sword status:", err);
        // If it's a decoding error, the value is likely false (default mapping value)
        if (err.code === "BAD_DATA" || err.message?.includes("decode")) {
          hasSword = false;
        } else {
          throw err;
        }
      }
      
      setCoins(coinsBalance);
      setHasLegendarySword(hasSword);
      setLastUpdate(Date.now());
    } catch (error: any) {
      console.error("Error fetching player stats:", error);
      showNotification("error", error.message || "Failed to fetch player stats");
    } finally {
      setIsLoading(false);
    }
  };

  const openChest = async (chestType: keyof typeof CHEST_TYPES) => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first!");
      return;
    }

    // Check if on correct network
    if (!isCorrectNetwork) {
      showNotification("error", "Please switch to Somnia Testnet to open chests!");
      return;
    }

    try {
      setIsOpening(chestType);
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MAGIC_CHEST_ABI, signer);

      // Record state before opening
      let coinsBefore = 0;
      let hasSwordBefore = false;
      
      try {
        const coinsResult = await contract.coins(account);
        coinsBefore = coinsResult !== null && coinsResult !== undefined ? Number(coinsResult) : 0;
      } catch (err: any) {
        console.warn("Error fetching coins before:", err);
        coinsBefore = 0;
      }
      
      try {
        hasSwordBefore = await contract.hasLegendarySword(account);
      } catch (err: any) {
        console.warn("Error fetching sword before:", err);
        hasSwordBefore = false;
      }

      console.log("📊 State BEFORE opening chest:");
      console.log("  Coins:", coinsBefore);
      console.log("  Has Sword:", hasSwordBefore);

      // Open the chest
      const tx = await contract.openChest(CHEST_TYPES[chestType]);
      setLastTxHash(tx.hash);
      
      console.log("✅ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      await tx.wait();
      console.log("✅ Transaction confirmed!");

      // Start reactivity processing
      setIsProcessingReactivity(true);
      
      // Wait for reactivity to process (10 seconds)
      console.log("⏳ Waiting for on-chain reactivity...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Fetch updated stats - retry a few times in case reactivity is still processing
      let coinsAfter = coinsBefore;
      let hasSwordAfter = hasSwordBefore;
      let retries = 3;
      
      while (retries > 0) {
        try {
          const coinsResult = await contract.coins(account);
          coinsAfter = coinsResult !== null && coinsResult !== undefined ? Number(coinsResult) : coinsBefore;
          
          const swordResult = await contract.hasLegendarySword(account);
          hasSwordAfter = swordResult === true;
          
          // If we got valid results, break
          break;
        } catch (err: any) {
          console.warn(`Error fetching stats after (${retries} retries left):`, err);
          // If it's a decoding error, wait a bit and retry
          if ((err.code === "BAD_DATA" || err.message?.includes("decode")) && retries > 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries--;
          } else {
            // For other errors or last retry, use previous values
            coinsAfter = coinsBefore;
            hasSwordAfter = hasSwordBefore;
            break;
          }
        }
      }

      console.log("📊 State AFTER reactivity:");
      console.log("  Coins:", coinsAfter);
      console.log("  Has Sword:", hasSwordAfter);
      console.log("📈 Changes:");
      console.log("  Coins gained:", coinsAfter - coinsBefore);
      console.log("  Sword obtained:", !hasSwordBefore && hasSwordAfter);

      setCoins(coinsAfter);
      setHasLegendarySword(hasSwordAfter);
      setLastUpdate(Date.now());
      setIsProcessingReactivity(false);

      // Show success notification
      showNotification(
        "success",
        `🎉 ${chestType} chest opened! Check your stats above.`
      );
    } catch (error: any) {
      console.error("Error opening chest:", error);
      setIsProcessingReactivity(false);
      showNotification("error", error.message || "Failed to open chest");
    } finally {
      setIsOpening(null);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    const div = document.createElement("div");
    div.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg backdrop-blur-sm animate-fade-in ${
      type === "success"
        ? "bg-green-500/10 border border-green-500/30 text-green-500"
        : "bg-red-500/10 border border-red-500/30 text-red-500"
    }`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-monad-purple/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Network Warning Banner */}
        {isConnected && !isCorrectNetwork && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-500 mb-1">
                    Wrong Network Detected
                  </h3>
                  <p className="text-xs text-gray-400">
                    Please switch to Somnia Testnet (Chain ID: {somniaTestnet.id}) to use this application.
                    {currentChainId && (
                      <span className="ml-1">Current: Chain ID {currentChainId}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={switchToSomniaTestnet}
                disabled={isSwitchingNetwork}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-500/90 text-black rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Network className={`w-4 h-4 ${isSwitchingNetwork ? "animate-spin" : ""}`} />
                {isSwitchingNetwork ? "Switching..." : "Switch to Somnia Testnet"}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-10 h-10 text-monad-purple" />
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
                Magic Chest Game
              </h1>
            </div>
            
            {/* Wallet Connection */}
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-monad-purple hover:bg-monad-purple/90 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-monad-purple/20"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-card border border-card-border rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-400">Connected</p>
                  <p className="text-sm font-mono text-monad-purple">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={fetchPlayerStats}
                  className="p-3 bg-monad-purple/10 hover:bg-monad-purple/20 text-monad-purple rounded-lg transition-colors"
                  title="Refresh Stats"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-3xl">
            Open chests to earn rewards through Somnia's on-chain reactivity! Common chests give +10 coins, 
            Rare chests give +50 coins, and Legendary chests grant the mighty Legendary Sword ⚔️
          </p>
        </div>

        {/* Network Info */}
        <div className="bg-monad-purple/10 border border-monad-purple/30 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">
                🌐 Somnia Testnet
              </p>
              <p className="text-xs text-gray-400">
                Powered by On-Chain Reactivity
              </p>
            </div>
            <a
              href={`https://shannon-explorer.somnia.network/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-monad-purple hover:text-monad-purple/80 transition-colors"
            >
              <span>View Contract</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {isConnected && (
          <>
            {/* Player Stats */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
                Your Stats
              </h2>
              <PlayerStats
                coins={coins}
                hasLegendarySword={hasLegendarySword}
                isLoading={isLoading}
              />
            </div>

            {/* Reactivity Status */}
            <div className="mb-8">
              <ReactivityIndicator
                isProcessing={isProcessingReactivity}
                lastUpdate={lastUpdate}
              />
            </div>

            {/* Chests Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Choose Your Chest
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ChestCard
                  type="COMMON"
                  reward="+10 Coins"
                  isOpening={isOpening === "COMMON"}
                  onOpen={() => openChest("COMMON")}
                  disabled={!!isOpening}
                />
                <ChestCard
                  type="RARE"
                  reward="+50 Coins"
                  isOpening={isOpening === "RARE"}
                  onOpen={() => openChest("RARE")}
                  disabled={!!isOpening}
                />
                <ChestCard
                  type="LEGENDARY"
                  reward="Legendary Sword ⚔️"
                  isOpening={isOpening === "LEGENDARY"}
                  onOpen={() => openChest("LEGENDARY")}
                  disabled={!!isOpening}
                />
              </div>
            </div>

            {/* Events History */}
            <div className="mb-8">
              <EventsHistory
                contractAddress={CONTRACT_ADDRESS}
                account={account}
                abi={MAGIC_CHEST_ABI}
              />
            </div>

            {/* Last Transaction */}
            {lastTxHash && (
              <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-3 text-white">Last Transaction</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                    <p className="text-sm text-monad-purple truncate font-mono">{lastTxHash}</p>
                  </div>
                  <a
                    href={`https://shannon-explorer.somnia.network/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-monad-purple/10 text-monad-purple rounded-lg hover:bg-monad-purple/20 transition-colors"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </>
        )}

        {/* How It Works Section */}
        <div className="mt-12 bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-3xl mb-2">1️⃣</div>
              <h3 className="font-bold text-white mb-2">Open a Chest</h3>
              <p className="text-gray-400">
                Click on any chest to open it. This emits a ChestOpened event on-chain.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">2️⃣</div>
              <h3 className="font-bold text-white mb-2">Reactivity Processes</h3>
              <p className="text-gray-400">
                Somnia's on-chain reactivity automatically detects the event and triggers the reward logic.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">3️⃣</div>
              <h3 className="font-bold text-white mb-2">Receive Rewards</h3>
              <p className="text-gray-400">
                Your coins or legendary sword are updated automatically without any additional transaction!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p className="mb-2">Made with love by Nikku.Dev 💜 and powered by Somnia On-Chain Reactivity</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.somnia.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-monad-purple hover:text-monad-purple/80 transition-colors"
            >
              Somnia Network
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="https://docs.somnia.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-monad-purple hover:text-monad-purple/80 transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

