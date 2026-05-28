"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Globe, Radio, TrendingUp, Users, 
  MapPin, HelpCircle, ArrowLeft, BookOpen, Film, Image as ImageIcon, Sparkles 
} from "lucide-react";
import Link from "next/link";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  category: string;
  impactScore: number;
}

interface Civilization {
  name: string;
  capital: string;
  government: string;
  currency: string;
  militaryRanking: string;
  religion: string;
  architectureStyle: string;
  population: string;
  slogan: string;
  imagePrompt?: string;
}

interface NewsItem {
  headline: string;
  source: string;
  tickerText: string;
  impact: string;
}

interface MapRegion {
  id: string;
  name: string;
  controllingFaction: string;
  tensionLevel: number;
  status: string;
}

interface SimulationData {
  title: string;
  description: string;
  divergencePoint: string;
  timeline: TimelineEvent[];
  civilizations: Civilization[];
  news: NewsItem[];
  stats: {
    globalStability: number;
    techProgress: number;
    gdpDistribution: { name: string; value: number }[];
    militaryIndex: { name: string; value: number }[];
  };
  mapRegions: MapRegion[];
  survivalOdds: {
    survivalChance: number;
    dangerLevel: string;
    likelyProfession: string;
    socialStatus: string;
    tip: string;
  };
  documentary: {
    narratorSpeech: string;
    sceneDescription: string;
    visualTheme: string;
    imagePrompt?: string;
  };
  wikipedia: {
    title: string;
    infobox: { label: string; value: string }[];
    intro: string;
    sections: { heading: string; content: string }[];
  };
  propaganda: {
    title: string;
    slogan: string;
    visualDescription: string;
    faction: string;
    imagePrompt?: string;
  }[];
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function TimelineDashboard(props: PageProps) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const scenarioQuery = searchParams.q as string || "Alternate History";

