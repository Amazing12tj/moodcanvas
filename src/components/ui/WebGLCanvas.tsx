// src/components/ui/WebGLCanvas.tsx
import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import type { MoodState } from "../../types/mood";

interface WebGLCanvasProps {
  mood: MoodState;
  quality: {
    quality: "high" | "medium" | "low";
    particleCount: number;
    resolutionScale: number;
    effectsEnabled: boolean;
  };
  enabled: boolean;
  fallback: React.ReactElement;
}

const WebGLCanvas: React.FC<WebGLCanvasProps> = ({
  mood,
  quality,
  enabled,
  fallback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number>(0);

  // Refs for 3D objects
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const mainGeometryRef = useRef<THREE.Mesh | null>(null);
  const lightsRef = useRef<THREE.Light[]>([]);

  // Mood configurations for 3D effects
  const moodConfig = useMemo(() => {
    const configs = {
      creative: {
        primaryColor: 0x8b5cf6, // Purple
        secondaryColor: 0xec4899, // Pink
        geometry: "torus",
        movement: "flowing",
        particleDensity: 1.2,
        cameraPosition: { x: 5, y: 2, z: 8 },
      },
      melancholy: {
        primaryColor: 0x3b82f6, // Blue
        secondaryColor: 0x60a5fa, // Light Blue
        geometry: "icosahedron",
        movement: "gentle",
        particleDensity: 0.8,
        cameraPosition: { x: 0, y: -2, z: 10 },
      },
      energetic: {
        primaryColor: 0xef4444, // Red
        secondaryColor: 0xf59e0b, // Amber
        geometry: "sphere",
        movement: "explosive",
        particleDensity: 1.5,
        cameraPosition: { x: 0, y: 0, z: 6 },
      },
      happy: {
        primaryColor: 0x10b981, // Emerald
        secondaryColor: 0xfbbf24, // Yellow
        geometry: "dodecahedron",
        movement: "bouncy",
        particleDensity: 1.1,
        cameraPosition: { x: 4, y: 3, z: 7 },
      },
      calm: {
        primaryColor: 0x06b6d4, // Cyan
        secondaryColor: 0x8b5cf6, // Purple
        geometry: "plane",
        movement: "slow",
        particleDensity: 0.7,
        cameraPosition: { x: 0, y: 0, z: 12 },
      },
      neutral: {
        primaryColor: 0x6b7280, // Gray
        secondaryColor: 0x9ca3af, // Light Gray
        geometry: "octahedron",
        movement: "balanced",
        particleDensity: 1.0,
        cameraPosition: { x: 0, y: 0, z: 10 },
      },
    };

    return configs[mood.type] || configs.neutral;
  }, [mood.type]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Check WebGL support
    try {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) {
        console.warn("WebGL not supported");
        return;
      }
    } catch (error) {
      console.warn("WebGL initialization failed:", error);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.set(
      moodConfig.cameraPosition.x,
      moodConfig.cameraPosition.y,
      moodConfig.cameraPosition.z
    );
    cameraRef.current = camera;

    // Renderer setup with quality settings
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.quality === "high",
      alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, quality.quality === "high" ? 2 : 1)
    );
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    lightsRef.current.push(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    lightsRef.current.push(directionalLight);

    // Create visual elements
    createParticleSystem();
    createMainGeometry();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !canvas) return;

      cameraRef.current.aspect = canvas.clientWidth / canvas.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      updateScene();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);

      // Cleanup Three.js objects
      if (particleSystemRef.current) {
        scene.remove(particleSystemRef.current);
        const particles = particleSystemRef.current as THREE.Points;
        particles.geometry.dispose();
        if (Array.isArray(particles.material)) {
          particles.material.forEach((material) => material.dispose());
        } else {
          particles.material.dispose();
        }
      }

      if (mainGeometryRef.current) {
        scene.remove(mainGeometryRef.current);
        mainGeometryRef.current.geometry.dispose();
        if (mainGeometryRef.current.material) {
          if (Array.isArray(mainGeometryRef.current.material)) {
            mainGeometryRef.current.material.forEach((material) =>
              material.dispose()
            );
          } else {
            mainGeometryRef.current.material.dispose();
          }
        }
      }

      lightsRef.current.forEach((light) => {
        scene.remove(light);
      });
      lightsRef.current = [];

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [enabled, quality.quality]);

  const createParticleSystem = () => {
    if (!sceneRef.current) return;

    const particleCount = Math.floor(
      quality.particleCount * moodConfig.particleDensity
    );
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Position particles in a sphere
      const radius = 4 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Colors based on mood
      const primaryColor = new THREE.Color(moodConfig.primaryColor);
      const secondaryColor = new THREE.Color(moodConfig.secondaryColor);
      const mixFactor = Math.random();

      const color = primaryColor.clone().lerp(secondaryColor, mixFactor);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: quality.quality === "high" ? 0.1 : 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    sceneRef.current.add(points);
    particleSystemRef.current = points;
  };

  const createMainGeometry = () => {
    if (!sceneRef.current) return;

    // Remove existing geometry
    if (mainGeometryRef.current) {
      sceneRef.current.remove(mainGeometryRef.current);
      mainGeometryRef.current.geometry.dispose();
      if (mainGeometryRef.current.material) {
        if (Array.isArray(mainGeometryRef.current.material)) {
          mainGeometryRef.current.material.forEach((material) =>
            material.dispose()
          );
        } else {
          mainGeometryRef.current.material.dispose();
        }
      }
    }

    let geometry: THREE.BufferGeometry;

    switch (moodConfig.geometry) {
      case "sphere":
        geometry = new THREE.SphereGeometry(
          1.5,
          quality.quality === "high" ? 32 : 16,
          quality.quality === "high" ? 32 : 16
        );
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(
          1.5,
          0.4,
          quality.quality === "high" ? 16 : 8,
          quality.quality === "high" ? 100 : 50
        );
        break;
      case "icosahedron":
        geometry = new THREE.IcosahedronGeometry(
          1.5,
          quality.quality === "high" ? 2 : 1
        );
        break;
      case "dodecahedron":
        geometry = new THREE.DodecahedronGeometry(
          1.5,
          quality.quality === "high" ? 1 : 0
        );
        break;
      case "octahedron":
        geometry = new THREE.OctahedronGeometry(
          1.5,
          quality.quality === "high" ? 1 : 0
        );
        break;
      default: // plane
        geometry = new THREE.PlaneGeometry(3, 3);
    }

    const material = new THREE.MeshPhongMaterial({
      color: moodConfig.primaryColor,
      transparent: true,
      opacity: 0.8,
      wireframe: quality.effectsEnabled && mood.intensity > 0.7,
      shininess: 80,
    });

    const mesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(mesh);
    mainGeometryRef.current = mesh;
  };

  const updateScene = () => {
    const time = Date.now() * 0.001;
    const intensity = mood.intensity;

    // Update particles
    if (particleSystemRef.current) {
      const positions = (
        particleSystemRef.current.geometry.attributes
          .position as THREE.BufferAttribute
      ).array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        switch (moodConfig.movement) {
          case "explosive":
            positions[i] += Math.sin(time * 2 + x) * intensity * 0.05;
            positions[i + 1] += Math.cos(time * 2 + y) * intensity * 0.05;
            positions[i + 2] += Math.sin(time + z) * intensity * 0.03;
            break;
          case "flowing":
            positions[i] += Math.sin(time * 0.8 + y) * intensity * 0.02;
            positions[i + 1] += Math.cos(time * 0.8 + x) * intensity * 0.02;
            positions[i + 2] += Math.sin(time * 0.5 + z) * intensity * 0.01;
            break;
          case "bouncy":
            positions[i] += Math.sin(time * 1.5 + x) * intensity * 0.03;
            positions[i + 1] += Math.cos(time * 1.2 + y) * intensity * 0.03;
            break;
          case "gentle":
            positions[i] += Math.sin(time * 0.5 + x) * intensity * 0.01;
            positions[i + 1] += Math.cos(time * 0.5 + y) * intensity * 0.01;
            break;
          default: // balanced
            positions[i] += Math.sin(time + x) * intensity * 0.015;
            positions[i + 1] += Math.cos(time + y) * intensity * 0.015;
        }
      }

      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Update main geometry
    if (mainGeometryRef.current) {
      mainGeometryRef.current.rotation.x += 0.01 * intensity;
      mainGeometryRef.current.rotation.y += 0.005 * intensity;

      // Pulsing scale based on mood intensity
      const scale = 1 + Math.sin(time * 1.5) * 0.1 * intensity;
      mainGeometryRef.current.scale.set(scale, scale, scale);
    }

    // Camera movement
    if (cameraRef.current) {
      cameraRef.current.position.x =
        moodConfig.cameraPosition.x + Math.sin(time * 0.3) * 1.5;
      cameraRef.current.position.y =
        moodConfig.cameraPosition.y + Math.cos(time * 0.2) * 1;
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  // Update when mood changes
  useEffect(() => {
    if (!enabled) return;

    createMainGeometry();

    // Update particle colors
    if (particleSystemRef.current) {
      const colors = (
        particleSystemRef.current.geometry.attributes
          .color as THREE.BufferAttribute
      ).array as Float32Array;
      const primaryColor = new THREE.Color(moodConfig.primaryColor);
      const secondaryColor = new THREE.Color(moodConfig.secondaryColor);

      for (let i = 0; i < colors.length; i += 3) {
        const mixFactor = Math.random();
        const color = primaryColor.clone().lerp(secondaryColor, mixFactor);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      particleSystemRef.current.geometry.attributes.color.needsUpdate = true;

      // Update particle material color
      const material = particleSystemRef.current
        .material as THREE.PointsMaterial;
      material.color.set(moodConfig.primaryColor);
    }
  }, [moodConfig, mood.intensity, enabled]);

  if (!enabled) {
    return fallback;
  }

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-auto bg-transparent rounded-lg"
        style={{
          width: "100%",
          height: "400px",
          imageRendering: quality.quality === "low" ? "pixelated" : "auto",
        }}
      />

      {/* WebGL Status Overlay */}
      <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
        WebGL • {quality.quality.toUpperCase()}
      </div>

      {/* Mood Info Overlay */}
      <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
        {mood.type} • {Math.round(mood.intensity * 100)}%
      </div>
    </div>
  );
};

export default WebGLCanvas;
