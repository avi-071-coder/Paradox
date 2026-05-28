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

    if (!ai) {
      console.warn("GEMINI_API_KEY is not defined. Using high-fidelity mock data fallback.");
      return NextResponse.json(getFallbackData(scenario));
    }

    const prompt = `
      You are the PARADOX Alternate Reality Simulation Engine.
      Generate a highly detailed, immersive alternate history simulation data structure in valid JSON format based on the following hypothetical scenario:
      "${scenario}"

      The JSON response MUST follow this exact TypeScript interface:
      {
        "title": string,
        "description": string,
        "divergencePoint": string,
        "timeline": Array<{
          "year": string,
          "title": string,
          "description": string,
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
          "imagePrompt": string // descriptive prompt for an AI-generated scene representing the civilization flag, capital, or architecture
        }>,
        "news": Array<{
          "headline": string,
          "source": string,
          "tickerText": string,
          "impact": "critical" | "high" | "moderate"
        }>,
        "stats": {
          "globalStability": number, // 0-100
          "techProgress": number, // 0-100
          "gdpDistribution": Array<{ name: string, value: number }>,
          "militaryIndex": Array<{ name: string, value: number }>
        },
        "mapRegions": Array<{
          "id": string,
          "name": string,
          "controllingFaction": string,
          "tensionLevel": number, // 0-100
          "status": string
        }>,
        "survivalOdds": {
          "survivalChance": number, // 0-100
          "dangerLevel": "Low" | "Medium" | "High" | "Extremely High" | "Absolute Certain Death",
          "likelyProfession": string,
          "socialStatus": string,
          "tip": string
        },
        "documentary": {
          "narratorSpeech": string,
          "sceneDescription": string,
          "visualTheme": string,
          "imagePrompt": string // descriptive prompt for a cinematic background matching the scene
        },
        "wikipedia": {
          "title": string,
          "infobox": Array<{ label: string, value: string }>,
          "intro": string,
          "sections": Array<{ heading: string, content: string }>
        },
        "propaganda": Array<{
          "title": string,
          "slogan": string,
          "visualDescription": string,
          "faction": string,
          "imagePrompt": string // descriptive prompt for the propaganda poster
        }>
      }

      CRITICAL JSON FORMATTING RULES:
      1. Escape all internal double quotes (e.g. "He said \\"hello\\"").
      2. Do not use trailing commas.
      3. Keep paragraphs concise. Do not write overly long essays.
      4. Return ONLY the raw valid JSON string. Do not wrap it in markdown code blocks or write any introductory/concluding text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      }
    });

    let responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    // Clean up markdown code blocks if the model wrapped the JSON
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const data = JSON.parse(responseText);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini simulation generation failed:", error);
    // If API execution fails or keys are missing/incorrect, fall back gracefully to a robust generator
    return NextResponse.json(getFallbackData(scenario || "Alternate Reality"));
  }
}

function getFallbackData(scenario: string) {
  // Generate highly realistic mock data based on the scenario words to make it feel alive even without Gemini API key
  const title = `Timeline: ${scenario.replace(/^What if\s+/i, "")}`;
  
  return {
    title,
    description: `A simulated reality exploring the timeline where: "${scenario}". Built by the PARADOX Classified Engine.`,
    divergencePoint: "Initial divergent event occurred due to timeline fluctuations.",
    timeline: [
      {
        year: "1 Year Post-DivergencePoint",
        title: "The Initial Fracture",
        description: "The primary point of divergence creates a rapid geopolitical shift. Former allies declare neutrality as the new order stabilizes.",
        category: "politics",
        impactScore: 85
      },
      {
        year: "10 Years Post-DivergencePoint",
        title: "Technological Shift",
        description: "Focus redirects toward alternative energy systems and specialized engineering to sustain the altered world dynamics.",
        category: "invention",
        impactScore: 90
      },
      {
        year: "25 Years Post-DivergencePoint",
        title: "The Great Realignment",
        description: "New power blocs finalize continental alliances. Ancient territories are reclaimed under modern banners.",
        category: "politics",
        impactScore: 95
      },
      {
        year: "50 Years Post-DivergencePoint",
        title: "A Fragile Pax",
        description: "A state of global equilibrium is established. The world is unrecognizable compared to the prime timeline, yet stable.",
        category: "society",
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
      tip: "Avoid high-tension border zones in the Eurasian Core. Maintain high energy credits buffer."
    },
    documentary: {
      narratorSpeech: "In this alternate configuration of history, we see a world that took a radical turn. Stripped of the assumptions of our prime timeline, human civilization rebuilt itself not with steel and steam, but with light and glass.",
      sceneDescription: "Slow panoramic camera sweep over massive towering biophilic skyscrapers of Neo-Alexandria. Golden hour light hitting glass panels.",
      visualTheme: "Cinematic Warm Amber and Deep Gold tones.",
      imagePrompt: "slow panoramic sweep over massive biophilic skyscrapers, warm sunset glowing on holographic panels, hyper-realistic, highly detailed cinematic screenshot"
    },
    wikipedia: {
      title: "The Divergent Epoch",
      infobox: [
        { label: "Founded", value: "25 Years Post-Fracture" },
        { label: "Prime Factions", value: "New Coalition, Meridian Alliance" },
        { label: "Global GDP Status", value: "Stable (92.4 Trillion QCR)" }
      ],
      intro: "The Divergent Epoch represents the historical era beginning with the Fracture event, which completely restructured global geopolitical alliances, technical advancement, and social organization.",
      sections: [
        {
          heading: "The Fracture",
          content: "The initial event that led to the Divergent Epoch remains a subject of archival study. What started as localized timeline fluctuations quickly cascaded into global geopolitical restructuring."
        },
        {
          heading: "Establishment of the Technocracy",
          content: "By year 15, traditional governmental models were largely replaced by technocratic assemblies, focusing on algorithmic resource distribution and ecological preservation."
        }
      ]
    },
    propaganda: [
      {
        title: "Neo-Alexandria Recruitment",
        slogan: "Secure the Future. Join the Technocracy Assembly today.",
        visualDescription: "An imposing dark navy poster featuring a stylized holographic eagle silhouette and glowing cyan data streams.",
        faction: "The New Coalition",
        imagePrompt: "minimalist propaganda poster for a technocratic empire, holographic digital eagle glowing cyan and deep violet, obsidian background, futuristic constructivism style"
      }
    ]
  };
}
