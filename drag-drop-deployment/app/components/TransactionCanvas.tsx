"use client";

import React, { useRef, useEffect, useState } from "react";

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

interface TransactionCanvasProps {
  transactions: Transaction[];
  onTransactionClick?: (tx: Transaction) => void;
}

export function TransactionCanvas({ transactions, onTransactionClick }: TransactionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTx, setHoveredTx] = useState<Transaction | null>(null);
  const animationFrameRef = useRef<number>();
  const transactionsRef = useRef<Transaction[]>([]);

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

    // Initialize transaction positions if new
    transactions.forEach((tx) => {
      const existing = transactionsRef.current.find((t) => t.id === tx.id);
      if (!existing) {
        // New transaction - spawn from random edge
        const edge = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        switch (edge) {
          case 0: // Top
            x = Math.random() * canvas.width;
            y = 0;
            break;
          case 1: // Right
            x = canvas.width;
            y = Math.random() * canvas.height;
            break;
          case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height;
            break;
          case 3: // Left
            x = 0;
            y = Math.random() * canvas.height;
            break;
        }

        transactionsRef.current.push({
          ...tx,
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 8 + Math.random() * 8,
          alpha: 1,
        });
      }
    });

    // Remove old transactions (fade out after 30 seconds)
    const now = Date.now();
    transactionsRef.current = transactionsRef.current.filter(
      (tx) => now - tx.timestamp < 30000
    );

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw each transaction
      transactionsRef.current.forEach((tx) => {
        // Update position
        tx.x += tx.vx;
        tx.y += tx.vy;

        // Bounce off edges
        if (tx.x <= tx.radius || tx.x >= canvas.width - tx.radius) {
          tx.vx *= -1;
          tx.x = Math.max(tx.radius, Math.min(canvas.width - tx.radius, tx.x));
        }
        if (tx.y <= tx.radius || tx.y >= canvas.height - tx.radius) {
          tx.vy *= -1;
          tx.y = Math.max(tx.radius, Math.min(canvas.height - tx.radius, tx.y));
        }

        // Fade out old transactions
        const age = now - tx.timestamp;
        if (age > 25000) {
          tx.alpha = 1 - (age - 25000) / 5000;
        }

        // Draw glow effect
        const gradient = ctx.createRadialGradient(tx.x, tx.y, 0, tx.x, tx.y, tx.radius * 3);
        gradient.addColorStop(0, `${tx.chainColor}40`);
        gradient.addColorStop(1, `${tx.chainColor}00`);
        ctx.fillStyle = gradient;
        ctx.fillRect(
          tx.x - tx.radius * 3,
          tx.y - tx.radius * 3,
          tx.radius * 6,
          tx.radius * 6
        );

        // Draw transaction circle
        ctx.beginPath();
        ctx.arc(tx.x, tx.y, tx.radius, 0, Math.PI * 2);
        ctx.fillStyle = tx.chainColor + Math.floor(tx.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Draw ring
        ctx.beginPath();
        ctx.arc(tx.x, tx.y, tx.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = tx.chainColor + Math.floor(tx.alpha * 128).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw chain initial
        ctx.fillStyle = `rgba(255, 255, 255, ${tx.alpha})`;
        ctx.font = `bold ${tx.radius}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tx.chainName[0].toUpperCase(), tx.x, tx.y);
      });

      // Draw connections between nearby transactions
      for (let i = 0; i < transactionsRef.current.length; i++) {
        for (let j = i + 1; j < transactionsRef.current.length; j++) {
          const tx1 = transactionsRef.current[i];
          const tx2 = transactionsRef.current[j];
          const dx = tx2.x - tx1.x;
          const dy = tx2.y - tx1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const alpha = Math.min(tx1.alpha, tx2.alpha) * (1 - distance / 150) * 0.3;
            ctx.beginPath();
            ctx.moveTo(tx1.x, tx1.y);
            ctx.lineTo(tx2.x, tx2.y);
            ctx.strokeStyle = `rgba(135, 109, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [transactions]);

  // Handle mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered transaction
    const hovered = transactionsRef.current.find((tx) => {
      const dx = x - tx.x;
      const dy = y - tx.y;
      return Math.sqrt(dx * dx + dy * dy) <= tx.radius;
    });

    setHoveredTx(hovered || null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = transactionsRef.current.find((tx) => {
      const dx = x - tx.x;
      const dy = y - tx.y;
      return Math.sqrt(dx * dx + dy * dy) <= tx.radius;
    });

    if (clicked && onTransactionClick) {
      onTransactionClick(clicked);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="absolute inset-0 cursor-pointer"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Hover tooltip */}
      {hoveredTx && (
        <div
          className="absolute pointer-events-none z-10 bg-card border border-card-border rounded-lg p-3 backdrop-blur-sm shadow-xl"
          style={{
            left: hoveredTx.x + 20,
            top: hoveredTx.y - 50,
            transform: "translate(0, -50%)",
          }}
        >
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hoveredTx.chainColor }}
              />
              <span className="font-bold text-white">{hoveredTx.chainName}</span>
            </div>
            <div className="text-gray-400 font-mono">
              Count: {hoveredTx.count}
            </div>
            <div className="text-gray-400 font-mono text-[10px]">
              {hoveredTx.hash.slice(0, 10)}...{hoveredTx.hash.slice(-8)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function addTransaction(
  hash: string,
  chainName: string,
  chainColor: string,
  caller: string,
  count: number
): Transaction {
  return {
    id: `${hash}-${Date.now()}`,
    hash,
    chainName,
    chainColor,
    timestamp: Date.now(),
    caller,
    count,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    alpha: 1,
  };
}

