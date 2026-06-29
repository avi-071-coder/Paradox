import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client if API key is provided
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  let scenario = "";
  try {
    // Clone and parse request safely
    const body = await request.json().catch(() => ({}));
    scenario = body.scenario || "";

    if (!scenario) {
      return NextResponse.json({ error: "Scenario prompt is required" }, { status: 400 });
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    const prompt = `
      You are the PARADOX Alternate Reality Simulation Engine. You generate deeply immersive, richly detailed alternate history simulations.
      Generate a detailed alternate history simulation in valid JSON format based on:
      "${scenario}"

      The JSON MUST follow this schema:
      {
        "title": string, // A short punchy title (3-6 words max)
        "punchyIntro": string, // A cinematic, aggressive 4-5 sentence paragraph. Be dramatic, visceral, and world-building. Describe the chaos, the new powers, the human cost. Make it gripping.
        "description": string, // 3-4 sentences painting the alternate world in vivid detail.
        "divergencePoint": string, // 2-3 sentences on the exact moment reality split and why it mattered.
        "timeline": Array<{
          "year": string,
          "title": string,
          "description": string, // A vivid description of this event, exactly 3 sentences (aim for 50-65 words, which is 6-8 lines of text). Do not exceed 3 sentences.
          "category": "conflict" | "invention" | "politics" | "culture" | "society",
          "impactScore": number // 1-100
        }>,
        "civilizations": Array<{
          "name": string,
          "capital": string,
          "government": string,
          "currency": string,
          "militaryRanking": string,
          "religion": string,
          "architectureStyle": string,
          "population": string,
          "slogan": string,
          "imagePrompt": string // Short visual prompt for AI image generation
        }>,
        "news": Array<{
          "headline": string, // A full news headline, 10-15 words
          "source": string,
          "tickerText": string,
          "impact": "critical" | "high" | "moderate"
        }>,
        "stats": {
          "globalStability": number,
          "techProgress": number,
          "gdpDistribution": Array<{ name: string, value: number }>,
          "militaryIndex": Array<{ name: string, value: number }>
        },
        "mapRegions": Array<{
          "id": string,
          "name": string,
          "controllingFaction": string,
          "tensionLevel": number,
          "status": string // 2-3 word status description
        }>,
        "survivalOdds": {
          "survivalChance": number,
          "dangerLevel": "Low" | "Medium" | "High" | "Extremely High" | "Absolute Certain Death",
          "likelyProfession": string,
          "socialStatus": string,
          "tip": string // 2-3 sentences of vivid, specific survival advice for someone dropped into this world.
        },
        "documentary": {
          "narratorSpeech": string, // 3-4 dramatic sentences. Write as if David Attenborough is narrating the fall and rebirth of civilization. Poetic, haunting, deeply human.
          "sceneDescription": string, // 2-3 sentences describing the visual scene
          "visualTheme": string,
          "imagePrompt": string
        },
        "wikipedia": {
          "title": string,
          "infobox": Array<{ label: string, value: string }>,
          "intro": string, // 3-4 sentences, written like a real Wikipedia article intro. Dense with facts, dates, and context.
          "sections": Array<{ heading: string, content: string }> // IMPORTANT: Each section content MUST be exactly 2 sentences (aim for 30-40 words, which is 3-5 lines of text). Do not exceed 2 sentences.
        },
        "propaganda": Array<{
          "title": string,
          "slogan": string, // A punchy 5-8 word propaganda slogan
          "visualDescription": string, // 2-3 sentences describing the poster
          "faction": string,
          "imagePrompt": string
        }>
      }

      CRITICAL RULES:
      1. Escape internal double quotes properly.
      2. No trailing commas.
      3. Every description field must have multiple full sentences. One-liners or single phrases are UNACCEPTABLE. The wikipedia sections must be exactly 2 sentences (3-5 lines). The timeline descriptions must be exactly 3 sentences (6-8 lines).
      4. Array sizes: "timeline" = exactly 4 items, "civilizations" = exactly 2, "news" = exactly 3, "mapRegions" = exactly 3, "propaganda" = exactly 2, "wikipedia.sections" = exactly 2, "wikipedia.infobox" = exactly 4, "gdpDistribution" = exactly 3, "militaryIndex" = exactly 3.
      5. Return ONLY the raw JSON. No markdown, no commentary, no introductory text.
    `;

    let data = null;
    let success = false;

    console.log(`[SIMULATION_ENGINE] Running simulation pipeline. GEMINI_API_KEY defined: ${!!apiKey}, OPENROUTER_API_KEY defined: ${!!openrouterApiKey}`);


    const deadlineStart = Date.now();

    // Stage 1: Google Gemini API (Direct)
    if (ai) {
      try {
        console.log(`[SIMULATION_ENGINE] Stage 1: Attempting direct Google Gemini generation...`);
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        let responseText = response.text;
        if (responseText) {
          data = robustParseJSON(responseText);
          success = true;
          console.log(`[SIMULATION_ENGINE] Stage 1 (Google Gemini) succeeded!`);
        } else {
          console.warn(`[SIMULATION_ENGINE] Stage 1 (Google Gemini) returned empty text.`);
        }
      } catch (err: any) {
        console.error(`[SIMULATION_ENGINE] Stage 1 (Google Gemini) failed:`, err);
      }
    }

    // Stage 2: OpenRouter fallback
    if (!success && openrouterApiKey) {
      const modelsToTry = [
        "google/gemini-2.5-flash:free",
        "meta-llama/llama-3.3-70b-instruct:free"
      ];
      for (const modelName of modelsToTry) {
        try {
          console.log(`[SIMULATION_ENGINE] Stage 2: Attempting OpenRouter model ${modelName}...`);
          
          // Shorter 12-second timeout per model to keep responsiveness high
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);
          
          const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openrouterApiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://github.com/google/paradox",
              "X-Title": "Paradox Simulator"
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "system",
                  content: "You are the PARADOX Alternate Reality Simulation Engine. You must return ONLY raw valid JSON matching the requested schema. Never output conversational text, introductory greetings, markdown wrapping, or commentary."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              response_format: { type: "json_object" },
              max_tokens: 3000
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (orResponse.ok) {
            const json = await orResponse.json();
            let content = json.choices?.[0]?.message?.content;
            if (content) {
              console.log(`[SIMULATION_ENGINE] Content length received: ${content.length}. Ending characters: ${content.substring(content.length - 200)}`);
              data = robustParseJSON(content);
              success = true;
              console.log(`[SIMULATION_ENGINE] Stage 2 (OpenRouter model ${modelName}) succeeded!`);
              break; // Break out of the loop since we succeeded
            } else {
              console.warn(`[SIMULATION_ENGINE] OpenRouter model ${modelName} returned empty choices content. Full response:`, JSON.stringify(json));
            }
          } else {
            const errText = await orResponse.text();
            console.error(`[SIMULATION_ENGINE] OpenRouter model ${modelName} returned error status ${orResponse.status}:`, errText);
          }
        } catch (err: any) {
          console.error(`[SIMULATION_ENGINE] Stage 2 (OpenRouter model ${modelName}) threw error:`, err.name === "AbortError" ? `Request timed out (12s)` : err);
        }
      }
    }

    const totalElapsed = ((Date.now() - deadlineStart) / 1000).toFixed(1);
    if (success && data) {
      console.log(`[SIMULATION_ENGINE] Returning AI data in ${totalElapsed}s`);
      return NextResponse.json(data);
    } else {
      console.warn(`[SIMULATION_ENGINE] All active simulation API routes failed after ${totalElapsed}s. Reverting to local fallback data.`);
      return NextResponse.json(getFallbackData(scenario || "Alternate Reality"));
    }
  } catch (error: any) {
    console.error("Simulation generation pipeline crashed:", error);
    return NextResponse.json(getFallbackData(scenario || "Alternate Reality"));
  }
}

