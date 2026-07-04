"use client";

import { useEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

const TOTAL_FRAMES = 168;
const BATCH_SIZE = 8;

export function ScrollCanvasAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const isLoadedRef = useRef<boolean[]>(new Array(TOTAL_FRAMES + 1).fill(false));
  
  const targetFrameRef = useRef<number>(1);
  const smoothFrameRef = useRef<number>(1);

  // Preload frames
  useEffect(() => {
    let isMounted = true;
    const queue = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1);

    const loadNext = () => {
      if (!isMounted || queue.length === 0) return;
      const idx = queue.shift()!;
      
      const img = new Image();
      img.src = `/ezgif-2ef0347bc31d0948-jpg/ezgif-frame-${String(idx).padStart(3, "0")}.jpg`;
      img.onload = () => {
        if (!isMounted) return;
        isLoadedRef.current[idx] = true;
        imagesRef.current[idx] = img;
        loadNext();
      };
      img.onerror = () => {
        if (!isMounted) return;
        loadNext();
      };
    };

    for (let i = 0; i < BATCH_SIZE; i++) {
      loadNext();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Smooth interpolation for silky scrolling
      const diff = targetFrameRef.current - smoothFrameRef.current;
      if (Math.abs(diff) < 0.01) {
        smoothFrameRef.current = targetFrameRef.current;
      } else {
        smoothFrameRef.current += diff * 0.15;
      }

      let activeIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(smoothFrameRef.current)));
      
      // Fallback to nearest loaded frame to prevent flickering
      if (!isLoadedRef.current[activeIdx]) {
        let found = false;
        for (let i = activeIdx; i >= 1; i--) {
          if (isLoadedRef.current[i]) {
            activeIdx = i;
            found = true;
            break;
          }
        }
        if (!found) {
           for (let i = activeIdx + 1; i <= TOTAL_FRAMES; i++) {
             if (isLoadedRef.current[i]) {
               activeIdx = i;
               break;
             }
           }
        }
      }

      const img = imagesRef.current[activeIdx];
      if (img && isLoadedRef.current[activeIdx]) {
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        let renderWidth = width;
        let renderHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasAspect > imgAspect) {
          renderHeight = width / imgAspect;
          offsetY = (height - renderHeight) / 2;
        } else {
          renderWidth = height * imgAspect;
          offsetX = (width - renderWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
      } else {
        ctx.fillStyle = "#070708";
        ctx.fillRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const frameIndex = Math.round(latest * (TOTAL_FRAMES - 1)) + 1;
    targetFrameRef.current = Math.min(TOTAL_FRAMES, Math.max(1, frameIndex));
  });

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ display: "block" }} 
    />
  );
}
