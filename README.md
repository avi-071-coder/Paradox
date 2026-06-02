# PARADOX Alternate Reality Simulation Engine

PARADOX is a high-fidelity alternate history simulation engine. By providing a "What if" scenario, PARADOX uses generative AI (Google Gemini) to synthesize deeply detailed alternate timelines, including geopolitical shifts, cultural divergence, technological advancements, and realistic newspaper headlines.

The engine goes a step further by generating highly specific, cinematic image prompts for each aspect of the simulation (cities, propaganda, documentary scenes) and renders them in real-time using the Hugging Face Serverless Inference API (powered by FLUX.1).

## Features

- **Interactive Timeline Engine**: Supply any "What if" prompt (e.g., "What if the internet was never discovered?") and explore an incredibly detailed, JSON-structured timeline.
- **Dynamic Image Generation**: Uses `FLUX.1-schnell` via the Hugging Face API to visualize the simulated worlds dynamically.
- **Glassmorphism UI**: Beautiful, dark-mode, neo-futuristic user interface to present the timeline in an immersive format.
- **Fallbacks**: Gracefully falls back to high-quality mock data if API limits are reached.

## Getting Started

### Prerequisites
You will need API keys for:
1. **Google Gemini**: For generating the text simulation.
2. **Hugging Face**: For generating the images via the free Inference API.

### Environment Setup
Create a `.env.local` file in the root of the directory and add your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_access_token_here
```

### Installation & Running

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser and click "Start Simulation" to begin.

## Tech Stack
- Next.js (App Router)
- React
- TailwindCSS & Framer Motion (Styling & Animations)
- Google Gemini (`@google/genai`)
- Hugging Face Inference API (`black-forest-labs/FLUX.1-schnell`)
