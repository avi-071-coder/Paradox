"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BrainCircuit, Globe as GlobeIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <Globe />
      
      {/* Top Nav (Minimal) */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-[#00f2fe] w-6 h-6" />
          <span className="font-bold tracking-[0.2em] text-xl text-gradient">PARADOX</span>
        </div>

      </nav>

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center text-center max-w-4xl px-4 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 glass-panel mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#00f2fe]" />
          <span className="text-xs font-semibold tracking-widest text-[#00f2fe] uppercase">
            AI Simulation Engine Active
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-white"
        >
          Rewrite Reality.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-2xl text-gray-400 max-w-2xl font-light mb-12"
        >
          Explore highly immersive alternate timelines powered by artificial intelligence. What if you changed one event?
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link href="/simulate" className="group relative px-8 py-4 bg-white text-black font-semibold rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-[#2575fc]/50">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#6a11cb] to-[#2575fc] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-500">
              Start Simulation <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          

        </motion.div>
      </div>

      {/* Futuristic Floating Stats or UI Elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="absolute bottom-10 left-10 text-xs font-mono text-gray-500 flex flex-col gap-1 hidden md:flex"
      >
        <span>SYS.STATUS: [ <span className="text-green-400">ONLINE</span> ]</span>
        <span>TIMELINES.GENERATED: 1,048,576</span>
        <span>ENGINE: QUANTUM-AI-0.9</span>
      </motion.div>
    </main>
  );
}