function healTruncatedJSON(jsonStr: string): string {
  let cleaned = jsonStr.trim();
  
  // Track open quotes, braces, and brackets
  let inString = false;
  let escape = false;
  let stack: string[] = [];
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  // If we ended inside a string, close the string quote first
  if (inString) {
    cleaned += '"';
  }

  // Pop from stack and close in reverse order
  while (stack.length > 0) {
    const lastOpen = stack.pop();
    cleaned = cleaned.trim();
    
    // Clean trailing characters/commas/colons that make JSON invalid before appending closing brackets
    if (cleaned.endsWith(',')) {
      cleaned = cleaned.substring(0, cleaned.length - 1);
    }
    if (cleaned.endsWith(':')) {
      cleaned = cleaned.substring(0, cleaned.length - 1).trim();
      // If we removed a colon, we should also remove the key name if it's there
      if (cleaned.endsWith('"')) {
        const lastQuote = cleaned.lastIndexOf('"', cleaned.length - 2);
        if (lastQuote !== -1) {
          cleaned = cleaned.substring(0, lastQuote).trim();
        }
      }
      if (cleaned.endsWith(',')) {
        cleaned = cleaned.substring(0, cleaned.length - 1);
      }
    }
    
    if (lastOpen === '{') {
      cleaned += '}';
    } else if (lastOpen === '[') {
      cleaned += ']';
    }
  }
  
  return cleaned;
}

