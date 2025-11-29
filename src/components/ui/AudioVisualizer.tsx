// src/components/ui/AudioVisualizer.tsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AudioVisualizerProps {
  onMoodUpdate?: (mood: any) => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onMoodUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simulated audio visualization bars
      const barCount = 32;
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const height = Math.random() * canvas.height * 0.6;
        const hue = (i / barCount) * 360;

        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth - 2,
          height
        );
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-purple-500/30"
    >
      <h4 className="text-white text-sm font-semibold mb-2 text-center">
        🎤 Live Audio Input Active
      </h4>
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full h-20 bg-black/50 rounded"
      />
      <p className="text-purple-300 text-xs text-center mt-2">
        Analyzing audio for mood detection...
      </p>
    </motion.div>
  );
};

export default AudioVisualizer;
