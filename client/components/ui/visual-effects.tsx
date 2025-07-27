import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'glow' | 'explosion' | 'combo';
}

interface VisualEffectsProps {
  effects: Effect[];
  onEffectComplete?: (id: string) => void;
}

interface Effect {
  id: string;
  type: 'explosion' | 'combo' | 'steal' | 'shield' | 'vision' | 'neural';
  position: { x: number; y: number };
  intensity?: number;
  color?: string;
  duration?: number;
}

export const VisualEffects: React.FC<VisualEffectsProps> = ({ effects, onEffectComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create particles for each effect
    effects.forEach(effect => {
      const newParticles = createParticlesForEffect(effect);
      setParticles(prev => [...prev, ...newParticles]);
    });
  }, [effects]);

  useEffect(() => {
    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life + 1,
            vx: particle.vx * 0.98, // Friction
            vy: particle.vy * 0.98,
          }))
          .filter(particle => particle.life < particle.maxLife)
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  const createParticlesForEffect = (effect: Effect): Particle[] => {
    const particles: Particle[] = [];
    const count = effect.intensity || 20;
    
    for (let i = 0; i < count; i++) {
      particles.push({
        id: `${effect.id}-${i}`,
        x: effect.position.x + (Math.random() - 0.5) * 20,
        y: effect.position.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 60 + Math.random() * 60,
        color: effect.color || getEffectColor(effect.type),
        size: 2 + Math.random() * 4,
        type: getParticleType(effect.type)
      });
    }
    
    return particles;
  };

  const getEffectColor = (type: string): string => {
    const colors = {
      explosion: '#ff6b9d',
      combo: '#00f5ff', 
      steal: '#ffd700',
      shield: '#00ff88',
      vision: '#9d4edd',
      neural: '#00d4ff'
    };
    return colors[type as keyof typeof colors] || '#ffffff';
  };

  const getParticleType = (effectType: string): 'spark' | 'glow' | 'explosion' | 'combo' => {
    if (effectType === 'explosion') return 'explosion';
    if (effectType === 'combo') return 'combo';
    return 'spark';
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Static Effects */}
      <AnimatePresence>
        {effects.map(effect => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
            style={{
              left: effect.position.x - 25,
              top: effect.position.y - 25,
              width: 50,
              height: 50,
            }}
            onAnimationComplete={() => onEffectComplete?.(effect.id)}
          >
            <EffectComponent effect={effect} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Particle System */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size * (1 - particle.life / particle.maxLife)}
            fill={particle.color}
            opacity={1 - particle.life / particle.maxLife}
            className={getParticleClassName(particle.type)}
          />
        ))}
      </svg>
    </div>
  );
};

const EffectComponent: React.FC<{ effect: Effect }> = ({ effect }) => {
  switch (effect.type) {
    case 'explosion':
      return (
        <div className="w-full h-full">
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-r from-neon-pink to-red-500"
            animate={{
              scale: [0, 2, 0],
              opacity: [1, 0.5, 0],
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 w-full h-full rounded-full border-2 border-neon-pink"
            animate={{
              scale: [0, 3],
              opacity: [1, 0],
            }}
            transition={{ duration: 0.7, delay: 0.1 }}
          />
        </div>
      );

    case 'combo':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            className="text-neon-cyan font-bold text-lg"
            animate={{
              y: [-10, -30],
              opacity: [1, 0],
              scale: [1, 1.5],
            }}
            transition={{ duration: 1 }}
          >
            COMBO!
          </motion.div>
          <motion.div
            className="absolute inset-0 w-full h-full border-2 border-neon-cyan rounded-lg"
            animate={{
              scale: [1, 2],
              opacity: [1, 0],
            }}
            transition={{ duration: 0.8 }}
          />
        </div>
      );

    case 'steal':
      return (
        <motion.div
          className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          animate={{
            scale: [0, 1.5, 0.5, 1.5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 1 }}
        />
      );

    case 'shield':
      return (
        <motion.div
          className="w-full h-full border-4 border-neon-green rounded-full"
          animate={{
            scale: [0, 1.2],
            opacity: [0.8, 0],
          }}
          transition={{ duration: 1.5 }}
        />
      );

    case 'vision':
      return (
        <div className="w-full h-full">
          <motion.div
            className="w-full h-full bg-gradient-to-r from-neon-purple to-quantum-violet rounded-full"
            animate={{
              scale: [0, 2],
              opacity: [0.7, 0],
            }}
            transition={{ duration: 2 }}
          />
          <motion.div
            className="absolute inset-0 w-4 h-4 bg-neon-purple rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 0],
            }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </div>
      );

    case 'neural':
      return (
        <div className="w-full h-full">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-8 bg-neon-cyan"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: '0 4px',
                transform: `rotate(${i * 45}deg)`,
              }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            />
          ))}
        </div>
      );

    default:
      return null;
  }
};

const getParticleClassName = (type: string): string => {
  const classes = {
    spark: 'animate-pulse',
    glow: 'filter blur-sm',
    explosion: 'animate-bounce',
    combo: 'animate-spin'
  };
  return classes[type as keyof typeof classes] || '';
};

// Ripple effect for cell clicks
export const CellRipple: React.FC<{ 
  position: { x: number; y: number }; 
  color: string;
  onComplete?: () => void;
}> = ({ position, color, onComplete }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x - 25,
        top: position.y - 25,
        width: 50,
        height: 50,
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={onComplete}
    >
      <div
        className="w-full h-full rounded-full border-2"
        style={{ borderColor: color }}
      />
    </motion.div>
  );
};

// Floating text component
export const FloatingText: React.FC<{
  text: string;
  position: { x: number; y: number };
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  onComplete?: () => void;
}> = ({ text, position, color = '#00f5ff', size = 'md', onComplete }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg', 
    lg: 'text-2xl'
  };

  return (
    <motion.div
      className={`absolute pointer-events-none font-bold ${sizeClasses[size]}`}
      style={{
        left: position.x,
        top: position.y,
        color: color,
        textShadow: `0 0 10px ${color}`,
      }}
      initial={{ y: 0, opacity: 1, scale: 0.5 }}
      animate={{ y: -50, opacity: 0, scale: 1 }}
      transition={{ duration: 1.5 }}
      onAnimationComplete={onComplete}
    >
      {text}
    </motion.div>
  );
};

// Neural network background effect
export const NeuralNetwork: React.FC<{ intensity?: number }> = ({ intensity = 0.5 }) => {
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; connections: number[] }>>([]);

  useEffect(() => {
    // Generate random neural nodes
    const newNodes = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      connections: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        Math.floor(Math.random() * 20)
      ).filter(c => c !== i)
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full">
        {/* Connections */}
        {nodes.map((node, i) =>
          node.connections.map(connectionIndex => {
            const targetNode = nodes[connectionIndex];
            if (!targetNode) return null;
            
            return (
              <motion.line
                key={`${i}-${connectionIndex}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${targetNode.x}%`}
                y2={`${targetNode.y}%`}
                stroke="url(#neural-gradient)"
                strokeWidth="1"
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            );
          })
        )}
        
        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="2"
            fill="#00f5ff"
            animate={{
              r: [2, 4, 2],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#9d4edd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
