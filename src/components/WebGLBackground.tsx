"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070708);
    scene.fog = new THREE.FogExp2(0x070708, 0.015);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const camera = new THREE.PerspectiveCamera(
      32,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 12);

    const ambientLight = new THREE.AmbientLight(0x0a0a0c);
    scene.add(ambientLight);

    const silverLight = new THREE.DirectionalLight(0xffffff, 4.0);
    silverLight.position.set(6, 10, 6);
    scene.add(silverLight);

    const warmLight = new THREE.PointLight(0xffbbaa, 2.5, 18);
    warmLight.position.set(-5, -5, 5);
    scene.add(warmLight);

    const knotGeo = new THREE.TorusKnotGeometry(2.0, 0.65, 300, 48);
    const shaderUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0.0 }, // fixed at 0 for static/intro phase
      uColor: { value: new THREE.Color(0x040405) },
      uLightDirection: { value: silverLight.position },
      uLightColor: { value: new THREE.Color(0xefefff) },
      uWarmHighlightColor: { value: new THREE.Color(0xffaa77) }
    };

    const obsidianMaterial = new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader: `
        uniform float uTime;
        uniform float uScroll;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vPosition = position;
          float noiseFreq = 0.85 + uScroll * 1.15;
          float noiseAmp = 0.15 + uScroll * 0.25;
          float disp = snoise(position * noiseFreq + vec3(0.0, uTime * 0.38, 0.0)) * noiseAmp;
          
          vec3 displacedPosition = position + normal * disp;
          vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform vec3 uColor;
        uniform vec3 uLightDirection;
        uniform vec3 uLightColor;
        uniform vec3 uWarmHighlightColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          vec3 lightDir = normalize(uLightDirection);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfDir), 0.0), 50.0);
          vec3 specular = uLightColor * spec * 1.6;
          
          vec3 warmLightDir = normalize(vec3(sin(uTime * 0.4) * 3.5, -1.0, cos(uTime * 0.4) * 3.5));
          vec3 warmHalfDir = normalize(warmLightDir + viewDir);
          float warmSpec = pow(max(dot(normal, warmHalfDir), 0.0), 22.0);
          vec3 warmHighlight = uWarmHighlightColor * warmSpec * 0.8;
          
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.2);
          vec3 fresnelColor = vec3(0.88, 0.90, 0.98) * fresnel * 0.6;
          
          vec3 baseColor = uColor;
          float ao = 0.25 + 0.75 * max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);
          vec3 finalColor = baseColor * ao + specular + warmHighlight + fresnelColor;
          
          float depth = gl_FragCoord.z / gl_FragCoord.w;
          float fogDensity = 0.016 + uScroll * 0.024;
          float fogFactor = exp2(-fogDensity * fogDensity * depth * depth * 1.442695);
          fogFactor = clamp(fogFactor, 0.0, 1.0);
          
          vec3 fogColor = vec3(0.027, 0.027, 0.031);
          gl_FragColor = vec4(mix(fogColor, finalColor, fogFactor), 1.0);
        }
      `
    });

    const obsidianKnot = new THREE.Mesh(knotGeo, obsidianMaterial);
    scene.add(obsidianKnot);

    const gravityMaterial1 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 0.0,
      transmission: 0.99,
      ior: 1.33,
      thickness: 2.5,
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    });

    const gravityMaterial2 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.98,
      ior: 1.25,
      thickness: 2.0,
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    });

    const lensGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const gravityLens1 = new THREE.Mesh(lensGeo, gravityMaterial1);
    const gravityLens2 = new THREE.Mesh(lensGeo, gravityMaterial2);
    scene.add(gravityLens1);
    scene.add(gravityLens2);

    const particleCount = 3500;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    const pRadii = new Float32Array(particleCount);
    const pAngles = new Float32Array(particleCount);
    const pPhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 * 20.0;
      pAngles[i] = angle;
      pRadii[i] = 3.5 + Math.sin(angle * 0.12) * 1.5;
      pSpeeds[i] = (Math.random() * 0.01 + 0.005);
      pPhases[i] = Math.random() * Math.PI * 2;

      positions[i * 3] = Math.cos(angle) * pRadii[i];
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10.0;
      positions[i * 3 + 2] = Math.sin(angle) * pRadii[i];
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xe5eaff,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particleSystem);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      obsidianMaterial.uniforms.uTime.value = elapsed;

      obsidianKnot.rotation.y = elapsed * 0.06;
      obsidianKnot.rotation.z = elapsed * 0.04;

      const t = elapsed;
      gravityLens1.position.x = Math.sin(t * 0.32) * 3.6;
      gravityLens1.position.y = Math.cos(t * 0.38) * 2.0;
      gravityLens1.position.z = Math.sin(t * 0.24) * 2.2;

      gravityLens2.position.x = Math.cos(t * 0.42) * -3.6;
      gravityLens2.position.y = Math.sin(t * 0.30) * -2.0;
      gravityLens2.position.z = Math.cos(t * 0.28) * -2.2;

      const pArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        pAngles[i] += pSpeeds[i] * 0.015;
        const curRadius = pRadii[i] + Math.sin(t * 0.4 + pPhases[i]) * 0.15;
        pArr[idx] = Math.cos(pAngles[i]) * curRadius;
        pArr[idx + 1] += pSpeeds[i] * 0.35;
        pArr[idx + 2] = Math.sin(pAngles[i]) * curRadius;

        if (pArr[idx + 1] > 6.0) {
          pArr[idx + 1] = -6.0;
          pAngles[i] = Math.random() * Math.PI * 2;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      warmLight.position.x = Math.sin(t * 0.45) * 5.0;
      warmLight.position.z = Math.cos(t * 0.45) * 5.0;

      camera.position.x = Math.sin(t * 0.12) * 0.4;
      camera.position.y = Math.cos(t * 0.08) * 0.2;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 12.0, 0.08);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      knotGeo.dispose();
      obsidianMaterial.dispose();
      lensGeo.dispose();
      gravityMaterial1.dispose();
      gravityMaterial2.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full bg-[#070708]" 
      style={{ display: "block" }} 
    />
  );
}