function robustParseJSON(text: string) {
  let cleaned = text.trim();
  
  // 1. Try simple parse of the whole cleaned text
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // 2. Remove markdown wrappers
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // 3. Find the first '{' or '[' to strip leading conversational text
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  if (startIdx !== -1) {
    const fromStart = cleaned.substring(startIdx);
    
    // A. Try parsing it directly
    try {
      return JSON.parse(fromStart);
    } catch (e) {}

    // B. Try healing it directly from start index (handles truncation)
    try {
      const healed = healTruncatedJSON(fromStart);
      return JSON.parse(healed);
    } catch (e) {}

    // C. Try range-based extraction (from first brace/bracket to last brace/bracket)
    // This handles complete JSON with trailing conversational junk
    const lastBrace = cleaned.lastIndexOf("}");
    const lastBracket = cleaned.lastIndexOf("]");
    let endIdx = -1;
    if (lastBrace !== -1 && lastBracket !== -1) {
      endIdx = Math.max(lastBrace, lastBracket);
    } else if (lastBrace !== -1) {
      endIdx = lastBrace;
    } else if (lastBracket !== -1) {
      endIdx = lastBracket;
    }

    if (endIdx !== -1 && endIdx > startIdx) {
      const rangeExtracted = cleaned.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(rangeExtracted);
      } catch (e) {}

      // Try healing the range-extracted content (in case of double truncation/mess-ups)
      try {
        const healedRange = healTruncatedJSON(rangeExtracted);
        return JSON.parse(healedRange);
      } catch (e) {}
      
      // Try replacing trailing commas in range extracted
      try {
        const repaired = rangeExtracted.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(repaired);
      } catch (e) {}
    }
  }

  // If everything fails, throw the original parse error
  throw new Error("Failed to parse JSON even after range-based extraction and healing.");
}

