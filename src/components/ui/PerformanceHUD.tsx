// src/components/ui/PerformanceHUD.tsx
import React from "react";
import { motion } from "framer-motion";

interface PerformanceMetrics {
  fps: number;
  memory: number;
  particleCount: number;
  renderTime: number;
}

interface QualitySettings {
  quality: "high" | "medium" | "low";
  particleCount: number;
  resolutionScale: number;
  effectsEnabled: boolean;
}

interface PerformanceHUDProps {
  metrics: PerformanceMetrics;
  quality: QualitySettings;
}

const PerformanceHUD: React.FC<PerformanceHUDProps> = ({
  metrics,
  quality,
}) => {
  const getFPSColor = (fps: number) => {
    if (fps >= 50) return "text-green-400";
    if (fps >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  const formatMemory = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 bg-black/80 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-50 border border-white/20 min-w-48"
    >
      <h4 className="font-semibold mb-2 text-center">Performance</h4>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
        </div>
        <div className="flex justify-between">
          <span>Memory:</span>
          <span>{formatMemory(metrics.memory)}</span>
        </div>
        <div className="flex justify-between">
          <span>Particles:</span>
          <span>{metrics.particleCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Render Time:</span>
          <span>{metrics.renderTime.toFixed(1)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Quality:</span>
          <span className="capitalize">{quality.quality}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceHUD;
