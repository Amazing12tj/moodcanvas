// src/components/ui/MoodCanvas.tsx
import React, { forwardRef } from "react";

interface MoodCanvasProps {
  onClear: () => void;
}

const MoodCanvas = forwardRef<HTMLCanvasElement, MoodCanvasProps>(
  ({ onClear }, ref) => {
    return (
      <div className="relative">
        <canvas
          ref={ref}
          width={1000}
          height={800}
          className="w-full h-auto bg-slate-900/50 rounded-2xl border-2 border-white/10 shadow-2xl"
        />
        {/* Remove the clear button from here - it's now in App.tsx */}
      </div>
    );
  }
);

MoodCanvas.displayName = "MoodCanvas";

export default MoodCanvas;
