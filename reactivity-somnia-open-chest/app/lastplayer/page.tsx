"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { RefreshCw, ExternalLink, AlertTriangle, Network, Timer, Trophy, Coins } from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { WalletConnect } from "../components/WalletConnect";
import { somniaTestnet } from "../config/chains";
import { LAST_PLAYER_GAME_ADDRESS, LastPlayerGameABI } from "../config/last_player_game_config";
import { GameSelector } from "../components/GameSelector";
import { ReactivityIndicator } from "../components/ReactivityIndicator";
import { useToast } from "../hooks/useToast";

export default function LastPlayerGame() {
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { showSuccess, showError } = useToast();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isProcessingReactivity, setIsProcessingReactivity] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<number | undefined>();

  // Game state
  const [lastPlayer, setLastPlayer] = useState<string>("");
  const [lastEntryTime, setLastEntryTime] = useState<number>(0);
  const [roundActive, setRoundActive] = useState<boolean>(false);
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [entryAmount, setEntryAmount] = useState<string>("1");
  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const isCorrectNetwork = chainId === somniaTestnet.id;

  const fetchGameState = useCallback(async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      const code = await provider.getCode(LAST_PLAYER_GAME_ADDRESS);
      if (code === "0x") {
        console.error("Contract not found at address:", LAST_PLAYER_GAME_ADDRESS);
        showError("Contract not found. Please check the contract address.");
        return;
      }

      const contract = new ethers.Contract(LAST_PLAYER_GAME_ADDRESS, LastPlayerGameABI, provider);

      const [
        _entryAmount,
        _roundDuration,
        _lastPlayer,
        _lastEntryTime,
        _roundActive,
        _balance,
      ] = await Promise.all([
        contract.ENTRY_AMOUNT(),
        contract.ROUND_DURATION(),
        contract.lastPlayer(),
        contract.lastEntryTime(),
        contract.roundActive(),
        provider.getBalance(LAST_PLAYER_GAME_ADDRESS),
      ]);

      setEntryAmount(ethers.formatEther(_entryAmount));
      setRoundDuration(Number(_roundDuration));
      setLastPlayer(_lastPlayer);
      setLastEntryTime(Number(_lastEntryTime));
      setRoundActive(_roundActive);
      setContractBalance(ethers.formatEther(_balance));
      setLastUpdate(Date.now());
    } catch (error: any) {
      console.error("Error fetching game state:", error);
      showError(error.message || "Failed to fetch game state");
    } finally {
      setIsLoading(false);
    }
  }, [account, showError]);

  // Fetch game state when account changes
  useEffect(() => {
    if (account && isCorrectNetwork) {
      fetchGameState();
    }
  }, [account, isCorrectNetwork, fetchGameState]);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastEntryTime > 0 && roundActive) {
        const elapsed = Math.floor(Date.now() / 1000) - lastEntryTime;
        const remaining = Math.max(0, roundDuration - elapsed);
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastEntryTime, roundDuration, roundActive]);

  const switchToSomniaTestnet = async () => {
    try {
      await switchChain?.({ chainId: somniaTestnet.id });
    } catch (error: any) {
      console.error("Error switching network:", error);
      showError(error.message || "Failed to switch network");
    }
  };

  const enterGame = async () => {
    if (!isConnected || !account) {
      showError("Please connect your wallet first!");
      return;
    }

    if (!isCorrectNetwork) {
      showError("Please switch to Somnia Testnet!");
      return;
    }

    try {
      setIsEntering(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(LAST_PLAYER_GAME_ADDRESS, LastPlayerGameABI, signer);

      const _entryAmount = await contract.ENTRY_AMOUNT();

      console.log("💰 Entering game with:", ethers.formatEther(_entryAmount), "ETH");

      const tx = await contract.enterGame({ value: _entryAmount });
      setLastTxHash(tx.hash);

      console.log("✅ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      await tx.wait();
      console.log("✅ Transaction confirmed!");

      setIsProcessingReactivity(true);

      console.log("⏳ Waiting for reactivity to process...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      await fetchGameState();
      setIsProcessingReactivity(false);

      showSuccess("🎉 You entered the game! You're now the last player!");
    } catch (error: any) {
      console.error("Error entering game:", error);
      setIsProcessingReactivity(false);
      showError(error.message || "Failed to enter game");
    } finally {
      setIsEntering(false);
    }
  };

  const isCurrentWinner = account?.toLowerCase() === lastPlayer.toLowerCase() && lastPlayer !== ethers.ZeroAddress;
  const canPayoutNow = timeRemaining === 0 && roundActive && lastPlayer !== ethers.ZeroAddress;

  return (
    <div className="min-h-screen bg-black text-white">
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
                    Please switch to Somnia Testnet (Chain ID: {somniaTestnet.id}) to play.
                  </p>
                </div>
              </div>
              <button
                onClick={switchToSomniaTestnet}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-500/90 text-black rounded-lg font-medium transition-all"
              >
                <Network className="w-4 h-4" />
                Switch Network
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent mb-3">
                🏆 Last Player Game
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
                Be the last player to enter! Pay {entryAmount} ETH to become the last player. 
                If no one enters for {roundDuration} seconds, you win the entire pot! 
                Reactivity automatically pays the winner! ⚡
              </p>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <WalletConnect />
              {isConnected && (
                <button
                  onClick={fetchGameState}
                  className="p-3 bg-monad-purple/10 hover:bg-monad-purple/20 text-monad-purple rounded-lg transition-colors"
                  title="Refresh Game State"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Selector */}
        <GameSelector />

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
              href={`https://shannon-explorer.somnia.network/address/${LAST_PLAYER_GAME_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-monad-purple hover:text-monad-purple/80 transition-colors"
            >
              <span>View Contract</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {isConnected && isCorrectNetwork && (
          <>
            {/* Game State */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Prize Pool */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-bold text-white">Prize Pool</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-500">{contractBalance} ETH</p>
                <p className="text-xs text-gray-400 mt-1">Total winnings for last player</p>
              </div>

              {/* Current Winner */}
              <div className={`bg-gradient-to-br rounded-xl p-6 border ${
                isCurrentWinner
                  ? "from-green-500/10 to-emerald-500/10 border-green-500/30"
                  : "from-purple-500/10 to-monad-purple/10 border-purple-500/30"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className={`w-6 h-6 ${isCurrentWinner ? "text-green-500" : "text-purple-500"}`} />
                  <h3 className="text-lg font-bold text-white">Current Winner</h3>
                </div>
                {lastPlayer === ethers.ZeroAddress ? (
                  <p className="text-sm text-gray-400">No player yet</p>
                ) : (
                  <>
                    <p className={`text-sm font-mono ${isCurrentWinner ? "text-green-500" : "text-purple-500"}`}>
                      {lastPlayer.slice(0, 10)}...{lastPlayer.slice(-8)}
                    </p>
                    {isCurrentWinner && (
                      <p className="text-xs text-green-400 mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        That's you!
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Timer */}
              <div className={`bg-gradient-to-br rounded-xl p-6 border ${
                canPayoutNow
                  ? "from-red-500/10 to-pink-500/10 border-red-500/30"
                  : "from-blue-500/10 to-cyan-500/10 border-blue-500/30"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Timer className={`w-6 h-6 ${canPayoutNow ? "text-red-500" : "text-blue-500"}`} />
                  <h3 className="text-lg font-bold text-white">Timer</h3>
                </div>
                {!roundActive ? (
                  <p className="text-sm text-gray-400">Round not active</p>
                ) : lastPlayer === ethers.ZeroAddress ? (
                  <p className="text-sm text-gray-400">Waiting for first player</p>
                ) : (
                  <>
                    <p className={`text-3xl font-bold ${canPayoutNow ? "text-red-500 animate-pulse" : "text-blue-500"}`}>
                      {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {canPayoutNow ? "Winner can be paid!" : "Until winner can be paid"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Reactivity Status */}
            <div className="mb-8">
              <ReactivityIndicator
                isProcessing={isProcessingReactivity}
                lastUpdate={lastUpdate}
              />
            </div>

            {/* Enter Game Button */}
            <div className="mb-8">
              <div className="bg-card border border-card-border rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {isCurrentWinner ? "Defend Your Position!" : "Enter the Game"}
                </h2>
                <p className="text-gray-400 mb-6">
                  {isCurrentWinner
                    ? `You're currently winning! Hold your position for ${Math.ceil(timeRemaining)} more seconds.`
                    : `Pay ${entryAmount} ETH to become the last player and start the timer.`}
                </p>
                <button
                  onClick={enterGame}
                  disabled={isEntering || !roundActive}
                  className="px-8 py-4 bg-monad-purple hover:bg-monad-purple/90 text-white rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-monad-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEntering ? "Entering..." : `Enter Game (${entryAmount} ETH)`}
                </button>
                {!roundActive && (
                  <p className="mt-4 text-sm text-red-400">
                    Round is not active. Please wait for a new round.
                  </p>
                )}
              </div>
            </div>

            {/* Last Transaction */}
            {lastTxHash && (
              <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm mb-8">
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

        {/* How It Works */}
        <div className="mt-12 bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-3xl mb-2">1️⃣</div>
              <h3 className="font-bold text-white mb-2">Enter the Game</h3>
              <p className="text-gray-400">
                Pay {entryAmount} ETH to become the last player. The timer starts counting down from {roundDuration} seconds.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">2️⃣</div>
              <h3 className="font-bold text-white mb-2">Hold Your Position</h3>
              <p className="text-gray-400">
                Other players can enter and take your position. Each new entry resets the timer. Be strategic!
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">3️⃣</div>
              <h3 className="font-bold text-white mb-2">Win Automatically</h3>
              <p className="text-gray-400">
                If you're the last player when someone enters after {roundDuration}s, reactivity automatically sends you the pot! ⚡
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

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastEntryTime > 0 && roundActive) {
        const elapsed = Math.floor(Date.now() / 1000) - lastEntryTime;
        const remaining = Math.max(0, roundDuration - elapsed);
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastEntryTime, roundDuration, roundActive]);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_accounts",
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
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
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

  const fetchGameState = useCallback(async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      const code = await provider.getCode(LAST_PLAYER_GAME_ADDRESS);
      if (code === "0x") {
        console.error("Contract not found at address:", LAST_PLAYER_GAME_ADDRESS);
        showNotification("error", "Contract not found. Please check the contract address.");
        return;
      }

      const contract = new ethers.Contract(LAST_PLAYER_GAME_ADDRESS, LastPlayerGameABI, provider);

      const [
        _entryAmount,
        _roundDuration,
        _lastPlayer,
        _lastEntryTime,
        _roundActive,
        _balance,
      ] = await Promise.all([
        contract.ENTRY_AMOUNT(),
        contract.ROUND_DURATION(),
        contract.lastPlayer(),
        contract.lastEntryTime(),
        contract.roundActive(),
        provider.getBalance(LAST_PLAYER_GAME_ADDRESS),
      ]);

      setEntryAmount(ethers.formatEther(_entryAmount));
      setRoundDuration(Number(_roundDuration));
      setLastPlayer(_lastPlayer);
      setLastEntryTime(Number(_lastEntryTime));
      setRoundActive(_roundActive);
      setContractBalance(ethers.formatEther(_balance));
      setLastUpdate(Date.now());
    } catch (error: any) {
      console.error("Error fetching game state:", error);
      showNotification("error", error.message || "Failed to fetch game state");
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  const enterGame = async () => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!isCorrectNetwork) {
      showNotification("error", "Please switch to Somnia Testnet!");
      return;
    }

    try {
      setIsEntering(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(LAST_PLAYER_GAME_ADDRESS, LastPlayerGameABI, signer);

      const _entryAmount = await contract.ENTRY_AMOUNT();

      console.log("💰 Entering game with:", ethers.formatEther(_entryAmount), "ETH");

      const tx = await contract.enterGame({ value: _entryAmount });
      setLastTxHash(tx.hash);

      console.log("✅ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      await tx.wait();
      console.log("✅ Transaction confirmed!");

      setIsProcessingReactivity(true);

      console.log("⏳ Waiting for reactivity to process...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      await fetchGameState();
      setIsProcessingReactivity(false);

      showNotification("success", "🎉 You entered the game! You're now the last player!");
    } catch (error: any) {
      console.error("Error entering game:", error);
      setIsProcessingReactivity(false);
      showNotification("error", error.message || "Failed to enter game");
    } finally {
      setIsEntering(false);
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

  const isCurrentWinner = account.toLowerCase() === lastPlayer.toLowerCase() && lastPlayer !== ethers.ZeroAddress;
  const canPayoutNow = timeRemaining === 0 && roundActive && lastPlayer !== ethers.ZeroAddress;

  return (
    <div className="min-h-screen bg-black text-white">
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
                    Please switch to Somnia Testnet (Chain ID: {somniaTestnet.id}) to play.
                  </p>
                </div>
              </div>
              <button
                onClick={switchToSomniaTestnet}
                disabled={isSwitchingNetwork}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-500/90 text-black rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Network className={`w-4 h-4 ${isSwitchingNetwork ? "animate-spin" : ""}`} />
                {isSwitchingNetwork ? "Switching..." : "Switch Network"}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent mb-3">
                🏆 Last Player Game
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
                Be the last player to enter! Pay {entryAmount} ETH to become the last player. 
                If no one enters for {roundDuration} seconds, you win the entire pot! 
                Reactivity automatically pays the winner! ⚡
              </p>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="px-6 py-3 bg-monad-purple hover:bg-monad-purple/90 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-monad-purple/20 whitespace-nowrap"
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
                    onClick={fetchGameState}
                    className="p-3 bg-monad-purple/10 hover:bg-monad-purple/20 text-monad-purple rounded-lg transition-colors"
                    title="Refresh Game State"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Selector */}
        <GameSelector />

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
              href={`https://shannon-explorer.somnia.network/address/${LAST_PLAYER_GAME_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-monad-purple hover:text-monad-purple/80 transition-colors"
            >
              <span>View Contract</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {isConnected && isCorrectNetwork && (
          <>
            {/* Game State */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Prize Pool */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-bold text-white">Prize Pool</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-500">{contractBalance} ETH</p>
                <p className="text-xs text-gray-400 mt-1">Total winnings for last player</p>
              </div>

              {/* Current Winner */}
              <div className={`bg-gradient-to-br rounded-xl p-6 border ${
                isCurrentWinner
                  ? "from-green-500/10 to-emerald-500/10 border-green-500/30"
                  : "from-purple-500/10 to-monad-purple/10 border-purple-500/30"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className={`w-6 h-6 ${isCurrentWinner ? "text-green-500" : "text-purple-500"}`} />
                  <h3 className="text-lg font-bold text-white">Current Winner</h3>
                </div>
                {lastPlayer === ethers.ZeroAddress ? (
                  <p className="text-sm text-gray-400">No player yet</p>
                ) : (
                  <>
                    <p className={`text-sm font-mono ${isCurrentWinner ? "text-green-500" : "text-purple-500"}`}>
                      {lastPlayer.slice(0, 10)}...{lastPlayer.slice(-8)}
                    </p>
                    {isCurrentWinner && (
                      <p className="text-xs text-green-400 mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        That's you!
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Timer */}
              <div className={`bg-gradient-to-br rounded-xl p-6 border ${
                canPayoutNow
                  ? "from-red-500/10 to-pink-500/10 border-red-500/30"
                  : "from-blue-500/10 to-cyan-500/10 border-blue-500/30"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Timer className={`w-6 h-6 ${canPayoutNow ? "text-red-500" : "text-blue-500"}`} />
                  <h3 className="text-lg font-bold text-white">Timer</h3>
                </div>
                {!roundActive ? (
                  <p className="text-sm text-gray-400">Round not active</p>
                ) : lastPlayer === ethers.ZeroAddress ? (
                  <p className="text-sm text-gray-400">Waiting for first player</p>
                ) : (
                  <>
                    <p className={`text-3xl font-bold ${canPayoutNow ? "text-red-500 animate-pulse" : "text-blue-500"}`}>
                      {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {canPayoutNow ? "Winner can be paid!" : "Until winner can be paid"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Reactivity Status */}
            <div className="mb-8">
              <ReactivityIndicator
                isProcessing={isProcessingReactivity}
                lastUpdate={lastUpdate}
              />
            </div>

            {/* Enter Game Button */}
            <div className="mb-8">
              <div className="bg-card border border-card-border rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {isCurrentWinner ? "Defend Your Position!" : "Enter the Game"}
                </h2>
                <p className="text-gray-400 mb-6">
                  {isCurrentWinner
                    ? `You're currently winning! Hold your position for ${Math.ceil(timeRemaining)} more seconds.`
                    : `Pay ${entryAmount} ETH to become the last player and start the timer.`}
                </p>
                <button
                  onClick={enterGame}
                  disabled={isEntering || !roundActive}
                  className="px-8 py-4 bg-monad-purple hover:bg-monad-purple/90 text-white rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-monad-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEntering ? "Entering..." : `Enter Game (${entryAmount} ETH)`}
                </button>
                {!roundActive && (
                  <p className="mt-4 text-sm text-red-400">
                    Round is not active. Please wait for a new round.
                  </p>
                )}
              </div>
            </div>

            {/* Last Transaction */}
            {lastTxHash && (
              <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm mb-8">
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

        {/* How It Works */}
        <div className="mt-12 bg-card border border-card-border rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-3xl mb-2">1️⃣</div>
              <h3 className="font-bold text-white mb-2">Enter the Game</h3>
              <p className="text-gray-400">
                Pay {entryAmount} ETH to become the last player. The timer starts counting down from {roundDuration} seconds.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">2️⃣</div>
              <h3 className="font-bold text-white mb-2">Hold Your Position</h3>
              <p className="text-gray-400">
                Other players can enter and take your position. Each new entry resets the timer. Be strategic!
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">3️⃣</div>
              <h3 className="font-bold text-white mb-2">Win Automatically</h3>
              <p className="text-gray-400">
                If you're the last player when someone enters after {roundDuration}s, reactivity automatically sends you the pot! ⚡
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
