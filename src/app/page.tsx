"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { ScrollCanvasAnimation } from "@/components/ScrollCanvasAnimation";
import { WebGLBackground } from "@/components/WebGLBackground";

export default function EnginePortal() {
  const [scenario, setScenario] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIntro, setIsIntro] = useState(true);
  const router = useRouter();
  
  const inputSectionRef = useRef<HTMLDivElement>(null);

  // 4-second intro sequence timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntro(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Lock scrolling during the intro phase
  useEffect(() => {
    if (isIntro) {
      document.documentElement.classList.add("lenis-stopped");
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
    };
  }, [isIntro]);

  const handleSimulate = (e?: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e) e.preventDefault();
    if (!scenario.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      router.push(`/timeline/sim-${Math.random().toString(36).substring(7)}?q=${encodeURIComponent(scenario)}`);
    }, 1500); 
  };

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative w-full bg-[#070708] text-white selection:bg-[#ccff00] selection:text-black">
      
      {/* Top Right Navigation - Fades in after Intro */}
      <motion.nav 
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: isIntro ? 0 : 1, y: isIntro ? -25 : 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full p-6 md:p-12 flex justify-between items-center z-50 pointer-events-none mix-blend-difference"
      >
        <span className="font-display font-black text-2xl tracking-tighter uppercase text-white">PARADOX</span>
        <button 
          onClick={scrollToInput}
          className="pointer-events-auto border border-white/30 px-6 py-2 rounded-full font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors bg-black/20 backdrop-blur-md text-white"
        >
          Express Alternate Thought
        </button>
      </motion.nav>

      {/* Fixed Background Cross-Fader */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden flex items-center justify-center z-0 pointer-events-none">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          
          {/* WebGL Universe Background (Intro - Active for 4 seconds) */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ 
              opacity: isIntro ? 1 : 0,
              visibility: isIntro ? "visible" : "hidden"
            }}
          >
            <WebGLBackground />
          </div>

          {/* Original Frame Sequence Background (Main - Preloaded and active after 4 seconds) */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ 
              opacity: isIntro ? 0 : 1 
            }}
          >
            <ScrollCanvasAnimation />
          </div>

          {/* Vignette and overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070708]/40 via-transparent to-[#070708]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-[#070708]/80" />
        </div>
      </div>

      {/* SEQUENTIAL SNAP SCROLL SECTIONS - Fades in after Intro */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isIntro ? 0 : 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="relative z-10 w-full flex flex-col"
      >
        
        <section className="h-screen w-full flex flex-col items-center justify-center snap-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-20%" }}
            transition={{ duration: 0.8 }}
            className="text-[12vw] md:text-[8vw] font-display font-black tracking-tighter uppercase text-center text-white leading-none drop-shadow-2xl"
          >
            HISTORY IS<br/>NOT A LINE.
          </motion.h1>
        </section>

        <section className="h-screen w-full flex flex-col items-center justify-center snap-center px-4">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-20%" }}
            transition={{ duration: 0.8 }}
            className="text-[12vw] md:text-[8vw] font-display font-black tracking-tighter uppercase text-center hollow-text leading-none drop-shadow-2xl"
          >
            IT IS A<br/>VARIABLE.
          </motion.h1>
        </section>

        <section className="h-screen w-full flex flex-col items-center justify-center snap-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-20%" }}
            transition={{ duration: 0.8 }}
            className="text-[12vw] md:text-[8vw] font-display font-black tracking-tighter uppercase text-center text-white leading-none drop-shadow-2xl"
          >
            BEND<br/>TIME.
          </motion.h1>
        </section>

        <section className="h-screen w-full flex flex-col items-center justify-center snap-center px-4">
          <motion.h1 
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-20%" }}
            transition={{ duration: 0.8 }}
            className="text-[12vw] md:text-[8vw] font-display font-black tracking-tighter uppercase text-center hollow-text leading-none drop-shadow-2xl"
          >
            REWRITE<br/>REALITY.
          </motion.h1>
        </section>

        <section className="h-screen w-full flex flex-col items-center justify-center snap-center px-4">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1.1 }}
            viewport={{ margin: "-20%" }}
            transition={{ duration: 1 }}
            className="text-[15vw] md:text-[12vw] font-display font-black tracking-tighter uppercase text-center text-[#ccff00] leading-none drop-shadow-2xl"
          >
            WHAT IF?
          </motion.h1>
        </section>

        {/* FINALLY THE THOUGHT BOX */}
        <section ref={inputSectionRef} className="min-h-screen w-full flex flex-col items-center justify-center p-6 snap-center">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-6 bg-black/80 backdrop-blur-md p-12 border border-white/10"
              >
                <div className="w-16 h-16 rounded-full border-t-2 border-[#ccff00] animate-spin" />
                <div className="font-mono text-sm tracking-widest uppercase text-[#ccff00]">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    [QUANTUM_CORE: INGESTION ACTIVE]
                  </motion.span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-20%" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl"
              >
                <form 
                  onSubmit={handleSimulate}
                  className="bg-[#070708]/95 backdrop-blur-3xl border border-white/20 p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-none" 
                >
                  <div className="border-b border-white/20 pb-4 mb-8 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#ccff00]" />
                    <h2 className="font-display font-bold text-2xl uppercase tracking-widest text-white">
                      Expression Table
                    </h2>
                  </div>

                  <div className="flex flex-col gap-6">
                    <label className="font-mono text-xs tracking-widest text-white/50 uppercase">
                      INPUT DIVERGENCE PARAMETERS
                    </label>
                    
                    <textarea
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSimulate();
                        }
                      }}
                      placeholder="E.g. What if the internet was never invented?"
                      className="w-full bg-white/5 border border-white/10 p-6 text-xl md:text-4xl text-white placeholder-white/20 focus:outline-none focus:border-[#ccff00] transition-colors resize-none min-h-[150px] font-display font-medium tracking-tight"
                    />

                    <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-8">
                      <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase hidden md:block">
                        AWAITING INPUT EXECUTION
                      </span>
                      <button 
                        type="submit"
                        disabled={!scenario.trim()}
                        className="group flex items-center gap-4 px-6 py-3 md:px-8 md:py-4 bg-white text-black font-display font-black uppercase tracking-widest text-sm md:text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ccff00] transition-colors"
                      >
                        VISUALIZE <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>

    </main>
  );
}
