"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChainData } from "../counter/page";

interface UniversalFlowCanvasProps {
  chainData: ChainData[];
  latestTransaction?: {
    chainName: string;
    count: number;
    color: string;
  };
}

interface ChainNode {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  count: number;
  uniqueCount: number;
  isDragging: boolean;
  velocityX: number;
  velocityY: number;
}

export function UniversalFlowCanvas({ chainData, latestTransaction }: UniversalFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<ChainNode[]>([]);
  const animationFrameRef = useRef<number>();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<ChainNode | null>(null);

  // Initialize nodes from chain data
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Create nodes from chain data
    const nodes: ChainNode[] = chainData.map((chain, index) => {
      const angle = (index / chainData.length) * Math.PI * 2;
      const distance = Math.min(canvas.width, canvas.height) * 0.3;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      return {
        id: chain.chainHash,
        name: chain.chainName,
        color: chain.color,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius: 30 + Math.log(chain.totalCount + 1) * 5,
        count: chain.totalCount,
        uniqueCount: chain.uniqueCount,
        isDragging: false,
        velocityX: 0,
        velocityY: 0,
      };
    });

    nodesRef.current = nodes;
  }, [chainData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw center (Universal Counter Contract)
      const centerRadius = 60;
      
      // Center glow
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius * 2);
      centerGradient.addColorStop(0, "rgba(135, 109, 255, 0.3)");
      centerGradient.addColorStop(1, "rgba(135, 109, 255, 0)");
      ctx.fillStyle = centerGradient;
      ctx.fillRect(centerX - centerRadius * 2, centerY - centerRadius * 2, centerRadius * 4, centerRadius * 4);

      // Center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#876dff";
      ctx.fill();
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center text
      ctx.fillStyle = "white";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Universal", centerX, centerY - 10);
      ctx.fillText("Counter", centerX, centerY + 10);

      // Update and draw nodes
      nodesRef.current.forEach((node, index) => {
        // Apply gravity towards center if not dragging
        if (!node.isDragging) {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const targetDistance = Math.min(canvas.width, canvas.height) * 0.3;
          
          if (distance > targetDistance + 10 || distance < targetDistance - 10) {
            const force = (distance - targetDistance) * 0.001;
            node.velocityX += (dx / distance) * force;
            node.velocityY += (dy / distance) * force;
          }

          // Apply damping
          node.velocityX *= 0.95;
          node.velocityY *= 0.95;

          // Update position
          node.x += node.velocityX;
          node.y += node.velocityY;

          // Keep nodes within bounds
          const margin = node.radius;
          node.x = Math.max(margin, Math.min(canvas.width - margin, node.x));
          node.y = Math.max(margin, Math.min(canvas.height - margin, node.y));
        }

        // Draw connection lines to center
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `${node.color}40`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw animated particles along connection
        const particleCount = Math.floor(node.count / 10) || 1;
        for (let i = 0; i < Math.min(particleCount, 5); i++) {
          const progress = ((Date.now() / 1000 + i * 0.3) % 1);
          const particleX = centerX + (node.x - centerX) * progress;
          const particleY = centerY + (node.y - centerY) * progress;
          
          ctx.beginPath();
          ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
        }

        // Draw node glow
        const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 1.5);
        nodeGradient.addColorStop(0, `${node.color}60`);
        nodeGradient.addColorStop(1, `${node.color}00`);
        ctx.fillStyle = nodeGradient;
        ctx.fillRect(
          node.x - node.radius * 1.5,
          node.y - node.radius * 1.5,
          node.radius * 3,
          node.radius * 3
        );

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = node.isDragging ? "white" : `${node.color}cc`;
        ctx.lineWidth = node.isDragging ? 3 : 2;
        ctx.stroke();

        // Draw node label
        ctx.fillStyle = "white";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.name, node.x, node.y - 5);
        
        // Draw count
        ctx.font = "10px monospace";
        ctx.fillText(node.count.toString(), node.x, node.y + 8);
      });

      // Draw stats in corner
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(10, 10, 200, 100);
      ctx.strokeStyle = "#876dff";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 200, 100);

      ctx.fillStyle = "white";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "left";
      ctx.fillText("Universal Stats", 20, 30);
      
      const totalCount = chainData.reduce((sum, c) => sum + c.totalCount, 0);
      const totalUnique = chainData.reduce((sum, c) => sum + c.uniqueCount, 0);
      
      ctx.font = "12px monospace";
      ctx.fillStyle = "#876dff";
      ctx.fillText(`Total Chains: ${chainData.length}`, 20, 50);
      ctx.fillText(`Total Count: ${totalCount}`, 20, 70);
      ctx.fillText(`Unique Users: ${totalUnique}`, 20, 90);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [chainData]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a node
    const clickedNode = nodesRef.current.find((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    if (clickedNode) {
      clickedNode.isDragging = true;
      setDraggedNode(clickedNode.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current = { x, y };

    if (draggedNode) {
      const node = nodesRef.current.find((n) => n.id === draggedNode);
      if (node) {
        node.x = x;
        node.y = y;
        node.velocityX = 0;
        node.velocityY = 0;
      }
    } else {
      // Check for hover
      const hovered = nodesRef.current.find((node) => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) <= node.radius;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    nodesRef.current.forEach((node) => {
      node.isDragging = false;
    });
    setDraggedNode(null);
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Hover tooltip */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none bg-card border border-card-border rounded-lg p-3 shadow-xl"
          style={{
            left: hoveredNode.x + 50,
            top: hoveredNode.y - 30,
          }}
        >
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <span className="font-bold text-white">{hoveredNode.name}</span>
            </div>
            <div className="text-gray-400">
              Total: {hoveredNode.count.toLocaleString()}
            </div>
            <div className="text-gray-400">
              Users: {hoveredNode.uniqueCount.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/70 border border-monad-purple/30 rounded-lg px-4 py-2">
        <p className="text-xs text-gray-400">
          💡 Drag chain nodes to see universal connections
        </p>
      </div>
    </div>
  );
}