function getFallbackData(scenario: string) {
  // Generate highly realistic mock data based on the scenario words to make it feel alive even without Gemini API key
  const title = `Timeline: ${scenario.replace(/^What if\s+/i, "")}`;
  
  return {
    title,
    punchyIntro: `THE WORLD YOU KNOW IS DEAD. Because ${scenario}, the foundational pillars of our timeline have collapsed. In its place, a fragile, hyper-advanced equilibrium has materialized, built on the ashes of what could have been. You are now observing the Divergent Epoch.`,
    description: `A simulated reality exploring the timeline where: "${scenario}". Built by the PARADOX Classified Engine.`,
    divergencePoint: `The exact moment where reality diverged based on: ${scenario}`,
    timeline: [
      {
        year: "1 Year Post-Divergence",
        title: "The Initial Fracture",
        description: `Following the event where ${scenario}, the primary geopolitical power structures experience a rapid shift. Former allies declare neutrality as the new order stabilizes around this paradigm shift. The immediate economic impact triggers widespread rationing and currency control measures across the hemisphere.`,
        category: "politics",
        impactScore: 85
      },
      {
        year: "10 Years Post-Divergence",
        title: "Technological Adaptation",
        description: `Global focus redirects toward alternative systems to sustain a world where ${scenario}. Specialized engineering and social systems are rapidly deployed to bypass old dependencies. These adaptations lay the groundwork for the emerging regional technocratic federations.`,
        category: "invention",
        impactScore: 90
      },
      {
        year: "25 Years Post-Divergence",
        title: "The Great Realignment",
        description: `New power blocs finalize continental alliances. Ancient territories are reclaimed under modern banners, fully adapting to the reality that ${scenario}. Border checkpoints utilize biometric tracking systems to enforce stability across boundaries.`,
        category: "society",
        impactScore: 95
      },
      {
        year: "50 Years Post-Divergence",
        title: "A Fragile New Equilibrium",
        description: `A state of global equilibrium is established. The world is unrecognizable compared to the prime timeline, entirely shaped by the long-term consequences of ${scenario}. While external conflicts have subsided, underlying ideological tensions continue to simmer in major urban hubs.`,
        category: "culture",
        impactScore: 78
      }
    ],
    civilizations: [
      {
        name: "The New Coalition",
        capital: "Neo-Alexandria",
        government: "Technocratic Council",
        currency: "Quantum Credits (QCR)",
        militaryRanking: "Tier-1 Superpower",
        religion: "Secular Rationalism",
        architectureStyle: "Neo-Futuristic Glassmorphism",
        population: "1.2 Billion",
        slogan: "Precision. Progress. Unity.",
        imagePrompt: "futuristic city of Neo-Alexandria, towering sleek glass skyscrapers, glowing cyan energy conduits, dark cobalt sky, volumetric cinematic lighting, photorealistic 8k"
      },
      {
        name: "The Meridian Alliance",
        capital: "Aetheria",
        government: "Federal Republic",
        currency: "Meridian Aurum",
        militaryRanking: "Tier-2 Strategic Power",
        religion: "Pantheistic Ecological System",
        architectureStyle: "Organic Biophilic Integration",
        population: "840 Million",
        slogan: "In Harmony with the Stream.",
        imagePrompt: "organic biophilic floating city, lush hanging gardens integrated into futuristic architectural curves, soft golden sunlight, hyper-detailed fantasy architecture"
      }
    ],
    news: [
      {
        headline: "Quantum Ticker: Stability metrics reach 94.2% across major central hubs.",
        source: "Classified Broadcast Network",
        tickerText: "STABILITY_NORMAL // NO DIVERGENCE DETECTED IN SEC-4",
        impact: "moderate"
      },
      {
        headline: "Continental borders finalized under the Treaty of Neo-Alexandria.",
        source: "Global Annals",
        tickerText: "MAPS UPDATED // CHECK TACTICAL OVERLAY",
        impact: "high"
      }
    ],
    stats: {
      globalStability: 78,
      techProgress: 88,
      gdpDistribution: [
        { name: "The New Coalition", value: 55 },
        { name: "The Meridian Alliance", value: 30 },
        { name: "Independent Zones", value: 15 }
      ],
      militaryIndex: [
        { name: "The New Coalition", value: 92 },
        { name: "The Meridian Alliance", value: 68 },
        { name: "Independent Zones", value: 35 }
      ]
    },
    mapRegions: [
      { id: "NA", name: "North America Zone", controllingFaction: "The New Coalition", tensionLevel: 15, status: "Secure" },
      { id: "EU", name: "Eurasian Core", controllingFaction: "The New Coalition", tensionLevel: 45, status: "Military Supervision" },
      { id: "AF", name: "Meridian Biosphere", controllingFaction: "The Meridian Alliance", tensionLevel: 20, status: "Ecological Sanctuary" },
      { id: "AS", name: "Pan-Asian Collective", controllingFaction: "The Meridian Alliance", tensionLevel: 55, status: "Resource Dispute" }
    ],
    survivalOdds: {
      survivalChance: 68,
      dangerLevel: "Medium",
      likelyProfession: "Timeline Data Archivist",
      socialStatus: "Upper-Middle Technocrat",
      tip: "Avoid high-tension border zones in the Eurasian Core at all costs — the military patrols there operate under shoot-first protocols since the Consolidation Decree of Year 18. Keep your Quantum Credit reserves above 500 QCR at all times; citizens below that threshold are flagged for mandatory labor reassignment. If you find yourself near the Meridian border, carry ecological compliance documentation — the Alliance does not recognize Coalition citizenship without it."
    },
    documentary: {
      narratorSpeech: "In this alternate configuration of history, we see a world that took a radical turn. Stripped of the assumptions of our prime timeline, human civilization rebuilt itself not with steel and steam, but with light and glass. The great cities rose from the ashes of old ideologies, their spires reaching toward a sky that no longer belonged to nations, but to algorithms. And yet, beneath the gleaming surface of this new order, the old human hungers — for power, for meaning, for belonging — still pulse with an urgency that no amount of quantum computation can quiet.",
      sceneDescription: "Slow panoramic camera sweep over massive towering biophilic skyscrapers of Neo-Alexandria. Golden hour light hitting glass panels. Crowds of citizens in uniform mono-chromatic attire walk along elevated walkways between towers.",
      visualTheme: "Cinematic Warm Amber and Deep Gold tones.",
      imagePrompt: "slow panoramic sweep over massive biophilic skyscrapers, warm sunset glowing on holographic panels, hyper-realistic, highly detailed cinematic screenshot"
    },
    wikipedia: {
      title: "The Divergent Epoch",
      infobox: [
        { label: "Founded", value: "25 Years Post-Fracture" },
        { label: "Prime Factions", value: "New Coalition, Meridian Alliance" },
        { label: "Population", value: "3.8 Billion (est. Year 50)" },
        { label: "Global GDP Status", value: "Stable (92.4 Trillion QCR)" }
      ],
      intro: `The Divergent Epoch represents the historical era beginning with the Fracture event caused by ${scenario}, which completely restructured global geopolitical alliances, technical advancement, and social organization. Spanning from Year 0 (the moment of divergence) to the present day, the Epoch is characterized by the collapse of traditional nation-states, the rise of technocratic governance models, and the rapid acceleration of alternative technological paradigms. Historians within the New Coalition classify it as the most significant civilizational reset since the Bronze Age Collapse, while Meridian Alliance scholars argue it represents humanity's first genuine opportunity to build sustainable systems from first principles.`,
      sections: [
        {
          heading: "The Fracture",
          content: `The initial event that led to the Divergent Epoch — the moment where ${scenario} — remains a subject of intense archival study and political debate. What started as a localized timeline fluctuation quickly cascaded into global geopolitical restructuring as traditional nation-states struggled to adapt.`
        },
        {
          heading: "Establishment of the Technocracy",
          content: `By Year 15, traditional governmental models were largely replaced by technocratic assemblies focused on algorithmic resource distribution and ecological preservation. The transition saw significant regional resistance but eventually stabilized under the two primary global factions.`
        }
      ]
    },
    propaganda: [
      {
        title: "Neo-Alexandria Recruitment",
        slogan: "Secure the Future. Join the Technocracy Assembly today.",
        visualDescription: "An imposing dark navy poster featuring a stylized holographic eagle silhouette and glowing cyan data streams. The eagle's wings span the width of the poster, composed entirely of circuit-board patterns and flowing data visualization lines.",
        faction: "The New Coalition",
        imagePrompt: "minimalist propaganda poster for a technocratic empire, holographic digital eagle glowing cyan and deep violet, obsidian background, futuristic constructivism style"
      }
    ]
  };
}
