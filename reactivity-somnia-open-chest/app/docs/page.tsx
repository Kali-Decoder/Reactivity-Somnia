"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Zap, 
  Code, 
  GitBranch, 
  Clock, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Home,
  FileCode,
  Layers,
  Activity,
  Gamepad2
} from "lucide-react";

export default function DocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-monad-purple/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-monad-purple" />
              <span className="text-lg font-bold bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
                Magic Chest Game
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-t-lg transition-colors"
              >
                Game
              </Link>
              <Link
                href="/docs"
                className="px-4 py-2 text-sm font-medium text-white bg-monad-purple/20 border-b-2 border-monad-purple rounded-t-lg"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-monad-purple via-purple-400 to-pink-400 bg-clip-text text-transparent">
            How On-Chain Reactivity Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            A complete guide to understanding the Magic Chest Game and Somnia's revolutionary On-Chain Reactivity feature
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">1</div>
              <div className="text-sm text-gray-400">Transaction from User</div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-6">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">~10s</div>
              <div className="text-sm text-gray-400">Reactivity Processing</div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-6">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">Auto</div>
              <div className="text-sm text-gray-400">Reward Distribution</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-card-border rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-white">On This Page</h3>
              <nav className="space-y-2">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "flow", label: "The Flow", icon: GitBranch },
                  { id: "steps", label: "Step by Step", icon: Layers },
                  { id: "code", label: "Code Examples", icon: Code },
                  { id: "resources", label: "Resources", icon: ExternalLink },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-monad-purple transition-colors py-1"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-card-border">
                <h4 className="text-sm font-semibold mb-3 text-white">External Docs</h4>
                <a
                  href="https://github.com/yourrepo/docs/HOW-IT-WORKS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-monad-purple transition-colors"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Complete Technical Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Section */}
            <section id="overview" className="bg-card border border-card-border rounded-xl p-8">
              <h3 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-monad-purple" />
                What is On-Chain Reactivity?
              </h3>
              
              <div className="space-y-6 text-gray-300">
                <p className="text-lg leading-relaxed">
                  On-Chain Reactivity is Somnia's revolutionary feature that allows smart contracts to automatically respond to blockchain events <strong className="text-white">without requiring additional user transactions</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  {/* Traditional Approach */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                      ❌ Traditional Approach
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                        <span>User emits event (pays gas)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                        <span>Off-chain bot detects event</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                        <span>Backend processes logic</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                        <span>Bot sends new TX (pays gas)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</div>
                        <span>State updated</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-500/30 text-xs text-gray-400">
                      ⚠️ Requires off-chain infrastructure, 2 transactions, higher costs
                    </div>
                  </div>

                  {/* Somnia Reactivity */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                      ✅ Somnia Reactivity
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                        <span>User emits event (pays gas)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                        <span>Validator auto-detects event</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                        <span>Validator executes reactive logic</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                        <span>State updated automatically</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-500/30 text-xs text-gray-400">
                      ✨ No off-chain infra, 1 user transaction, validator pays for reactive logic
                    </div>
                  </div>
                </div>

                <div className="bg-monad-purple/10 border border-monad-purple/30 rounded-lg p-6">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-monad-purple">•</span>
                      <span><strong className="text-white">Cost Efficient:</strong> Users only pay for their action, not the reactive logic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-monad-purple">•</span>
                      <span><strong className="text-white">Trustless:</strong> Everything executes on-chain via validators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-monad-purple">•</span>
                      <span><strong className="text-white">Simple:</strong> No off-chain infrastructure or backends needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-monad-purple">•</span>
                      <span><strong className="text-white">Fast:</strong> Reactions typically execute within 5-15 seconds</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Flow Diagram Section */}
            <section id="flow" className="bg-card border border-card-border rounded-xl p-8">
              <h3 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-monad-purple" />
                The Complete Flow
              </h3>

              <div className="bg-black/50 border border-monad-purple/30 rounded-lg p-6 overflow-x-auto">
                <div className="space-y-4 min-w-[600px]">
                  {/* User Action */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-right text-sm font-semibold text-gray-400">User Action</div>
                    <ArrowRight className="w-5 h-5 text-monad-purple" />
                    <div className="flex-1 bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                      <div className="text-white font-semibold">Click "Open Chest"</div>
                      <div className="text-xs text-gray-400 mt-1">User initiates action in UI</div>
                    </div>
                  </div>

                  {/* Transaction */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-right text-sm font-semibold text-gray-400">Transaction</div>
                    <ArrowRight className="w-5 h-5 text-monad-purple" />
                    <div className="flex-1 bg-purple-500/20 border border-purple-500/50 rounded-lg p-3">
                      <div className="text-white font-semibold">contract.openChest(type)</div>
                      <div className="text-xs text-gray-400 mt-1">Emits ChestOpened event • User pays gas</div>
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-right text-sm font-semibold text-gray-400">Confirmation</div>
                    <ArrowRight className="w-5 h-5 text-monad-purple" />
                    <div className="flex-1 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                      <div className="text-white font-semibold">Transaction Mined</div>
                      <div className="text-xs text-gray-400 mt-1">Event recorded on-chain • ~2-5 seconds</div>
                    </div>
                  </div>

                  {/* Reactivity Detection */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-right text-sm font-semibold text-gray-400">Auto-Detect</div>
                    <ArrowRight className="w-5 h-5 text-monad-purple" />
                    <div className="flex-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                      <div className="text-white font-semibold">Validator Detects Event</div>
                      <div className="text-xs text-gray-400 mt-1">Subscription matches event signature • Automatic</div>
                    </div>
                  </div>

                  {/* Reactive Execution */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-right text-sm font-semibold text-gray-400">Execution</div>
                    <ArrowRight className="w-5 h-5 text-monad-purple" />
                    <div className="flex-1 bg-orange-500/20 border border-orange-500/50 rounded-lg p-3">
                      <div className="text-white font-semibold">_onEvent() Executes</div>
                      <div className="text-xs text-gray-400 mt-1">Validator calls function • Grants rewards • Validator pays gas</div>
                    </div>
                  </div>

                  {/* Frontend Update */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-right text-sm font-semibold text-gray-400">UI Update</div>
                    <ArrowRight className="w-5 h-5 text-monad-purple" />
                    <div className="flex-1 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                      <div className="text-white font-semibold">State Updated & Displayed</div>
                      <div className="text-xs text-gray-400 mt-1">Frontend polls contract • Displays new coins/rewards</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-monad-purple/5 border border-monad-purple/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-monad-purple flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <strong className="text-white">Total Time:</strong> Approximately 15-20 seconds from clicking the button to seeing rewards in your account. The majority of this time is waiting for reactivity to process (10 seconds) and blockchain confirmations.
                  </div>
                </div>
              </div>
            </section>

            {/* Step by Step Section */}
            <section id="steps" className="bg-card border border-card-border rounded-xl p-8">
              <h3 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <Layers className="w-8 h-8 text-monad-purple" />
                Step by Step: Opening a Chest
              </h3>

              <div className="space-y-4">
                {[
                  {
                    title: "User Clicks Button",
                    description: "You click 'Open Common Chest' in the UI, triggering the openChest() function",
                    tech: "React onClick event handler",
                    duration: "Instant"
                  },
                  {
                    title: "Validation",
                    description: "App checks wallet connection and network. Shows error if not on Somnia Testnet",
                    tech: "Ethers.js provider check",
                    duration: "< 1 second"
                  },
                  {
                    title: "Read State Before",
                    description: "Frontend reads your current coins and sword status from the contract",
                    tech: "contract.coins(address) view call",
                    duration: "~1 second"
                  },
                  {
                    title: "Send Transaction",
                    description: "MetaMask popup appears. You approve the transaction to open the chest",
                    tech: "contract.openChest(1) transaction",
                    duration: "2-5 seconds (user approval)"
                  },
                  {
                    title: "Wait for Confirmation",
                    description: "Transaction is broadcasted and miners include it in a block. ChestOpened event is emitted",
                    tech: "tx.wait() confirmation",
                    duration: "2-5 seconds"
                  },
                  {
                    title: "Reactivity Processing",
                    description: "Validators detect the ChestOpened event and automatically call _onEvent() to grant rewards",
                    tech: "Validator transaction from 0x0100",
                    duration: "~10 seconds"
                  },
                  {
                    title: "Poll State After",
                    description: "Frontend reads your new coin balance. Retries up to 3 times if needed",
                    tech: "contract.coins(address) with retry logic",
                    duration: "2-6 seconds"
                  },
                  {
                    title: "Update UI",
                    description: "Your coin counter updates with animation and success notification appears!",
                    tech: "React setState and CSS animations",
                    duration: "Instant"
                  }
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-monad-purple/20 text-monad-purple border border-monad-purple/50 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 bg-black/50 border border-gray-800 rounded-lg p-4 hover:border-monad-purple/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-white">{step.title}</h4>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{step.duration}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{step.description}</p>
                      <code className="text-xs text-monad-purple bg-monad-purple/10 px-2 py-1 rounded">
                        {step.tech}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Code Examples Section */}
            <section id="code" className="bg-card border border-card-border rounded-xl p-8">
              <h3 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <Code className="w-8 h-8 text-monad-purple" />
                Code Examples
              </h3>

              <div className="space-y-6">
                {/* Example 1 */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-monad-purple/20 text-monad-purple flex items-center justify-center text-sm">1</span>
                    Emitting the Event (User Transaction)
                  </h4>
                  <pre className="bg-black/80 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-300">
{`// User's transaction - emits ChestOpened event
const tx = await contract.openChest(CHEST_TYPES.COMMON);
console.log("Transaction sent:", tx.hash);

// Wait for confirmation
await tx.wait();
console.log("Transaction confirmed!");

// At this point, the event is on-chain but
// rewards haven't been granted yet!`}
                    </code>
                  </pre>
                </div>

                {/* Example 2 */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-monad-purple/20 text-monad-purple flex items-center justify-center text-sm">2</span>
                    Waiting for Reactivity
                  </h4>
                  <pre className="bg-black/80 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-300">
{`// Show processing indicator
setIsProcessingReactivity(true);

// Wait for validators to detect and process event
await new Promise(resolve => setTimeout(resolve, 10000));

// During this time, validators execute _onEvent()
// which grants the rewards automatically!`}
                    </code>
                  </pre>
                </div>

                {/* Example 3 */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-monad-purple/20 text-monad-purple flex items-center justify-center text-sm">3</span>
                    Polling State with Retry Logic
                  </h4>
                  <pre className="bg-black/80 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-300">
{`// Read updated state with retry
let coinsAfter = coinsBefore;
let retries = 3;

while (retries > 0) {
  try {
    const result = await contract.coins(account);
    coinsAfter = Number(result);
    
    // If state changed, reactivity worked!
    if (coinsAfter > coinsBefore) {
      console.log("✅ Reactivity executed!");
      break;
    }
    
    // Wait and retry
    await new Promise(r => setTimeout(r, 2000));
    retries--;
  } catch (error) {
    console.warn("Retry failed:", error);
    retries--;
  }
}`}
                    </code>
                  </pre>
                </div>

                {/* Example 4 */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-monad-purple/20 text-monad-purple flex items-center justify-center text-sm">4</span>
                    The Reactive Logic (Smart Contract)
                  </h4>
                  <pre className="bg-black/80 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-300">
{`// This runs automatically when validators detect the event
function _onEvent(
    address emitter,
    bytes32[] calldata eventTopics,
    bytes calldata data
) internal override {
    // Decode event data
    address player = address(uint160(uint256(eventTopics[1])));
    uint256 chestType = abi.decode(data, (uint256));
    
    // Grant rewards automatically!
    if (chestType == COMMON) {
        coins[player] += 10;
    } else if (chestType == RARE) {
        coins[player] += 50;
    } else if (chestType == LEGENDARY) {
        hasLegendarySword[player] = true;
    }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </section>

            {/* Resources Section */}
            <section id="resources" className="bg-card border border-card-border rounded-xl p-8">
              <h3 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <ExternalLink className="w-8 h-8 text-monad-purple" />
                Learn More
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="https://docs.somnia.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-monad-purple/10 border border-monad-purple/30 rounded-lg p-6 hover:bg-monad-purple/20 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white group-hover:text-monad-purple transition-colors">
                      Somnia Documentation
                    </h4>
                    <ExternalLink className="w-5 h-5 text-monad-purple" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Official Somnia Network documentation covering reactivity, smart contracts, and more
                  </p>
                </a>

                <a
                  href="https://github.com/yourrepo/onchain-reactivity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 hover:bg-blue-500/20 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      Hardhat Template
                    </h4>
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Complete smart contract development template for building reactive contracts
                  </p>
                </a>

                <a
                  href="https://shannon-explorer.somnia.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-green-500/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-500/20 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">
                      Block Explorer
                    </h4>
                    <ExternalLink className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    View transactions, blocks, and validator activity on Somnia Testnet
                  </p>
                </a>

                <a
                  href="https://faucet.somnia.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 hover:bg-yellow-500/20 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                      Testnet Faucet
                    </h4>
                    <ExternalLink className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Get free STT tokens for testing on Somnia Testnet
                  </p>
                </a>
              </div>

              <div className="mt-8 bg-black/50 border border-monad-purple/30 rounded-lg p-6">
                <h4 className="font-bold text-white mb-4">Contract Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400 w-32 flex-shrink-0">Contract:</span>
                    <code className="text-monad-purple bg-monad-purple/10 px-2 py-1 rounded">
                      0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400 w-32 flex-shrink-0">Network:</span>
                    <span className="text-white">Somnia Testnet (Chain ID: 50312)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400 w-32 flex-shrink-0">Validator:</span>
                    <code className="text-monad-purple bg-monad-purple/10 px-2 py-1 rounded">
                      0x0000000000000000000000000000000000000100
                    </code>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-monad-purple/20 to-purple-500/20 border border-monad-purple/50 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Try It Yourself?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Experience on-chain reactivity firsthand by opening chests and watching your rewards appear automatically!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-monad-purple hover:bg-monad-purple/90 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-monad-purple/20"
              >
                <span>Open Some Chests</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-card-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">Made with 💜 by Nikku.Dev</p>
            <p>Powered by Somnia Network's On-Chain Reactivity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
