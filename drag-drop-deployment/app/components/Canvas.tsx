"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ContractTemplate } from "@/app/config/contract_templates";
import { Chain } from "viem";
import { Trash2, Rocket, Loader2, CheckCircle, XCircle, ExternalLink, ZoomIn, ZoomOut, ArrowRightLeft, Plus } from "lucide-react";
import { AddTemplateModal } from "./AddTemplateModal";
import Link from "next/link";

interface CanvasItem {
  id: string;
  type: "template" | "chain";
  data: ContractTemplate | Chain;
  position: { x: number; y: number };
}

interface Connection {
  from: string;
  to: string;
}

interface CanvasProps {
  onAddTemplate: (template: ContractTemplate) => void;
}

export function Canvas({ onAddTemplate }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Deployment states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const reset = () => {
    setIsDeploying(false);
    setDeployedAddress(null);
    setError(null);
    setTransactionHash(null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the connected chain from canvas items
  const getConnectedChain = useCallback(() => {
    if (connections.length === 0) return null;
    
    const connection = connections[0];
    const fromItem = items.find((i) => i.id === connection.from);
    const toItem = items.find((i) => i.id === connection.to);
    
    const chainItem = fromItem?.type === "chain" ? fromItem : toItem?.type === "chain" ? toItem : null;
    return chainItem ? (chainItem.data as Chain) : null;
  }, [connections, items]);

  const connectedChain = getConnectedChain();

  // Handle drop from sidebar
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const templateData = e.dataTransfer.getData("template");
    const chainData = e.dataTransfer.getData("chain");

    if (templateData) {
      const template = JSON.parse(templateData) as ContractTemplate;
      const newItem: CanvasItem = {
        id: `template-${Date.now()}`,
        type: "template",
        data: template,
        position: { x, y },
      };
      setItems((prev) => [...prev, newItem]);
    }

    if (chainData) {
      const chainInfo = JSON.parse(chainData);
      const newItem: CanvasItem = {
        id: `chain-${Date.now()}`,
        type: "chain",
        data: chainInfo,
        position: { x, y },
      };
      setItems((prev) => [...prev, newItem]);
    }
  }, [scale]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle dragging items on canvas
  const handleItemMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingItem(itemId);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingItem || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragOffset.x) / scale;
      const y = (e.clientY - rect.top - dragOffset.y) / scale;

      setItems((prev) =>
        prev.map((item) =>
          item.id === draggingItem ? { ...item, position: { x, y } } : item
        )
      );
    },
    [draggingItem, dragOffset, scale]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingItem(null);
  }, []);

  useEffect(() => {
    if (draggingItem) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingItem, handleMouseMove, handleMouseUp]);

  // Track mouse position for connecting wire
  useEffect(() => {
    const handleCanvasMouseMove = (e: MouseEvent) => {
      if (canvasRef.current && connectingFrom) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / scale,
          y: (e.clientY - rect.top) / scale,
        });
      }
    };

    if (connectingFrom) {
      window.addEventListener("mousemove", handleCanvasMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleCanvasMouseMove);
      };
    }
  }, [connectingFrom, scale]);

  // Handle connections
  const handleConnectClick = (itemId: string) => {
    if (!connectingFrom) {
      setConnectingFrom(itemId);
    } else {
      if (connectingFrom !== itemId) {
        const fromItem = items.find((i) => i.id === connectingFrom);
        const toItem = items.find((i) => i.id === itemId);

        // Ensure we're connecting template to chain or vice versa
        if (fromItem && toItem && fromItem.type !== toItem.type) {
          setConnections((prev) => [...prev, { from: connectingFrom, to: itemId }]);
        }
      }
      setConnectingFrom(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setConnections((prev) =>
      prev.filter((c) => c.from !== itemId && c.to !== itemId)
    );
  };

  const handleDeploy = async () => {
    // Deployment functionality - to be implemented
    alert("Contract deployment functionality coming soon!");
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));

  const handleReset = () => {
    setItems([]);
    setConnections([]);
    reset();
  };

  // Get connection port position (right side of item)
  const getPortPosition = (item: CanvasItem) => {
    return {
      x: item.position.x + 300, // Right edge
      y: item.position.y + 60,  // Middle of item height
    };
  };

  // Calculate connection lines
  const getConnectionLine = (conn: Connection) => {
    const fromItem = items.find((i) => i.id === conn.from);
    const toItem = items.find((i) => i.id === conn.to);
    if (!fromItem || !toItem) return null;

    const fromPort = getPortPosition(fromItem);
    const toPort = getPortPosition(toItem);

    return { fromX: fromPort.x, fromY: fromPort.y, toX: toPort.x, toY: toPort.y };
  };

  // Get connecting wire position (from item to mouse)
  const getConnectingWire = () => {
    if (!connectingFrom) return null;
    
    const fromItem = items.find((i) => i.id === connectingFrom);
    if (!fromItem) return null;

    const fromPort = getPortPosition(fromItem);

    return { fromX: fromPort.x, fromY: fromPort.y, toX: mousePosition.x, toY: mousePosition.y };
  };

  const hasConnection = connections.length > 0;
  const canDeploy = hasConnection && isConnected;

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-monad-purple/30 border-t-monad-purple animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (deployedAddress) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black p-8">
        <div className="max-w-2xl w-full rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-12">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Contract Deployed! 🎉</h3>
            <p className="text-gray-400 mb-6">Your smart contract has been successfully deployed</p>

            <div className="space-y-4">
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

              {transactionHash && (
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:border-monad-purple/50 hover:bg-white/10 transition-all"
                >
                  View on Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <button
                onClick={handleReset}
                className="w-full px-6 py-3 rounded-xl bg-monad-purple text-white font-semibold transition-all hover:shadow-[0_0_30px_-5px_rgba(135,109,255,0.5)] hover:scale-105"
              >
                Create New Deployment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">

      {/* Canvas */}
      <div
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(135,109,255,0.03)_0%,_transparent_100%)]"
        style={{
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
        }}
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(135, 109, 255)" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="rgb(167, 139, 250)" stopOpacity="1"/>
              <stop offset="100%" stopColor="rgb(135, 109, 255)" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
          
          {/* Existing connections */}
          {connections.map((conn, idx) => {
            const line = getConnectionLine(conn);
            if (!line) return null;
            
            // Calculate bezier curve control points
            const dx = line.toX - line.fromX;
            const dy = line.toY - line.fromY;
            const curveStrength = Math.abs(dx) * 0.5;
            const cp1x = line.fromX + curveStrength;
            const cp1y = line.fromY;
            const cp2x = line.toX - curveStrength;
            const cp2y = line.toY;
            
            const pathData = `M ${line.fromX} ${line.fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${line.toX} ${line.toY}`;
            
            return (
              <g key={idx}>
                {/* Outer glow effect - larger */}
                <path
                  d={pathData}
                  stroke="rgb(135, 109, 255)"
                  strokeWidth="16"
                  fill="none"
                  opacity="0.15"
                  filter="url(#glow)"
                />
                {/* Inner glow */}
                <path
                  d={pathData}
                  stroke="rgb(135, 109, 255)"
                  strokeWidth="8"
                  fill="none"
                  opacity="0.3"
                />
                {/* Main line with gradient */}
                <path
                  d={pathData}
                  stroke="url(#wireGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Animated dashed overlay */}
                <path
                  d={pathData}
                  stroke="rgb(167, 139, 250)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="10,10"
                  opacity="0.6"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="20"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Connection dots at endpoints with glow */}
                <circle cx={line.fromX} cy={line.fromY} r="8" fill="rgb(34, 197, 94)" opacity="0.3" />
                <circle cx={line.fromX} cy={line.fromY} r="5" fill="rgb(34, 197, 94)" />
                <circle cx={line.toX} cy={line.toY} r="8" fill="rgb(34, 197, 94)" opacity="0.3" />
                <circle cx={line.toX} cy={line.toY} r="5" fill="rgb(34, 197, 94)" />
              </g>
            );
          })}
          
          {/* Active connecting wire */}
          {connectingFrom && (() => {
            const wire = getConnectingWire();
            if (!wire) return null;
            
            // Calculate bezier curve for active connection
            const dx = wire.toX - wire.fromX;
            const curveStrength = Math.abs(dx) * 0.5;
            const cp1x = wire.fromX + curveStrength;
            const cp1y = wire.fromY;
            const cp2x = wire.toX - curveStrength;
            const cp2y = wire.toY;
            
            const pathData = `M ${wire.fromX} ${wire.fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${wire.toX} ${wire.toY}`;
            
            return (
              <g>
                {/* Outer Glowing effect - very visible */}
                <path
                  d={pathData}
                  stroke="rgb(135, 109, 255)"
                  strokeWidth="20"
                  fill="none"
                  opacity="0.2"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                {/* Inner glow */}
                <path
                  d={pathData}
                  stroke="rgb(135, 109, 255)"
                  strokeWidth="12"
                  fill="none"
                  opacity="0.4"
                  className="animate-pulse"
                />
                {/* Main animated line - thicker */}
                <path
                  d={pathData}
                  stroke="rgb(135, 109, 255)"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="12,6"
                  strokeLinecap="round"
                  opacity="1"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="18"
                    to="0"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Secondary animated overlay */}
                <path
                  d={pathData}
                  stroke="rgb(167, 139, 250)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="8,8"
                  opacity="0.8"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="16"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Connection point at mouse - larger and more visible */}
                <circle
                  cx={wire.toX}
                  cy={wire.toY}
                  r="16"
                  fill="rgb(135, 109, 255)"
                  opacity="0.15"
                  className="animate-pulse"
                />
                <circle
                  cx={wire.toX}
                  cy={wire.toY}
                  r="10"
                  fill="rgb(135, 109, 255)"
                  opacity="0.4"
                  className="animate-pulse"
                />
                <circle
                  cx={wire.toX}
                  cy={wire.toY}
                  r="6"
                  fill="rgb(135, 109, 255)"
                  opacity="1"
                  className="animate-pulse"
                />
              </g>
            );
          })()}
        </svg>

        {/* Canvas Items */}
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {items.map((item) => {
            const isConnected = connections.some(
              (c) => c.from === item.id || c.to === item.id
            );
            const portPosition = getPortPosition(item);
            
            return (
              <div
                key={item.id}
                className={`absolute cursor-move rounded-xl border-2 bg-black/80 backdrop-blur-sm p-4 transition-all ${
                  connectingFrom === item.id
                    ? "border-monad-purple shadow-[0_0_30px_-5px_rgba(135,109,255,0.8)] ring-4 ring-monad-purple/30"
                    : "border-white/20 hover:border-monad-purple/50"
                }`}
                style={{
                  left: item.position.x,
                  top: item.position.y,
                  width: "300px",
                }}
                onMouseDown={(e) => handleItemMouseDown(e, item.id)}
              >
                {/* Left Connection Port (Input) - Visual Only */}
                <div
                  className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 transition-all ${
                    isConnected
                      ? "w-4 h-4 bg-green-500/60"
                      : "w-4 h-4 bg-white/20"
                  } rounded-full border-2 border-black/50 shadow-lg pointer-events-none`}
                />
                
                {/* Right Connection Port (Output) - Interactive */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectClick(item.id);
                  }}
                  className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 transition-all ${
                    connectingFrom === item.id
                      ? "w-6 h-6 bg-monad-purple ring-4 ring-monad-purple/30 scale-110"
                      : isConnected
                        ? "w-5 h-5 bg-green-500 hover:w-6 hover:h-6 hover:ring-4 hover:ring-green-500/30"
                        : "w-5 h-5 bg-white/40 hover:w-6 hover:h-6 hover:bg-monad-purple hover:ring-4 hover:ring-monad-purple/30"
                  } rounded-full border-2 border-black/50 cursor-pointer shadow-lg`}
                  title={connectingFrom === item.id ? "Connecting..." : "Click to connect"}
                >
                  {connectingFrom === item.id && (
                    <div className="absolute inset-0 rounded-full bg-monad-purple animate-ping" />
                  )}
                </button>
              {item.type === "template" ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{(item.data as ContractTemplate).icon}</div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-lg font-bold text-white truncate">
                        {(item.data as ContractTemplate).name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {(item.data as ContractTemplate).description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex-1 text-xs text-gray-500 text-center">
                      Use dot to connect →
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-monad-purple/20">
                      <span className="text-2xl">🔗</span>
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white truncate">
                          {(item.data as any).name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400">Chain ID: {(item.data as any).id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex-1 text-xs text-gray-500 text-center">
                      Use dot to connect →
                    </div>
                  </div>
                </div>
              )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-2">Drag & Drop Canvas</h3>
              <p className="text-gray-400">
                Drag templates and chains from the sidebar to get started
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Deploy Button */}
      {hasConnection && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end">
          {!isConnected ? (
            <div className="px-6 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 backdrop-blur-sm">
              Please connect wallet to deploy
            </div>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={!canDeploy || isDeploying}
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
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-6 right-6 max-w-md p-4 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-500 font-semibold mb-1">Deployment Failed</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {items.length > 0 && !hasConnection && !connectingFrom && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-monad-purple/10 border border-monad-purple/30 text-monad-purple backdrop-blur-sm">
          💡 Click the dot (•) on items to connect them
        </div>
      )}
      
      {/* Connecting Instructions */}
      {connectingFrom && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-monad-purple border border-monad-purple text-white backdrop-blur-sm animate-pulse">
          ⚡ Click the dot on another item to complete the connection
        </div>
      )}

      {/* Add Template Button - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-monad-purple hover:bg-monad-purple/90 text-white text-sm font-medium transition-all shadow-[0_0_15px_-3px_rgba(135,109,255,0.4)] hover:shadow-[0_0_20px_-3px_rgba(135,109,255,0.6)] backdrop-blur-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Template</span>
        </button>
      </div>

      {/* Add Template Modal */}
      <AddTemplateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddTemplate={onAddTemplate}
      />
    </div>
  );
}

