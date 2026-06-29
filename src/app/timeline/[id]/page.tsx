"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

// Client-side instant fallback generator — identical structure to server fallback
function generateInstantFallback(scenario: string) {
  const title = `Timeline: ${scenario.replace(/^What if\s+/i, "")}`;
  return {
    title,
    punchyIntro: `THE WORLD YOU KNOW IS DEAD. Because ${scenario}, the foundational pillars of our timeline have collapsed. In its place, a fragile, hyper-advanced equilibrium has materialized, built on the ashes of what could have been. You are now observing the Divergent Epoch.`,
    description: `A simulated reality exploring the timeline where: "${scenario}". Built by the PARADOX Classified Engine.`,
    divergencePoint: `The exact moment where reality diverged based on: ${scenario}`,
    timeline: [
      { year: "1 Year Post-Divergence", title: "The Initial Fracture", description: `Following the event where ${scenario}, the primary geopolitical power structures experience a rapid shift. Former allies declare neutrality as the new order stabilizes around this paradigm shift.`, category: "politics", impactScore: 85 },
      { year: "10 Years Post-Divergence", title: "Technological Adaptation", description: `Global focus redirects toward alternative systems to sustain a world where ${scenario}. Specialized engineering and social systems are rapidly deployed.`, category: "invention", impactScore: 90 },
      { year: "25 Years Post-Divergence", title: "The Great Realignment", description: `New power blocs finalize continental alliances. Ancient territories are reclaimed under modern banners, fully adapting to the reality that ${scenario}.`, category: "society", impactScore: 95 },
      { year: "50 Years Post-Divergence", title: "A Fragile New Equilibrium", description: `A state of global equilibrium is established. The world is unrecognizable compared to the prime timeline, entirely shaped by the long-term consequences of ${scenario}.`, category: "culture", impactScore: 78 }
    ],
    civilizations: [
      { name: "The New Coalition", capital: "Neo-Alexandria", government: "Technocratic Council", currency: "Quantum Credits (QCR)", militaryRanking: "Tier-1 Superpower", religion: "Secular Rationalism", architectureStyle: "Neo-Futuristic Glassmorphism", population: "1.2 Billion", slogan: "Precision. Progress. Unity.", imagePrompt: "futuristic city" },
      { name: "The Meridian Alliance", capital: "Aetheria", government: "Federal Republic", currency: "Meridian Aurum", militaryRanking: "Tier-2 Strategic Power", religion: "Pantheistic Ecological System", architectureStyle: "Organic Biophilic Integration", population: "840 Million", slogan: "In Harmony with the Stream.", imagePrompt: "organic biophilic city" }
    ],
    news: [
      { headline: "Quantum Ticker: Stability metrics reach 94.2% across major central hubs.", source: "Classified Broadcast Network", tickerText: "STABILITY_NORMAL // NO DIVERGENCE DETECTED IN SEC-4", impact: "moderate" },
      { headline: "Continental borders finalized under the Treaty of Neo-Alexandria.", source: "Global Annals", tickerText: "MAPS UPDATED // CHECK TACTICAL OVERLAY", impact: "high" }
    ],
    stats: { globalStability: 78, techProgress: 88, gdpDistribution: [{ name: "The New Coalition", value: 55 }, { name: "The Meridian Alliance", value: 30 }, { name: "Independent Zones", value: 15 }], militaryIndex: [{ name: "The New Coalition", value: 92 }, { name: "The Meridian Alliance", value: 68 }, { name: "Independent Zones", value: 35 }] },
    mapRegions: [
      { id: "NA", name: "North America Zone", controllingFaction: "The New Coalition", tensionLevel: 15, status: "Secure" },
      { id: "EU", name: "Eurasian Core", controllingFaction: "The New Coalition", tensionLevel: 45, status: "Military Supervision" },
      { id: "AF", name: "Meridian Biosphere", controllingFaction: "The Meridian Alliance", tensionLevel: 20, status: "Ecological Sanctuary" }
    ],
    survivalOdds: { survivalChance: 68, dangerLevel: "Medium", likelyProfession: "Timeline Data Archivist", socialStatus: "Upper-Middle Technocrat", tip: "Avoid high-tension border zones in the Eurasian Core. Maintain high energy credits buffer." },
    documentary: { narratorSpeech: "In this alternate configuration of history, we see a world that took a radical turn. Stripped of the assumptions of our prime timeline, human civilization rebuilt itself not with steel and steam, but with light and glass.", sceneDescription: "Slow panoramic camera sweep over massive towering biophilic skyscrapers.", visualTheme: "Cinematic Warm Amber and Deep Gold tones.", imagePrompt: "panoramic sweep over massive biophilic skyscrapers, warm sunset" },
    wikipedia: { title: "The Divergent Epoch", infobox: [{ label: "Founded", value: "25 Years Post-Fracture" }, { label: "Prime Factions", value: "New Coalition, Meridian Alliance" }, { label: "Global GDP Status", value: "Stable (92.4 Trillion QCR)" }], intro: "The Divergent Epoch represents the historical era beginning with the Fracture event, which completely restructured global geopolitical alliances, technical advancement, and social organization.", sections: [{ heading: "The Fracture", content: "The initial event that led to the Divergent Epoch remains a subject of archival study. What started as localized timeline fluctuations quickly cascaded into global geopolitical restructuring." }, { heading: "Establishment of the Technocracy", content: "By year 15, traditional governmental models were largely replaced by technocratic assemblies, focusing on algorithmic resource distribution and ecological preservation." }] },
    propaganda: [{ title: "Neo-Alexandria Recruitment", slogan: "Secure the Future. Join the Technocracy Assembly today.", visualDescription: "An imposing dark navy poster featuring a stylized holographic eagle silhouette and glowing cyan data streams.", faction: "The New Coalition", imagePrompt: "minimalist propaganda poster for a technocratic empire" }]
  };
}

