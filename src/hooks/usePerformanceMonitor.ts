// src/hooks/usePerformanceMonitor.ts
import { useState, useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  memory: number;
  particleCount: number;
  renderTime: number;
}

export const usePerformanceMonitor = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    particleCount: 0,
    renderTime: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastFpsUpdateRef = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const updateMetrics = () => {
      frameCountRef.current++;
      const currentTime = performance.now();

      // Update FPS every second (reduced frequency)
      if (currentTime - lastFpsUpdateRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastFpsUpdateRef.current));
        
        setMetrics(prev => ({
          fps,
          memory: (performance as any).memory?.usedJSHeapSize || prev.memory,
          particleCount: prev.particleCount, // Keep previous value unless specifically updated
          renderTime: currentTime - lastTimeRef.current
        }));

        frameCountRef.current = 0;
        lastFpsUpdateRef.current = currentTime;
      }

      lastTimeRef.current = currentTime;
      animationId = requestAnimationFrame(updateMetrics);
    };

    // Start with a small delay to avoid immediate updates
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(updateMetrics);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return metrics;
};