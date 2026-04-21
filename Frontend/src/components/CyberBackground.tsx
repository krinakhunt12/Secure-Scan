
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

function CyberBackground() {
  const particles = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
    })), []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.15] grid-pattern" />
      
      {/* Moving Lines */}
      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ top: '-10%', left: `${Math.random() * 100}%` }}
            animate={{ top: '110%' }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
            className="absolute w-px h-32 bg-linear-to-b from-transparent via-blue-500 to-transparent blur-sm"
          />
        ))}
      </div>

      {/* Radial Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default CyberBackground;
