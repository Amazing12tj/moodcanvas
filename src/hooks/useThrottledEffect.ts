// src/hooks/useThrottledEffect.ts
import { useEffect, useRef } from 'react'

export const useThrottledEffect = (effect: () => void, deps: any[], delay: number) => {
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        effect()
        lastRan.current = Date.now()
      }
    }, delay - (Date.now() - lastRan.current))

    return () => clearTimeout(handler)
  }, [effect, delay, ...deps])
}

// src/components/optimized/MemoizedCanvas.tsx
import React, { memo } from 'react'

const MoodCanvas = memo(React.forwardRef<HTMLCanvasElement, { onClear: () => void }>(
  ({ onClear }, ref) => {
    return (
      <div className="relative">
        <canvas
          ref={ref}
          width={1000}
          height={800}
          className="w-full h-auto bg-slate-900/50 rounded-2xl border-2 border-white/10 shadow-2xl"
        />
        <button
          onClick={onClear}
          className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          Clear
        </button>
      </div>
    )
  }
))