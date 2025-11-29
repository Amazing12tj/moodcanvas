// src/hooks/useAdaptiveQuality.ts
import { useState, useEffect, useRef } from 'react';
import type { PerformanceMetrics } from './usePerformanceMonitor';

export interface QualitySettings {
  quality: 'high' | 'medium' | 'low';
  particleCount: number;
  resolutionScale: number;
  effectsEnabled: boolean;
}

export const useAdaptiveQuality = (metrics: PerformanceMetrics): QualitySettings => {
  const [quality, setQuality] = useState<QualitySettings>({
    quality: 'high',
    particleCount: 2000,
    resolutionScale: 1,
    effectsEnabled: true
  });

  // Use refs to track previous values and avoid unnecessary updates
  const prevFpsRef = useRef(metrics.fps);
  const prevQualityRef = useRef(quality.quality);

  useEffect(() => {
    // Only update if FPS changed significantly and quality needs to change
    const fpsChanged = Math.abs(metrics.fps - prevFpsRef.current) > 5;
    const shouldDowngrade = metrics.fps < 30 && quality.quality !== 'low';
    const shouldUpgradeToMedium = metrics.fps >= 45 && metrics.fps < 60 && quality.quality !== 'medium';
    const shouldUpgradeToHigh = metrics.fps >= 60 && quality.quality !== 'high';

    if (fpsChanged && (shouldDowngrade || shouldUpgradeToMedium || shouldUpgradeToHigh)) {
      let newQuality: QualitySettings;
      
      if (shouldDowngrade) {
        newQuality = {
          quality: 'low',
          particleCount: 500,
          resolutionScale: 0.5,
          effectsEnabled: false
        };
      } else if (shouldUpgradeToMedium) {
        newQuality = {
          quality: 'medium',
          particleCount: 1000,
          resolutionScale: 0.75,
          effectsEnabled: true
        };
      } else {
        newQuality = {
          quality: 'high',
          particleCount: 2000,
          resolutionScale: 1,
          effectsEnabled: true
        };
      }

      // Only update if quality actually changed
      if (newQuality.quality !== prevQualityRef.current) {
        setQuality(newQuality);
        prevQualityRef.current = newQuality.quality;
      }
    }

    prevFpsRef.current = metrics.fps;
  }, [metrics.fps, quality.quality]);

  return quality;
};