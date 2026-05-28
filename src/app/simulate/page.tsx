"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Fingerprint, Lock, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SimulatePage() {
  const [scenario, setScenario] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleSimulate = async (e?: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e) e.preventDefault();
    if (!scenario) return;

    setIsGenerating(true);
    // In a real app, we would call the API here.
    // For now, we simulate a delay and redirect.
    setTimeout(() => {
      // Navigate to a generated timeline ID (mocking it for now)
      router.push(`/timeline/sim-${Math.random().toString(36).substring(7)}?q=${encodeURIComponent(scenario)}`);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none" />

      {isGenerating ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 z-10"
        >
          <div className="relative">
            <Fingerprint className="w-20 h-20 text-white animate-pulse" />
            <div className="absolute inset-0 border border-white/50 rounded-full animate-ping opacity-20" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-mono text-gradient uppercase tracking-widest">
              Processing Reality
            </h2>
            <div className="font-mono text-xs text-gray-500 space-y-1 flex flex-col items-center">
              <span className="animate-pulse">Loading Historical Divergence...</span>
              <span className="animate-pulse" style={{ animationDelay: "0.5s" }}>Synthesizing Geopolitical Impacts...</span>
              <span className="animate-pulse" style={{ animationDelay: "1s" }}>Generating Future Trajectories...</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-3xl z-10 glass-panel p-8 md:p-12 rounded-3xl relative"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Terminal className="w-5 h-5" />
              <span className="font-mono text-sm tracking-widest">SCENARIO_INPUT_TERMINAL</span>
            </div>
            <div className="flex items-center gap-2 text-red-500/80 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <Lock className="w-3 h-3" />
              <span className="text-xs font-mono tracking-widest">CLASSIFIED</span>
            </div>
          </div>

          <form onSubmit={handleSimulate} className="flex flex-col gap-8">
            <div className="space-y-4">
              <label className="text-3xl font-medium tracking-tight text-white/90">
                What if...
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (scenario.trim()) {
                      handleSimulate(e);
                    }
                  }
                }}
                placeholder="e.g., dinosaurs survived the asteroid impact, Rome never fell..."
                className="w-full bg-transparent border-b-2 border-white/20 text-2xl md:text-4xl text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-electric-cyan)] transition-colors py-4 resize-none min-h-[120px] font-light leading-relaxed"
                autoFocus
              />
            </div>

            <div className="flex justify-end mt-4">
              <button 
                type="submit"
                disabled={!scenario}
                className="group relative px-8 py-4 glass-panel border border-white/30 text-white font-semibold rounded-2xl overflow-hidden transition-all hover:bg-white/10 hover:shadow-xl hover:shadow-[#00f2fe]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span className="relative z-10 tracking-widest uppercase text-sm">Initialize Sequence</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
