
import React, { useState, useEffect } from 'react';
import { Search, Globe, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanFormProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

function ScanForm({ onScan, isScanning }: ScanFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [shake, setShake] = useState(false);

  // Robust domain validation regex
  const validateUrl = (input: string) => {
    if (!input) return "A domain or URL is required to initiate analysis.";
    
    // Pattern: Optional protocol, followed by valid domain structure (labels separated by dots)
    const pattern = /^(https?:\/\/)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/.*)?$/i;
    
    if (!pattern.test(input)) {
      return "Invalid format. Please enter a valid domain (e.g., example.com).";
    }
    
    return null;
  };

  useEffect(() => {
    if (isDirty) {
      setError(validateUrl(url));
    }
  }, [url, isDirty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(true);
    
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    onScan(url.trim());
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: shake ? [-2, 2, -2, 2, 0] : 0
      }}
      transition={{ 
        x: { duration: 0.4, ease: "easeInOut" }
      }}
      className="mx-auto w-full max-w-3xl px-4"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="group relative flex flex-col gap-2">
          <div className="relative flex items-center transition-all">
            <div className={`absolute left-4 transition-colors ${
              error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-400'
            }`}>
              <Globe size={20} />
            </div>
            
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (!isDirty) setIsDirty(true);
              }}
              placeholder="Enter website URL (e.g. example.com)"
              className={`h-16 w-full rounded-2xl border bg-slate-900/50 pl-12 pr-40 text-lg text-white placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:ring-4 ${
                error 
                  ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/10' 
                  : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10'
              }`}
              disabled={isScanning}
            />

            <div className="absolute right-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isScanning || (isDirty && !!error)}
                className={`relative flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all overflow-hidden
                  ${isScanning || (isDirty && !!error)
                    ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                    : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20'}
                `}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Scan Now</span>
                  </>
                )}
                
                {/* Visual feedback glow */}
                {!isScanning && !error && url && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex items-center gap-2 px-2 text-red-400 text-sm font-medium"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Trust badges context */}
      <div className="mt-6 flex justify-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500"></div> Port Mapping</span>
        <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500"></div> Header Audit</span>
        <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500"></div> SSL Check</span>
      </div>
    </motion.div>
  );
};

export default ScanForm;
