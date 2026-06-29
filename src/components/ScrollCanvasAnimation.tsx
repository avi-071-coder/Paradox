"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";

const TOTAL_FRAMES = 168;
const BATCH_SIZE = 4;

export function ScrollCanvasAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);
  const currentTextureRef = useRef<THREE.Texture | null>(null);
  
  const targetFrameRef = useRef<number>(1);
  const smoothFrameRef = useRef<number>(1);
  const [loadedCount, setLoadedCount] = useState(0);

  // Preload frames in background
  useEffect(() => {
    let isMounted = true;

    const decodeImage = async (img: HTMLImageElement): Promise<void> => {
      if ("decode" in img) {
        try {
          await img.decode();
        } catch (e) {
          // Ignore decode errors
        }
      }
    };

    const img1 = new Image();
    img1.src = `/ezgif-2ef0347bc31d0948-jpg/ezgif-frame-001.jpg`;
    img1.onload = async () => {
      if (!isMounted) return;
      await decodeImage(img1);
      if (!isMounted) return;
      
      imagesRef.current[0] = img1;
      lastDrawnImageRef.current = img1;
      setLoadedCount(1);

      const queue = Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => i + 2);
      
      const loadNext = () => {
        if (!isMounted || queue.length === 0) return;
        const idx = queue.shift()!;
        
        const img = new Image();
        img.src = `/ezgif-2ef0347bc31d0948-jpg/ezgif-frame-${String(idx).padStart(3, "0")}.jpg`;
        
        img.onload = async () => {
          if (!isMounted) return;
          await decodeImage(img);
          if (!isMounted) return;
          
          imagesRef.current[idx - 1] = img;
          setLoadedCount(prev => prev + 1);
          loadNext();
        };

        img.onerror = () => {
          loadNext();
        };
      };

      for (let w = 0; w < BATCH_SIZE; w++) {
        loadNext();
      }
    };

    return () => {
      isMounted = false;
    };
  }, []);

  // WebGL Shader setup for rendering & animating JPEG contents
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Initial placeholder texture
    const texture = new THREE.Texture();
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    currentTextureRef.current = texture;

    if (lastDrawnImageRef.current) {
      texture.image = lastDrawnImageRef.current;
      texture.needsUpdate = true;
    }

    const uniforms = {
      uTexture: { value: texture },
      uTime: { value: 0.0 },
      uTextureScale: { value: new THREE.Vector2(1, 1) }
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        uniform vec2 uTextureScale;
        void main() {
          vUv = (uv - 0.5) * uTextureScale + 0.5;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 center = vec2(0.5, 0.5);
          vec2 toCenter = uv - center;
          float dist = length(toCenter);

          // 1. Soft rotation for the central dark circles area
          float rotationStrength = smoothstep(0.48, 0.02, dist);
          float angle = uTime * 0.05 * rotationStrength;
          float cosA = cos(angle);
          float sinA = sin(angle);
          vec2 rotatedUV = center + vec2(
            toCenter.x * cosA - toCenter.y * sinA,
            toCenter.x * sinA + toCenter.y * cosA
          );

          // 2. Pre-sample to check brightness (detect white flowing strands vs dark background)
          vec4 tempCol = texture2D(uTexture, rotatedUV);
          float brightness = (tempCol.r + tempCol.g + tempCol.b) / 3.0;

          // 3. Liquid flowing wave distortion on the white strands
          vec2 finalUV = rotatedUV;
          if (brightness > 0.28) {
            float waveX = sin(rotatedUV.y * 32.0 + uTime * 1.5) * 0.005;
            float waveY = cos(rotatedUV.x * 24.0 - uTime * 1.8) * 0.003;
            
            // Apply fluid drift along the bright strands
            vec2 flowOffset = vec2(waveX, waveY) * smoothstep(0.28, 0.75, brightness);
            finalUV += flowOffset;
          }

          // Sample final warped color
          vec4 finalColor = texture2D(uTexture, finalUV);

          // Soft vignette blend
          float vignette = smoothstep(0.85, 0.45, length(uv - 0.5));
          finalColor.rgb *= mix(0.18, 1.0, vignette);

          gl_FragColor = finalColor;
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    // Calculate Aspect Ratio Cover Fit
    const updateAspect = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);

      // Default aspect ratio of the pre-rendered frames (16:9)
      const iw = 1920;
      const ih = 1080;
      const canvasAspect = w / h;
      const imageAspect = iw / ih;

      let scaleX = 1;
      let scaleY = 1;

      if (canvasAspect > imageAspect) {
        scaleY = imageAspect / canvasAspect;
      } else {
        scaleX = canvasAspect / imageAspect;
      }

      uniforms.uTextureScale.value.set(scaleX, scaleY);
    };

    window.addEventListener("resize", updateAspect);
    updateAspect();

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // Smoothly LERP to the target frame index on scroll
      const diff = targetFrameRef.current - smoothFrameRef.current;
      if (Math.abs(diff) < 0.005) {
        smoothFrameRef.current = targetFrameRef.current;
      } else {
        smoothFrameRef.current += diff * 0.22;
      }

      const activeIdx = Math.round(smoothFrameRef.current);
      const img = imagesRef.current[activeIdx - 1] || lastDrawnImageRef.current || imagesRef.current[0];
      
      if (img && img.complete && texture.image !== img) {
        texture.image = img;
        texture.needsUpdate = true;
        lastDrawnImageRef.current = img;
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      window.removeEventListener("resize", updateAspect);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      shaderMaterial.dispose();
      texture.dispose();
      canvas.remove();
    };
  }, [loadedCount]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const frameIndex = Math.round(latest * (TOTAL_FRAMES - 1)) + 1;
    targetFrameRef.current = Math.min(TOTAL_FRAMES, Math.max(1, frameIndex));
  });

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full" 
      style={{ display: "block" }} 
    />
  );
}
