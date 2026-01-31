"use client";

import { useState, useEffect } from "react";
import { ContractTemplate } from "@/app/config/contract_templates";
import { FileCode, Network, Rocket, Loader2, CheckCircle, XCircle, ExternalLink, Check } from "lucide-react";
import { useDeployContract } from "@/app/hooks/useDeployContract";
import { useAccount } from "wagmi";
import { Chain } from "viem";

interface DeploymentZoneProps {
  selectedTemplate: ContractTemplate | null;
  selectedChain: Chain | null;
  currentStep: number;
}

export function DeploymentZone({ selectedTemplate, selectedChain, currentStep }: DeploymentZoneProps) {
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();
  const { deploy, isDeploying, deployedAddress, error, reset, transactionHash } = useDeployContract();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeploy = async () => {
    if (!selectedTemplate || !selectedChain || !isConnected) return;

    await deploy({
      abi: selectedTemplate.abi,
      bytecode: selectedTemplate.bytecode as `0x${string}`,
      chainId: selectedChain.id,
      args: [],
    });
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border-2 border-white/10 bg-white/5 p-12 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-monad-purple/30 border-t-monad-purple animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show success state if deployed
  if (deployedAddress) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-12">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Contract Deployed! 🎉</h3>
            <p className="text-gray-400 mb-6">
              Your {selectedTemplate?.name} contract has been successfully deployed
            </p>
            
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Contract Address</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-white font-mono text-sm break-all">{deployedAddress}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(deployedAddress)}
                    className="px-3 py-1 rounded-lg bg-monad-purple/20 text-monad-purple text-sm hover:bg-monad-purple/30 transition-all flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {transactionHash && selectedChain?.blockExplorers?.default && (
                <a
                  href={`${selectedChain.blockExplorers.default.url}/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:border-monad-purple/50 hover:bg-white/10 transition-all"
                >
                  View on Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <button
                onClick={reset}
                className="w-full px-6 py-3 rounded-xl bg-monad-purple text-white font-semibold transition-all hover:shadow-[0_0_30px_-5px_rgba(135,109,255,0.5)] hover:scale-105"
              >
                Deploy Another Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative rounded-2xl border-2 border-white/10 bg-white/5 p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Step 1: Template */}
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              selectedTemplate 
                ? 'bg-monad-purple text-white' 
                : currentStep === 1 
                  ? 'bg-monad-purple/30 text-monad-purple border-2 border-monad-purple' 
                  : 'bg-white/10 text-gray-500'
            }`}>
              {selectedTemplate ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <span className={`text-sm font-medium ${selectedTemplate || currentStep === 1 ? 'text-white' : 'text-gray-500'}`}>
              Template
            </span>
          </div>

          {/* Connector */}
          <div className={`h-0.5 w-16 transition-all ${selectedTemplate ? 'bg-monad-purple' : 'bg-white/10'}`}></div>

          {/* Step 2: Chain */}
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              selectedChain 
                ? 'bg-monad-purple text-white' 
                : currentStep === 2 
                  ? 'bg-monad-purple/30 text-monad-purple border-2 border-monad-purple' 
                  : 'bg-white/10 text-gray-500'
            }`}>
              {selectedChain ? <Check className="h-5 w-5" /> : '2'}
            </div>
            <span className={`text-sm font-medium ${selectedChain || currentStep === 2 ? 'text-white' : 'text-gray-500'}`}>
              Chain
            </span>
          </div>

          {/* Connector */}
          <div className={`h-0.5 w-16 transition-all ${selectedChain ? 'bg-monad-purple' : 'bg-white/10'}`}></div>

          {/* Step 3: Deploy */}
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              currentStep === 3 
                ? 'bg-monad-purple/30 text-monad-purple border-2 border-monad-purple' 
                : 'bg-white/10 text-gray-500'
            }`}>
              3
            </div>
            <span className={`text-sm font-medium ${currentStep === 3 ? 'text-white' : 'text-gray-500'}`}>
              Deploy
            </span>
          </div>
        </div>

        {/* Current Step Display */}
        <div className="space-y-6">
          {/* Template Selection Display */}
          {selectedTemplate && (
            <div className="rounded-xl border border-monad-purple bg-monad-purple/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{selectedTemplate.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{selectedTemplate.name}</h4>
                    <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
                  </div>
                </div>
                <Check className="h-6 w-6 text-monad-purple flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Chain Selection Display */}
          {selectedChain && (
            <div className="rounded-xl border border-monad-purple bg-monad-purple/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-monad-purple/20 flex items-center justify-center">
                    <Network className="h-5 w-5 text-monad-purple" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{selectedChain.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Chain ID: {selectedChain.id}</span>
                      {selectedChain.testnet && (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-xs">
                          Testnet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Check className="h-6 w-6 text-monad-purple flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Deploy Step */}
          {selectedTemplate && selectedChain && currentStep === 3 && (
            <div className="space-y-4 pt-4">
              {!isConnected && (
                <div className="text-center p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                  <p className="text-yellow-500 text-sm">Please connect your wallet to deploy</p>
                </div>
              )}
              
              <div className="flex justify-center">
                <button
                  onClick={handleDeploy}
                  disabled={!isConnected || isDeploying}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-monad-purple text-white font-semibold text-lg transition-all hover:shadow-[0_0_30px_-5px_rgba(135,109,255,0.5)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5" />
                      Deploy Contract
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-500 font-semibold mb-1">Deployment Failed</p>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

