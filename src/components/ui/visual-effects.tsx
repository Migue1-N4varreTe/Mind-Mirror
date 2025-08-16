import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VisualEffectsProps {
  children: React.ReactNode;
  className?: string;
}

export function VisualEffects({ children, className }: VisualEffectsProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <div className="absolute inset-0 pointer-events-none">
        <div className="neural-grid opacity-10" />
      </div>
    </div>
  );
}

interface CellRippleProps {
  x: number;
  y: number;
  color?: string;
  onComplete?: () => void;
}

export function CellRipple({
  x,
  y,
  color = "#00ffff",
  onComplete,
}: CellRippleProps) {
  return (
    <motion.div
      className="absolute rounded-full border-2 pointer-events-none"
      style={{
        left: x - 20,
        top: y - 20,
        borderColor: color,
      }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{
        width: 40,
        height: 40,
        opacity: 0,
        scale: [1, 1.5, 2],
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      onAnimationComplete={onComplete}
    />
  );
}

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  color?: string;
  onComplete?: () => void;
}

export function FloatingText({
  text,
  x,
  y,
  color = "#ffffff",
  onComplete,
}: FloatingTextProps) {
  return (
    <motion.div
      className="absolute font-bold text-lg pointer-events-none z-10"
      style={{
        left: x,
        top: y,
        color: color,
        textShadow: `0 0 10px ${color}`,
      }}
      initial={{ opacity: 1, y: 0 }}
      animate={{
        opacity: 0,
        y: -50,
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
      onAnimationComplete={onComplete}
    >
      {text}
    </motion.div>
  );
}

interface NeuralNetworkProps {
  nodes?: number;
  className?: string;
}

export function NeuralNetwork({ nodes = 12, className }: NeuralNetworkProps) {
  const nodePositions = Array.from({ length: nodes }, (_, i) => ({
    x: Math.cos((i * 2 * Math.PI) / nodes) * 40 + 50,
    y: Math.sin((i * 2 * Math.PI) / nodes) * 40 + 50,
    id: i,
  }));

  return (
    <div className={cn("relative w-24 h-24", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Conexiones */}
        {nodePositions.map((node, i) =>
          nodePositions.slice(i + 1).map((otherNode, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={node.x}
              y1={node.y}
              x2={otherNode.x}
              y2={otherNode.y}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          )),
        )}

        {/* Nodos */}
        {nodePositions.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="2"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 2,
              delay: node.id * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
