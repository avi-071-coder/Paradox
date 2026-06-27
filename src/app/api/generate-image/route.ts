import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Hugging Face API key not configured" }, { status: 500 });
    }

    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    // Multi-stage pipeline:
    // 1. Try Google Imagen 3 (via Gemini API Key)
    // 2. Try Hugging Face Serverless Inference (FLUX)
    // 3. Try Pollinations AI
    // 4. Try LoremFlickr (failsafe)
    
    const hfUrl = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
    const safePrompt = encodeURIComponent(prompt.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 100));
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1200&height=800&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;

    // Keywords for LoremFlickr
    const cleanKeywords = prompt
      .toLowerCase()
      .replace(/cinematic|masterpiece|photorealistic|dramatic|lighting|dark|aesthetic|alternate-timeline|history|what|if|scenario/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word: string) => word.length > 2)
      .slice(0, 3)
      .join(",");
    const fallbackFlickrUrl = `https://loremflickr.com/1200/800/${cleanKeywords || "history,technology"}/all`;

    let response;
    let success = false;

    // Stage 1: Google Imagen 3
    if (geminiApiKey) {
      try {
        console.log(`[IMAGE_ENGINE] Stage 1: Querying Google Imagen 3 via Gemini API...`);
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiApiKey}`;
        
        const imgResponse = await fetch(imagenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "16:9",
              outputMimeType: "image/jpeg"
            }
          })
        });

        if (imgResponse.ok) {
          const json = await imgResponse.json();
          const base64Image = json.predictions?.[0]?.bytesBase64Encoded;
          if (base64Image) {
            console.log(`[IMAGE_ENGINE] Stage 1 (Google Imagen 3) succeeded!`);
            const buffer = Buffer.from(base64Image, 'base64');
            return new NextResponse(buffer, {
              headers: { 
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable" 
              }
            });
          }
        } else {
          const errorText = await imgResponse.text();
          console.warn("[IMAGE_ENGINE] Stage 1 (Google Imagen 3) API returned error status:", imgResponse.status);
        }
      } catch (err) {
        console.warn("[IMAGE_ENGINE] Stage 1 (Google Imagen 3) call failed:", err);
      }
    }

    // Stage 2: Hugging Face (FLUX)
    if (hfApiKey) {
      try {
        console.log(`[IMAGE_ENGINE] Stage 2: Querying Hugging Face (FLUX) via Router for: "${prompt.substring(0, 50)}..."`);
        
        let hfRetries = 2;
        while (hfRetries >= 0) {
          response = await fetch(hfUrl, {
            headers: {
              Authorization: `Bearer ${hfApiKey}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
          });

          if (response.ok) {
            console.log(`[IMAGE_ENGINE] Stage 2 (Hugging Face FLUX) succeeded!`);
            success = true;
            break;
          }

          const errText = await response.text();
          console.warn(`[IMAGE_ENGINE] Stage 2 attempt failed (Status ${response.status}):`, errText);
          
          if (response.status === 503 && hfRetries > 0) {
            // Model loading, wait 3.5s and retry
            await new Promise(r => setTimeout(r, 3500));
            hfRetries--;
          } else {
            break;
          }
        }
      } catch (err) {
        console.warn("[IMAGE_ENGINE] Stage 2 network call failed:", err);
      }
    }

    // Stage 3: Pollinations AI (if HF failed)
    if (!success) {
      try {
        console.log(`[IMAGE_ENGINE] Stage 2 failed. Falling back to Stage 3 (Pollinations AI)...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        response = await fetch(pollinationsUrl, { 
          method: "GET",
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const contentType = response.headers.get("content-type") || "";
        if (response.ok && !contentType.includes("application/json")) {
          console.log(`[IMAGE_ENGINE] Stage 3 (Pollinations AI) succeeded!`);
          success = true;
        } else {
          throw new Error("Pollinations rate limited or failed");
        }
      } catch (err) {
        console.warn("[IMAGE_ENGINE] Stage 3 (Pollinations AI) failed or timed out:", err);
      }
    }

    // Stage 4: LoremFlickr (Absolute Last Resort)
    if (!success) {
      try {
        console.log(`[IMAGE_ENGINE] Stage 3 failed. Falling back to Stage 4 (LoremFlickr fallback)...`);
        response = await fetch(fallbackFlickrUrl, { method: "GET" });
        if (response.ok) {
          console.log(`[IMAGE_ENGINE] Stage 4 (LoremFlickr fallback) loaded.`);
          success = true;
        }
      } catch (err) {
        console.error("[IMAGE_ENGINE] Stage 4 (LoremFlickr) call failed:", err);
      }
    }

    if (!success || !response || !response.ok) {
      return NextResponse.json({ error: "Failed to generate any image asset" }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
