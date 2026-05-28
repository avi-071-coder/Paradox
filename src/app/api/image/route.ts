import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt");
  const seed = searchParams.get("seed");

  if (!prompt) {
    return new NextResponse("Prompt is required", { status: 400 });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    console.error("HUGGINGFACE_API_KEY is missing");
    return new NextResponse("API Configuration Error: Hugging Face Token missing", { status: 500 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    // We can append seed to prompt for some variance control if provided
    const finalPrompt = seed ? `${prompt} (seed: ${seed})` : prompt;

    // Use FLUX.1-schnell which is high quality and heavily supported on HF's free tier
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: finalPrompt }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  } catch (error: any) {
    console.error("Image generation proxy error:", error);
    return new NextResponse("Image generation failed", { status: 500 });
  }
}
