// src/hooks/useCanvasRenderer.ts
import { useCallback, useRef, useEffect } from 'react';
import type { MoodState } from '../types/mood';

interface CanvasBrush {
  color: string;
  size: number;
  opacity: number;
  flow: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export const useCanvasRenderer = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastMoodRef = useRef<MoodState>();

  const getBrushConfig = useCallback((mood: MoodState): CanvasBrush => {
    const configs: Record<string, CanvasBrush> = {
      creative: { color: '#8B5CF6', size: 4, opacity: 0.8, flow: 0.1 },
      melancholy: { color: '#3B82F6', size: 2, opacity: 0.6, flow: 0.05 },
      energetic: { color: '#EC4899', size: 6, opacity: 0.9, flow: 0.2 },
      neutral: { color: '#6B7280', size: 3, opacity: 0.7, flow: 0.08 }
    };
    return configs[mood.type] || configs.neutral;
  }, []);

  const initializeParticles = useCallback((mood: MoodState, canvas: HTMLCanvasElement): Particle[] => {
    const count = Math.floor(mood.intensity * 100 + 20);
    return Array.from({ length: count }, (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * mood.intensity * 4,
      vy: (Math.random() - 0.5) * mood.intensity * 4,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 100,
      size: Math.random() * 3 + 1
    }));
  }, []);

  const updateParticle = useCallback((particle: Particle, mood: MoodState, brush: CanvasBrush) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life++;

    // Reset particle if it dies or goes off screen
    if (particle.life > particle.maxLife || 
        particle.x < -50 || particle.x > 1050 || 
        particle.y < -50 || particle.y > 850) {
      particle.x = Math.random() * 1000;
      particle.y = Math.random() * 800;
      particle.life = 0;
      particle.vx = (Math.random() - 0.5) * mood.intensity * 4;
      particle.vy = (Math.random() - 0.5) * mood.intensity * 4;
    }
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, brush: CanvasBrush) => {
    const lifeRatio = particle.life / particle.maxLife;
    const alpha = brush.opacity * (1 - lifeRatio);
    
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    
    // Convert hex color to rgba with alpha
    const hexToRgba = (hex: string, alpha: number): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    ctx.fillStyle = hexToRgba(brush.color, alpha);
    ctx.fill();
  }, []);

  const renderMood = useCallback((mood: MoodState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Avoid re-initializing if mood hasn't changed significantly
    const moodChanged = !lastMoodRef.current || 
                       lastMoodRef.current.type !== mood.type || 
                       Math.abs(lastMoodRef.current.intensity - mood.intensity) > 0.1;

    if (!moodChanged) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const brush = getBrushConfig(mood);
    
    // Cancel previous animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Initialize particles based on mood
    particlesRef.current = initializeParticles(mood, canvas);
    lastMoodRef.current = { ...mood }; // Create a copy to avoid reference issues

    const animate = () => {
      // Clear with fade effect
      ctx.fillStyle = `rgba(15, 23, 42, ${0.05})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        updateParticle(particle, mood, brush);
        drawParticle(ctx, particle, brush);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [canvasRef, getBrushConfig, initializeParticles, updateParticle, drawParticle]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgb(15, 23, 42)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    particlesRef.current = [];
    lastMoodRef.current = undefined;
  }, [canvasRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { renderMood, clearCanvas };
};