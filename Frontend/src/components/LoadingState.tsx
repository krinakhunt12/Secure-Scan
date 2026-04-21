
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldAlert, Cpu, Network } from 'lucide-react';

const messages = [
  "Analyzing Security Layers...",
  "Intercepting SSL Packets...",
  "Probing DNS Records...",
  "Evaluating Response Headers...",
  "Validating Port Configurations...",
  "Finalizing Risk Score..."
];

function LoadingState() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-8">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center text-blue-400"
        >
          <Cpu size={40} />
        </motion.div>
      </div>

      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl font-heading font-medium text-slate-300"
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm text-slate-500 mt-2">This usually takes less than 10 seconds</p>
      </div>

      <div className="flex gap-4">
        {[ShieldAlert, Network, Loader2].map((Icon, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
            className="text-blue-500/50"
          >
            <Icon size={24} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
