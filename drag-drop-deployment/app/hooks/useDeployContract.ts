"use client";

import { useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { Abi, ContractConstructorArgs } from "viem";
import { useToast } from "./useToast";

interface DeployParams {
  abi: Abi;
  bytecode: `0x${string}`;
  chainId: number;
  args?: ContractConstructorArgs<Abi>;
}

export function useDeployContract() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { showToast } = useToast();

  const deploy = async ({ abi, bytecode, chainId, args = [] }: DeployParams) => {
    if (!walletClient) {
      const errorMsg = "Wallet client not available";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    if (!publicClient) {
      const errorMsg = "Public client not available";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    // Check if the wallet is on the correct chain
    if (walletClient.chain.id !== chainId) {
      const errorMsg = `Please switch to the correct network (Chain ID: ${chainId})`;
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    setIsDeploying(true);
    setError(null);
    setDeployedAddress(null);
    setTransactionHash(null);

    try {
      showToast("Deploying contract...", "info");

      // Deploy the contract
      const hash = await walletClient.deployContract({
        abi,
        bytecode,
        args: args as readonly unknown[],
        account: walletClient.account,
        chain: walletClient.chain,
      });

      setTransactionHash(hash);
      showToast("Transaction submitted! Waiting for confirmation...", "info");

      // Wait for the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });

      if (receipt.contractAddress) {
        setDeployedAddress(receipt.contractAddress);
        showToast("Contract deployed successfully! 🎉", "success");
      } else {
        throw new Error("Contract address not found in receipt");
      }
    } catch (err: any) {
      console.error("Deployment error:", err);
      
      let errorMessage = "Failed to deploy contract";
      
      if (err.message) {
        if (err.message.includes("User rejected")) {
          errorMessage = "Transaction rejected by user";
        } else if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for deployment";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsDeploying(false);
    }
  };

  const reset = () => {
    setIsDeploying(false);
    setDeployedAddress(null);
    setTransactionHash(null);
    setError(null);
  };

  return {
    deploy,
    isDeploying,
    deployedAddress,
    transactionHash,
    error,
    reset,
  };
}

