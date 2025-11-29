// src/components/ui/Canvas2DRenderer.tsx
import React, { useEffect, useRef } from "react";
import type { MoodState } from "../../types/mood";

interface Canvas2DRendererProps {
  mood: MoodState;
}

const Canvas2DRenderer: React.FC<Canvas2DRendererProps> = ({ mood }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with fade effect
    ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mood-based rendering
    const colors = {
      creative: ["#667eea", "#764ba2"],
      melancholy: ["#4facfe", "#00f2fe"],
      energetic: ["#f093fb", "#f5576c"],
      neutral: ["#868f96", "#596164"],
    }[mood.type];

    // Draw gradient circles based on mood intensity
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2
    );

    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.globalAlpha = mood.intensity * 0.3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some particles based on mood
    const particleCount = Math.floor(mood.intensity * 50);
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = colors[0];
      ctx.globalAlpha = Math.random() * 0.5;
      ctx.fill();
    }
  }, [mood]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-auto bg-black/20 rounded-lg"
    />
  );
};

export default Canvas2DRenderer;