  const [data, setData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchSimulation() {
      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scenario: scenarioQuery }),
        });
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Simulation retrieval error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSimulation();
  }, [scenarioQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-mono text-gradient tracking-widest uppercase animate-pulse">
            Reconstructing Alternate Dimensions...
          </h2>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-mono text-red-400 mb-4">CRITICAL ERROR: Reality Matrix Corrupted</h2>
        <Link href="/simulate" className="px-6 py-2 glass-panel hover:bg-white/10 rounded">
          Return to Terminal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Top Banner & Header */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 m-4 !rounded-3xl">
        <div className="flex items-center gap-4">
          <Link href="/simulate" className="p-2 border border-white/10 hover:border-white/40 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-gradient uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00f2fe]" />
              {data.title}
            </h1>
            <p className="text-xs text-gray-300 font-mono mt-0.5">Divergence Point: {data.divergencePoint}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["overview", "timeline", "nations", "geopolitics", "wiki", "survival"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border transition-all ${
                activeTab === tab
                  ? "bg-white/20 border-white/40 text-white shadow-lg"
                  : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* News Ticker */}
      <div className="glass-panel mx-4 mb-4 border-b border-white/5 py-2 px-6 flex items-center gap-4 overflow-hidden relative h-10 !rounded-full">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00f2fe] border-r border-white/20 pr-4 shrink-0 z-10">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>PARADOX NEWS LINK</span>
        </div>
        <div className="flex gap-12 whitespace-nowrap animate-[marquee_30s_linear_infinite] text-xs font-mono text-gray-400">
          {data.news.map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <strong className="text-white">{item.source}:</strong> {item.tickerText}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Scenario Profile */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#6a11cb] opacity-20 rounded-full blur-3xl" />
                  <h2 className="text-2xl font-semibold tracking-wide mb-4">Simulation Synthesis</h2>
                  <p className="text-gray-400 leading-relaxed font-light text-lg mb-6">{data.description}</p>
                  
                  {/* Quick Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-6 font-mono">
                    <div>
                      <span className="block text-xs text-gray-300 mb-1">GLOBAL STABILITY</span>
                      <span className="text-xl font-bold text-white">{data.stats.globalStability}%</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">TECH ADVANCEMENT</span>
                      <span className="text-xl font-bold text-violet-400">{data.stats.techProgress}%</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">SURVIVAL INDEX</span>
                      <span className="text-xl font-bold text-emerald-400">{data.survivalOdds.survivalChance}%</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">RISK LEVEL</span>
                      <span className="text-xl font-bold text-red-400">{data.survivalOdds.dangerLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Documentary Narrator Preview */}
                <div className="glass-panel p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 text-amber-500">
                      <Film className="w-5 h-5" />
                      <span className="font-mono text-sm tracking-wider">DOCUMENTARY ARCHIVE NARRATIVE</span>
                    </div>
                    <blockquote className="italic text-gray-300 font-light leading-relaxed">
                      "{data.documentary.narratorSpeech}"
                    </blockquote>
                    <p className="text-xs text-gray-500 font-mono">Visual: {data.documentary.sceneDescription}</p>
                  </div>
                  {data.documentary.imagePrompt && (
                    <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video md:aspect-square">
                      <img 
                        src={`/api/image?prompt=${encodeURIComponent(data.documentary.imagePrompt)}&seed=${encodeURIComponent(params.id)}`} 
                        alt="Simulated Archive Visualization"
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>

              {/* Survival Odds Profile Card */}
              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-3xl relative">
                  <h3 className="text-lg font-mono tracking-widest text-gradient uppercase mb-6 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-white" />
                    SURVIVAL PROBABILITY
                  </h3>
                  
                  {/* Large Radial Display */}
                  <div className="flex flex-col items-center my-6">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                        <circle cx="72" cy="72" r="64" stroke="#ff0844" strokeWidth="8" fill="transparent"
                          strokeDasharray={402}
                          strokeDashoffset={402 - (402 * data.survivalOdds.survivalChance) / 100}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-bold font-mono tracking-tighter">{data.survivalOdds.survivalChance}%</span>
                        <span className="text-[10px] text-gray-500 tracking-wider">INDEX</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-sm border-t border-white/10 pt-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ASSIGNED STATUS:</span>
                      <span className="text-white font-semibold">{data.survivalOdds.socialStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">LIKELY PROFESSION:</span>
                      <span className="text-white font-semibold">{data.survivalOdds.likelyProfession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">DANGER ZONE THREAT:</span>
                      <span className="text-red-400 font-semibold">{data.survivalOdds.dangerLevel}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-xs leading-relaxed text-white mt-2 border border-white/20">
                      <span className="font-bold text-[#00f2fe] block mb-1">ARCHIVIST RECOMMENDATION:</span>
                      {data.survivalOdds.tip}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto py-8"
            >
              <h2 className="text-2xl font-semibold mb-8 text-center tracking-wider uppercase text-white">Altered Chronicle</h2>
              
              <div className="relative border-l-2 border-white/20 pl-8 space-y-12">
                {data.timeline.map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="relative"
                  >
                    {/* Glowing Node */}
                    <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#1a1a2e] border-2 border-[#00f2fe] flex items-center justify-center glow-primary">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>

                    <div className="glass-panel p-6 rounded-2xl relative hover:-translate-y-1 transition-transform">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-mono text-[#00f2fe] font-semibold tracking-wider">
                          {event.year}
                        </span>
                        <span className="text-[10px] font-mono tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400">
                          {event.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-3">{event.title}</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">{event.description}</p>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#2575fc] to-[#00f2fe] h-full" 
                            style={{ width: `${event.impactScore}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">IMPACT: {event.impactScore}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "nations" && (
            <motion.div
              key="nations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {data.civilizations.map((civ, idx) => (
                <div key={idx} className="glass-panel rounded-2xl relative overflow-hidden border-t-2 border-violet-500 flex flex-col justify-between">
                  <div>
                    {civ.imagePrompt && (
                      <div className="h-48 relative overflow-hidden border-b border-white/10">
                        <img 
                          src={`/api/image?prompt=${encodeURIComponent(civ.imagePrompt)}&seed=${encodeURIComponent(params.id)}`} 
                          alt={civ.name}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold tracking-wider text-white mb-1">{civ.name}</h3>
                          <p className="text-xs font-mono text-violet-400 italic">"{civ.slogan}"</p>
                        </div>
                        <span className="font-mono text-xs uppercase bg-white/5 px-2.5 py-1 rounded border border-white/10">
                          {civ.militaryRanking}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 font-mono text-xs text-gray-400 mb-6 border-b border-white/5 pb-6">
                        <div>
                          <span className="block text-gray-500 mb-0.5">CAPITAL:</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-violet-400" />
                            {civ.capital}
                          </span>
                        </div>
                        <div>
                          <span className="block text-gray-500 mb-0.5">GOVERNMENT:</span>
                          <span className="text-white font-semibold">{civ.government}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 mb-0.5">CURRENCY:</span>
                          <span className="text-white font-semibold">{civ.currency}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 mb-0.5">POPULATION:</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-violet-400" />
                            {civ.population}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        <div>
                          <span className="block text-gray-500 mb-1">ARCHITECTURAL HERITAGE:</span>
                          <p className="text-white bg-white/5 p-3 rounded-lg border border-white/5 font-light leading-relaxed">
                            {civ.architectureStyle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "geopolitics" && (
            <motion.div
              key="geopolitics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* SVG Holographic World Map */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-mono tracking-widest text-[var(--color-electric-cyan)] uppercase flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    TACTICAL CONFLICT OVERLAY
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                    MATRIX_VERSION_1.0
                  </span>
                </div>

                <div className="relative flex-1 min-h-[350px] bg-matte-black/50 border border-white/5 rounded-xl flex items-center justify-center p-4">
                  {/* Tech Grid SVG Map */}
                  <svg viewBox="0 0 800 400" className="w-full h-full opacity-80">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Simulated Continent Paths */}
                    <path d="M 150 100 Q 200 80 250 120 T 350 110 T 300 200 T 200 250 T 100 220 Z" fill="rgba(0, 240, 255, 0.08)" stroke="var(--color-electric-cyan)" strokeWidth="1" />
                    <path d="M 500 120 Q 550 90 600 130 T 700 150 T 650 250 T 550 280 T 450 220 Z" fill="rgba(138, 43, 226, 0.08)" stroke="#8a2be2" strokeWidth="1" />
                    <path d="M 380 280 Q 420 260 480 290 T 500 350 T 440 370 T 360 340 Z" fill="rgba(255, 0, 60, 0.08)" stroke="var(--color-crimson-red)" strokeWidth="1" />

                    {/* Region Marker Rings */}
                    <circle cx="220" cy="160" r="10" fill="none" stroke="var(--color-electric-cyan)" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: "220px 160px", animationDuration: "3s" }} />
                    <circle cx="220" cy="160" r="4" fill="var(--color-electric-cyan)" />

                    <circle cx="580" cy="200" r="10" fill="none" stroke="#8a2be2" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: "580px 200px", animationDuration: "4s" }} />
                    <circle cx="580" cy="200" r="4" fill="#8a2be2" />

                    {/* Scanning Line overlay */}
                    <line x1="0" y1="50" x2="800" y2="50" stroke="var(--color-electric-cyan)" strokeWidth="0.5" opacity="0.4" className="animate-[bounce_8s_infinite]" />
                  </svg>
                  
                  <div className="absolute bottom-4 left-4 font-mono text-[10px] text-gray-500 space-y-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--color-electric-cyan)]" /> The New Coalition Zone</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> The Meridian Alliance Zone</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Disputed / Tension Zone</span>
                  </div>
                </div>
              </div>

              {/* Region tension index list */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-mono tracking-widest text-white uppercase mb-6">
                    REGION INDEX
                  </h3>
                  <div className="space-y-4">
                    {data.mapRegions.map((region, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold">{region.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            region.tensionLevel > 50 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {region.status}
                          </span>
                        </div>
                        <div className="flex justify-between font-mono text-[10px] text-gray-500">
                          <span>CONTROL: {region.controllingFaction}</span>
                          <span>TENSION: {region.tensionLevel}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${region.tensionLevel > 50 ? "bg-red-500" : "bg-emerald-500"}`} 
                            style={{ width: `${region.tensionLevel}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Macro stats */}
                <div className="border-t border-white/10 pt-6 mt-6 grid grid-cols-2 gap-4 font-mono text-center">
                  <div>
                    <span className="block text-[10px] text-gray-500 mb-1">STABILITY RATIO</span>
                    <span className="text-lg font-bold text-emerald-400">92.4%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 mb-1">TACTICAL TENSION</span>
                    <span className="text-lg font-bold text-red-400">Low-Mod</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "wiki" && (
            <motion.div
              key="wiki"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Wiki Article */}
                <div className="flex-1 space-y-6">
                  <div className="border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>ALTERNATE WIKIPEDIA LOG ARCHIVE</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{data.wikipedia.title}</h2>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed font-light text-base md:text-lg">
                    {data.wikipedia.intro}
                  </p>

                  <div className="space-y-8 pt-4">
                    {data.wikipedia.sections.map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        <h3 className="text-xl font-bold tracking-wide border-b border-white/5 pb-2 text-[var(--color-electric-cyan)]">
                          {section.heading}
                        </h3>
                        <p className="text-gray-400 leading-relaxed font-light text-sm md:text-base">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fictional Infobox */}
                <div className="w-full md:w-72 bg-white/5 border border-white/10 rounded-xl p-4 shrink-0 font-mono text-xs">
                  <div className="bg-white/10 p-2 text-center font-bold mb-4 rounded border border-white/5 uppercase tracking-wider text-[var(--color-electric-cyan)]">
                    Timeline Parameters
                  </div>
                  <table className="w-full text-left space-y-2">
                    <tbody>
                      {data.wikipedia.infobox.map((info, idx) => (
                        <tr key={idx} className="border-b border-white/5 last:border-0">
                          <td className="py-2.5 text-gray-500 font-medium pr-4 uppercase">{info.label}</td>
                          <td className="py-2.5 text-white font-semibold text-right">{info.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "survival" && (
            <motion.div
              key="survival"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Propaganda Poster Generator */}
              {data.propaganda.map((poster, idx) => (
                <div key={idx} className="glass-panel rounded-2xl border-t border-white/10 flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute inset-0 noise-bg opacity-10 pointer-events-none" />
                  
                  {poster.imagePrompt && (
                    <div className="h-64 relative overflow-hidden border-b border-white/10">
                      <img 
                        src={`/api/image?prompt=${encodeURIComponent(poster.imagePrompt)}&seed=${encodeURIComponent(params.id)}`} 
                        alt={poster.title}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs tracking-widest text-[var(--color-electric-cyan)] uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4" />
                          PROPAGANDA ARCHIVE
                        </span>
                        <span className="font-mono text-[10px] text-gray-500 uppercase">{poster.faction}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold tracking-tight text-white">{poster.title}</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">{poster.visualDescription}</p>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl flex flex-col items-center text-center space-y-2 mt-4">
                      <span className="font-mono text-[10px] text-red-500 tracking-[0.2em] uppercase font-bold">Official Directive Slogan</span>
                      <p className="text-lg md:text-xl font-bold tracking-tight text-red-400 uppercase italic">
                        "{poster.slogan}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