// Robust Image Component with Loading State and Fallback
function DynamicImage({ prompt, className, alt, seed, index = 0 }: { prompt: string, className?: string, alt: string, seed: number, index?: number }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // Curated Awwwards-tier fallback images if the AI fails or times out
  const fallbacks = [
    "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=2000"
  ];
  const fallbackUrl = fallbacks[seed % fallbacks.length];

  useEffect(() => {
    let isMounted = true;
    
    async function fetchImage() {
      try {
        // STAGGER REQUESTS to prevent Pollinations concurrent rate limits (IP Queue Full)
        // We use the strict index to wait exactly 4 seconds between each fetch
        const staggerDelay = index * 4000;
        await new Promise(res => setTimeout(res, staggerDelay));

        if (!isMounted) return;

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        if (!response.ok) throw new Error('Failed to generate image');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (isMounted) setImgSrc(url);
      } catch (err) {
        console.error("Image generation fallback triggered:", err);
        if (isMounted) {
          setError(true);
          setImgSrc(fallbackUrl);
        }
      }
    }
    fetchImage();
    
    // Cleanup URL
    return () => {
      isMounted = false;
      if (imgSrc && imgSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [prompt]); // Do not include fallbackUrl to avoid re-renders

  return (
    <div className={`relative bg-[#070708] overflow-hidden ${className || ''}`}>
      {/* Loading Spinner */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070708] z-0">
          <div className="w-8 h-8 border-t-2 border-[#ccff00] rounded-full animate-spin mb-4" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 text-center px-4">
            [QUANTUM_CORE]<br/>MATERIALIZING HIGH-RES ASSET...
          </span>
        </div>
      )}
      
      {/* The Image */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${loaded || error ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// -------------------------------------------------------------
// SECTION 1: THE HERO CONDENSE
// -------------------------------------------------------------
function HeroCondense({ data, act2Prompt, vectorId }: { data: any, act2Prompt: string, vectorId: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Scale down from full screen to a small box ONLY after the user scrolls past the first fold (progress 0.5 to 0.9)
  const scale = useTransform(scrollYProgress, [0.5, 0.9], [1, 0.15]);
  // Round corners as it shrinks
  const borderRadius = useTransform(scrollYProgress, [0.5, 0.9], ["0vw", "12vw"]);
  


  return (
    <section ref={ref} className="relative w-full h-[220vh] bg-[#070708]">
      {/* Sticky Background Box (Condenses LATER) */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center z-0 pointer-events-none">
        <motion.div 
          style={{ scale, borderRadius }}
          className="relative w-full h-full overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] bg-black"
        >
          {/* Image */}
          <DynamicImage 
            prompt={act2Prompt} 
            alt="Hero Background" 
            seed={42} 
            index={0}
            className="absolute inset-0 w-full h-full opacity-80" 
          />
          {/* Solid gradient that stays in the box */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070708]/90 via-[#070708]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070708] to-transparent opacity-80" />
        </motion.div>
      </div>

      {/* Natural Scrolling Foreground Content */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        {/* Full-screen content that scrolls up and out of view */}
        <div className="h-screen w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-16 md:pb-24 pointer-events-auto">
          <div className="max-w-4xl text-white">
            <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[#ccff00] mb-4 md:mb-6">
              Divergence Point: {data.divergencePoint}
            </div>
            <h2 className="text-[7vw] md:text-[5vw] font-display font-black leading-[0.85] tracking-tighter uppercase mb-4 md:mb-8">
              {data.title}
            </h2>
            <p className="text-sm md:text-xl font-display font-medium leading-snug border-l-4 border-white pl-4 md:pl-6">
              {data.punchyIntro}
            </p>
          </div>
        </div>
        
        {/* Spacer section. As the user scrolls through this, the background condenses */}
        <div className="h-[120vh]" />
      </div>

      {/* Floating HUD elements (Fixed at top, stays above all sections) */}
      <div className="fixed top-0 w-full p-4 md:p-8 z-50 flex justify-between gap-4 pointer-events-none">
        <Link 
          href="/" 
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 border border-white/10 bg-[#070708]/80 backdrop-blur-md text-white hover:bg-white hover:text-black hover:border-white transition-all font-mono text-[10px] md:text-xs uppercase tracking-widest rounded-none shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> <span>Return</span>
        </Link>
        <div className="pointer-events-auto text-right px-3 py-1.5 md:px-4 md:py-2 border border-white/10 bg-[#070708]/80 backdrop-blur-md rounded-none shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="font-mono text-[8px] md:text-[9px] uppercase tracking-widest text-white/40 mb-0.5">[SYS_LOG: SIMULATING...]</div>
          <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[#ccff00] font-bold">STABILITY: {data.stats?.globalStability || 78}%</div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// SECTION 2: THE HORIZONTAL TIMELINE
// -------------------------------------------------------------
function HorizontalTimeline({ data, scenarioQuery }: { data: any, scenarioQuery: string }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate horizontal translation based on number of items
  // If there are 4 items, we need to scroll enough to see the last one.
  const numItems = data.timeline?.length || 1;
  // A rough estimate: we want to translate by (numItems * 100vw) - 100vw to reach the end.
  // Using percentages is safer: "-(numItems - 1) * 100%" roughly, but let's use a dynamic viewport calculation.
  // Or simply map 0->1 to 0% -> -80% (depending on total width).
  // We'll set the container to have `w-[400vw]` if there are 4 items.
  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", `-${100 - (100 / numItems)}%`]);

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-[#070708]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center">
        
        {/* Horizontal Track */}
        <motion.div 
          style={{ x: xTransform, width: `${numItems * 100}vw` }}
          className="flex h-full items-center px-12 md:px-32 gap-12 md:gap-32"
        >
          
          {/* Intro Title Card */}
          <div className="w-[80vw] md:w-[40vw] flex-shrink-0">
            <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase text-white leading-none">
              TIMELINE<br/>
              <span className="text-transparent stroke-white" style={{ WebkitTextStroke: '2px white' }}>EVENTS</span>
            </h2>
            <div className="w-24 h-[2px] bg-[#ccff00] mt-8" />
          </div>

          {/* Event Cards */}
          {data.timeline?.map((event: any, idx: number) => {
            return (
              <div 
                key={idx} 
                className="w-[85vw] md:w-[45vw] h-[55vh] md:h-[70vh] flex-shrink-0 relative border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-md overflow-hidden p-6 md:p-12 flex flex-col"
              >
                {/* Tactical Dot Matrix Background */}
                <div 
                  className="absolute inset-0 opacity-[0.07] pointer-events-none" 
                  style={{ 
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                  }} 
                />

                {/* HUD Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ccff00]/40" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#ccff00]/40" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ccff00]/40" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ccff00]/40" />

                {/* Card Content — scrollable area */}
                <div className="flex flex-col justify-start relative z-10 flex-1 min-h-0 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ccff00 transparent' }}>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#ccff00] mb-4 md:mb-6 flex items-center justify-between flex-shrink-0">
                    <span>{event.year} // {event.category}</span>
                    <span className="text-white/20 text-[9px]">[ IDX: 0{idx + 1} ]</span>
                  </div>
                  <h3 className="text-xl md:text-4xl font-display font-black uppercase tracking-tight mb-4 md:mb-6 text-white leading-tight flex-shrink-0">
                    {event.title}
                  </h3>
                  <p className="text-xs md:text-base text-white/70 font-mono leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* HUD Card Content Bottom - Impact Metric */}
                <div className="relative z-10 pt-4 md:pt-6 mt-auto border-t border-white/5 flex items-center justify-between font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 flex-shrink-0">
                  <span>DIVERGENCE IMPACT</span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 md:w-28 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#ccff00] rounded-full shadow-[0_0_8px_#ccff00]" 
                        style={{ width: `${event.impactScore || 50}%` }}
                      />
                    </div>
                    <span className="text-[#ccff00] font-bold">{event.impactScore || 50}%</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Buffer Card to ensure smooth scrolling past the last item */}
          <div className="w-[20vw] flex-shrink-0" />

        </motion.div>
      </div>
    </section>
  );
}


// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function TimelineScrollytelling(props: PageProps) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const scenarioQuery = searchParams.q as string || "Alternate History";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimulation() {
      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario: scenarioQuery }),
        });
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSimulation();
  }, [scenarioQuery]);

  // Cinematic loading progress
  const [loadingStage, setLoadingStage] = useState(0);
  const loadingStages = [
    "INITIALIZING PARADOX ENGINE...",
    "SCANNING DIVERGENCE VECTORS...",
    "RECONSTRUCTING ALTERNATE TIMELINE...",
    "SIMULATING GEOPOLITICAL CASCADE...",
    "GENERATING CIVILIZATION DATA...",
    "COMPILING HISTORICAL ARCHIVES...",
    "RENDERING REALITY MATRIX...",
    "FINALIZING SIMULATION..."
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % loadingStages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-white relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(rgba(204,255,0,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Scan line animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#ccff00]/30 to-transparent animate-pulse" style={{ top: `${30 + (loadingStage * 5)}%`, transition: 'top 3s ease-in-out' }} />
        </div>

        <div className="flex flex-col items-center gap-8 z-10">
          {/* Pulsating core */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 border border-[#ccff00]/20 rotate-45 animate-pulse" />
            <div className="absolute inset-2 border border-[#ccff00]/30 rotate-[30deg]" style={{ animation: 'spin 4s linear infinite reverse' }} />
            <div className="w-4 h-4 bg-[#ccff00] shadow-[0_0_20px_#ccff00,0_0_40px_rgba(204,255,0,0.5)]" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>

          {/* Stage text */}
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">[QUANTUM_CORE: ACTIVE]</div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#ccff00] min-h-[1.5em]" style={{ transition: 'opacity 0.5s' }}>
              {loadingStages[loadingStage]}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-[2px] bg-white/10 overflow-hidden">
            <div className="h-full bg-[#ccff00] shadow-[0_0_8px_#ccff00]" style={{ width: `${Math.min(95, (loadingStage + 1) * 12)}%`, transition: 'width 3s ease-out' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const act2Prompt = `Cinematic, high-contrast medium shot of an alternate 2026 city square, brutalist architecture blending with retro-futuristic analog technology, oversized monochromatic propaganda billboards, overcast dark sky, ${scenarioQuery}`;
  const act3Prompt = `Stark, high-contrast black and white archival document photograph. blueprint of an analog, steam-powered computing engine from the 19th century, intricate technical schematics, historical museum archive aesthetic, ${data.title}`;

  return (
    <div className="w-full relative bg-[#070708] text-white selection:bg-[#ccff00] selection:text-black">
      
      {/* 1. Hero Condense Animation */}
      <HeroCondense data={data} act2Prompt={act2Prompt} vectorId={params.id.substring(0,6).toUpperCase()} />

      {/* 2. Horizontal Testimonial-Style Timeline */}
      <HorizontalTimeline data={data} scenarioQuery={scenarioQuery} />

      {/* 3. The Stark Contrast Wipe (Archival Data) */}
      <section className="relative w-full bg-[#F5F5F7] text-[#070708] z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t-[20px] border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          
          <div className="w-full h-[35vh] md:h-[70vh] border border-[#1F2024] p-3 md:p-4 bg-white md:sticky md:top-32">
            <div className="w-full h-full relative overflow-hidden bg-[#e0e0e0]">
              <DynamicImage 
                prompt={act3Prompt} 
                alt="Historical Artifact" 
                seed={84}
                index={1}
                className="w-full h-full mix-blend-multiply opacity-90 grayscale contrast-125" 
              />
              <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-widest uppercase bg-white px-2 py-1 border border-black z-10">
                ARCHIVE REF: {Math.floor(Math.random() * 9999)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-16 py-12">
            <div>
              <h3 className="text-4xl font-display font-black uppercase tracking-tighter mb-8 border-b-2 border-black pb-4">
                Cultural Divergence
              </h3>
              <p className="text-xl font-display font-medium leading-relaxed mb-8">
                {data.wikipedia?.intro || "Historical records indicate a rapid shift in cultural norms following the divergence."}
              </p>
              
              <ul className="flex flex-col gap-6">
                {data.wikipedia?.sections?.map((sec: any, idx: number) => (
                  <li key={idx} className="flex gap-4">
                    <span className="font-mono text-xs mt-1">0{idx+1}</span>
                    <div>
                      <strong className="block font-mono text-sm uppercase tracking-widest mb-1">{sec.heading}</strong>
                      <span className="font-display text-black/70">{sec.content}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-6">
                Civilization Metrics
              </h3>
              <div className="w-full border-t border-black">
                {data.civilizations?.map((civ: any, idx: number) => (
                  <div key={idx} className="border-b border-black py-4 grid grid-cols-2 gap-4">
                    <div className="font-mono text-xs uppercase tracking-widest font-bold">{civ.name}</div>
                    <div className="font-mono text-xs text-black/60 text-right">{civ.population} | {civ.militaryRanking}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#070708] text-white p-8 mt-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-4">Survival Assessment</div>
              <div className="text-2xl font-display font-bold mb-2">Danger Level: {data.survivalOdds?.dangerLevel}</div>
              <p className="font-mono text-xs text-white/70">{data.survivalOdds?.tip}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Return to the Void (Epilogue) */}
      <section className="relative w-full min-h-[80vh] bg-[#070708] text-white flex flex-col items-center justify-center p-6 text-center z-40">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="font-mono text-xs uppercase tracking-widest text-white/30 mb-8">
            END OF RECORD
          </div>
          <h2 className="text-[8vw] md:text-[5vw] font-display font-black leading-[0.9] tracking-tighter uppercase mb-12">
            The timeline has been documented.
          </h2>
          
          <Link 
            href="/"
            className="group flex items-center gap-4 px-8 py-4 md:px-12 md:py-6 bg-white text-black font-display font-black uppercase tracking-widest text-sm md:text-xl hover:bg-[#ccff00] hover:scale-105 transition-all rounded-sm"
          >
            [ RE-WRITE TIMELINE ] <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}
