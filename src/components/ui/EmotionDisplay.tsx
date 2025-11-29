// src/components/ui/EmotionDisplay.tsx
import React from "react";
import { motion } from "framer-motion";
import type { MoodState } from "../../types/mood";

interface EmotionDisplayProps {
  mood: MoodState;
  orchestration?: {
    description: string;
    particleTypes?: string[];
  };
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  mood,
  orchestration,
}) => {
  const getMoodIcon = (type: string) => {
    const icons = {
      creative: "🎨",
      melancholy: "🌊",
      energetic: "⚡",
      neutral: "🌫️",
    };
    return icons[type as keyof typeof icons] || "🎭";
  };

  const getIntensityBars = (intensity: number) => {
    const bars = Math.ceil(intensity * 5);
    return "▰".repeat(bars) + "▱".repeat(5 - bars);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center space-x-4 mb-4">
        <motion.div
          className="text-4xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: mood.type === "energetic" ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {getMoodIcon(mood.type)}
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold text-white capitalize">
            {mood.type}
          </h3>
          <p className="text-purple-200 text-sm">
            {orchestration?.description || "Analyzing emotions..."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>Intensity</span>
            <span>{(mood.intensity * 100).toFixed(0)}%</span>
          </div>
          <div className="text-2xl text-purple-400 font-mono">
            {getIntensityBars(mood.intensity)}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>Confidence</span>
            <span>{(mood.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-green-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${mood.confidence * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {orchestration?.particleTypes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-3 border-t border-white/10"
          >
            <p className="text-sm text-white/60">
              <strong>Active Effects:</strong>{" "}
              {orchestration.particleTypes.join(", ")}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmotionDisplay;
