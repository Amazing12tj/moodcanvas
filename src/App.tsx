import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoodCanvas from "./components/ui/MoodCanvas";
import MoodInput from "./components/ui/MoodInput";
import EmotionDisplay from "./components/ui/EmotionDisplay";
import PerformanceHUD from "./components/ui/PerformanceHUD";
import FeatureToggles from "./components/ui/FeatureToggles";
import WebGLCanvas from "./components/ui/WebGLCanvas";
import Canvas2DRenderer from "./components/ui/Canvas2DRenderer";
import AudioControls from "./components/ui/AudioControls";
import { useMoodAnalysis } from "./hooks/useMoodAnalysis";
import { useAdvancedMoodAnalysis } from "./hooks/useAdvancedMoodAnalysis";
import { useCanvasRenderer } from "./hooks/useCanvasRenderer";
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";
import { useAdaptiveQuality } from "./hooks/useAdaptiveQuality";
import { useMoodOrchestrator } from "./hooks/useMoodOrchestrator";
import { useAudioInput } from "./hooks/useAudioInput";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import type { MoodState, MoodType } from "./types/mood";
import { MOOD_ORCHESTRATION } from "./constants/moodConfig";
const initialMood: MoodState = {
  type: "neutral",
  intensity: 0.5,
  confidence: 1,
  timestamp: Date.now(),
};

function App() {
  const [currentMood, setCurrentMood] = useState<MoodState>(initialMood);
  const [activeFeatures, setActiveFeatures] = useState({
    audioInput: false,
    webGL: false,
    advancedParticles: true,
    performanceMode: false,
    backgroundAudio: true,
  });
  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const { analyzeText } = useMoodAnalysis();
  const { analyzeText: analyzeTextAdvanced } = useAdvancedMoodAnalysis();
  const metrics = usePerformanceMonitor();
  const quality = useAdaptiveQuality(metrics);
  const orchestration = useMoodOrchestrator(currentMood);

  const { isListening, audioLevel, startListening, stopListening } =
    useAudioInput();
  const { playMoodSound, stopAudio, setVolume, isPlaying } = useAudioPlayer();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderMood, clearCanvas } = useCanvasRenderer(canvasRef);

  useEffect(() => {
    if (!activeFeatures.webGL) {
      renderMood(currentMood);
    }
  }, [currentMood, renderMood, activeFeatures.webGL]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeFeatures.audioInput && isListening) {
      console.log("🎤 Audio input enabled and listening");
      interval = setInterval(() => {
        const audioMood = getMoodFromAudioLevel(audioLevel);
        if (audioMood.type && audioMood.intensity) {
          setCurrentMood((prev) => ({
            ...prev,
            ...audioMood,
            timestamp: Date.now(),
          }));
        }
      }, 1000);
    } else {
      console.log("🎤 Audio input disabled or not listening");
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeFeatures.audioInput, isListening, audioLevel]);

  const getMoodFromAudioLevel = (level: number): Partial<MoodState> => {
    if (level > 0.7) return { type: "energetic", intensity: level };
    if (level > 0.4) return { type: "happy", intensity: level };
    if (level > 0.1) return { type: "calm", intensity: level };
    return { type: "neutral", intensity: level };
  };

  useEffect(() => {
    if (activeFeatures.audioInput && !isListening) {
      console.log("🔄 Starting audio input...");
      startListening();
    } else if (!activeFeatures.audioInput && isListening) {
      console.log("🔄 Stopping audio input...");
      stopListening();
    }
  }, [activeFeatures.audioInput, isListening, startListening, stopListening]);

  useEffect(() => {
    console.log("🎵 Background audio effect:", {
      backgroundAudio: activeFeatures.backgroundAudio,
      isPlaying: isPlaying(),
      currentMood: currentMood.type,
    });

    if (activeFeatures.backgroundAudio) {
      if (!isPlaying()) {
        console.log("🎵 Starting background audio for mood:", currentMood.type);
        playMoodSound(currentMood.type).catch((error) => {
          console.error("🎵 Failed to start background audio:", error);
        });
      } else {
        console.log("🎵 Background audio already playing");
      }
    } else {
      console.log("🎵 Stopping background audio (feature disabled)");
      stopAudio();
    }
  }, [
    activeFeatures.backgroundAudio,
    currentMood.type,
    playMoodSound,
    stopAudio,
    isPlaying,
  ]);

  useEffect(() => {
    if (activeFeatures.backgroundAudio && isPlaying()) {
      console.log(
        "🎵 Mood changed, updating background audio to:",
        currentMood.type
      );
      playMoodSound(currentMood.type).catch((error) => {
        console.error("🎵 Failed to update background audio:", error);
      });
    }
  }, [
    currentMood.type,
    activeFeatures.backgroundAudio,
    playMoodSound,
    isPlaying,
  ]);

  const handleFeatureToggle = useCallback(
    (feature: keyof typeof activeFeatures) => {
      console.log(
        "🔄 Toggling feature:",
        feature,
        "Current state:",
        activeFeatures[feature]
      );

      if (feature === "backgroundAudio") {
        console.log(
          "🎵 Background audio toggle - current playing state:",
          isPlaying()
        );
      }

      setActiveFeatures((prev) => ({
        ...prev,
        [feature]: !prev[feature],
      }));
    },
    [activeFeatures, isPlaying]
  );

  const handleTextInput = useCallback(
    async (text: string) => {
      const moodAnalysis = activeFeatures.performanceMode
        ? await analyzeText(text)
        : await analyzeTextAdvanced(text);
      setCurrentMood(moodAnalysis);
    },
    [analyzeText, analyzeTextAdvanced, activeFeatures.performanceMode]
  );

  const handleClearCanvas = useCallback(() => {
    clearCanvas();
    setCurrentMood(initialMood);
  }, [clearCanvas]);

  const getMoodGradient = (mood: MoodType): string => {
    return (
      MOOD_ORCHESTRATION[mood]?.background ||
      "linear-gradient(135deg, #868f96 0%, #596164 100%)"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMood.type}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{
            background: getMoodGradient(currentMood.type),
          }}
        />
      </AnimatePresence>

      {activeFeatures.performanceMode && (
        <PerformanceHUD metrics={metrics} quality={quality} />
      )}

      <FeatureToggles
        features={activeFeatures}
        onToggle={handleFeatureToggle}
      />

      {activeFeatures.audioInput && isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 left-4 bg-black/70 backdrop-blur-lg rounded-lg p-3 border border-white/20 z-30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">
              Microphone Active
            </span>
          </div>
          <div className="w-32 h-2 bg-gray-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${audioLevel * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="text-gray-400 text-xs mt-1 text-center">
            {Math.round(audioLevel * 100)}% input
          </div>
        </motion.div>
      )}

      {activeFeatures.backgroundAudio && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 right-4 bg-black/70 backdrop-blur-lg rounded-lg p-3 border border-white/20 z-30"
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isPlaying() ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              }`}
            />
            <span className="text-white text-xs font-medium">
              {isPlaying() ? "Audio Playing" : "Audio Loading..."}
            </span>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-3 sm:mb-4">
            <motion.img
              src="/icons/icon-192.png"
              alt="MoodCanvas"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              MoodCanvas
            </motion.h1>
          </div>
          <p className="text-lg sm:text-xl text-purple-200 mb-4 sm:mb-6">
            AI Emotion-Responsive Art Board
          </p>

          {activeFeatures.backgroundAudio && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block mb-3 sm:mb-4 max-w-full"
            >
              <AudioControls currentMood={currentMood.type} />
            </motion.div>
          )}
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <MoodInput onTextSubmit={handleTextInput} />
            <EmotionDisplay mood={currentMood} orchestration={orchestration} />
          </div>

          <div className="lg:col-span-2">
            <div className="relative bg-black/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm border border-white/10 shadow-2xl">
              {activeFeatures.webGL ? (
                <WebGLCanvas
                  mood={currentMood}
                  quality={quality}
                  enabled={activeFeatures.webGL}
                  fallback={
                    <div className="text-center">
                      <Canvas2DRenderer mood={currentMood} />
                      <p className="text-white/70 text-xs sm:text-sm mt-2">
                        WebGL not supported - Using Canvas2D
                      </p>
                    </div>
                  }
                />
              ) : activeFeatures.advancedParticles ? (
                <MoodCanvas ref={canvasRef} onClear={handleClearCanvas} />
              ) : (
                <Canvas2DRenderer mood={currentMood} />
              )}

              {activeFeatures.performanceMode && (
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      quality.quality === "high"
                        ? "bg-green-400"
                        : quality.quality === "medium"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                  />
                  {quality.quality.toUpperCase()} Quality
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearCanvas}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-red-500/80 hover:bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm transition-colors font-medium flex items-center gap-2 text-sm sm:text-base"
              >
                <span className="text-sm">🗑️</span>
                <span className="hidden sm:inline">Clear Canvas</span>
                <span className="sm:hidden">Clear</span>
              </motion.button>
            </div>

            <motion.div
              className="mt-4 sm:mt-6 bg-white/10 rounded-full h-2 sm:h-3 overflow-hidden backdrop-blur-sm"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                style={{
                  scaleX: currentMood.intensity,
                  transformOrigin: "left",
                }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </motion.div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/70 text-xs sm:text-sm">
                Mood Intensity
              </span>
              <span className="text-white font-medium text-sm sm:text-base">
                {(currentMood.intensity * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <motion.div
          className="mt-8 sm:mt-12 bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 text-center">
            Advanced Controls
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFeatureToggle("audioInput")}
              className={`p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                activeFeatures.audioInput
                  ? "bg-green-500/20 border-2 border-green-400 text-green-100"
                  : "bg-white/10 border-2 border-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span className="text-xl sm:text-2xl">🎤</span>
              <span className="font-medium text-xs sm:text-sm text-center">
                Audio Input
              </span>
              <span className="text-xs opacity-70 text-center hidden sm:block">
                {activeFeatures.audioInput ? "Listening..." : "Enable mic"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFeatureToggle("webGL")}
              className={`p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                activeFeatures.webGL
                  ? "bg-purple-500/20 border-2 border-purple-400 text-purple-100"
                  : "bg-white/10 border-2 border-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span className="text-xl sm:text-2xl">✨</span>
              <span className="font-medium text-xs sm:text-sm text-center">
                WebGL Render
              </span>
              <span className="text-xs opacity-70 text-center hidden sm:block">
                {activeFeatures.webGL ? "Hardware Accel" : "Enable WebGL"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFeatureToggle("advancedParticles")}
              className={`p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                activeFeatures.advancedParticles
                  ? "bg-blue-500/20 border-2 border-blue-400 text-blue-100"
                  : "bg-white/10 border-2 border-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span className="text-xl sm:text-2xl">🌟</span>
              <span className="font-medium text-xs sm:text-sm text-center">
                Advanced FX
              </span>
              <span className="text-xs opacity-70 text-center hidden sm:block">
                {activeFeatures.advancedParticles ? "Enhanced" : "Basic"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFeatureToggle("backgroundAudio")}
              className={`p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                activeFeatures.backgroundAudio
                  ? "bg-indigo-500/20 border-2 border-indigo-400 text-indigo-100"
                  : "bg-white/10 border-2 border-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span className="text-xl sm:text-2xl">🎵</span>
              <span className="font-medium text-xs sm:text-sm text-center">
                Background Audio
              </span>
              <span className="text-xs opacity-70 text-center hidden sm:block">
                {activeFeatures.backgroundAudio ? "Enabled" : "Disabled"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFeatureToggle("performanceMode")}
              className={`p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                activeFeatures.performanceMode
                  ? "bg-orange-500/20 border-2 border-orange-400 text-orange-100"
                  : "bg-white/10 border-2 border-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span className="text-xl sm:text-2xl">📊</span>
              <span className="font-medium text-xs sm:text-sm text-center">
                Performance
              </span>
              <span className="text-xs opacity-70 text-center hidden sm:block">
                {activeFeatures.performanceMode ? "Metrics On" : "Show Stats"}
              </span>
            </motion.button>
          </div>

          <motion.div
            className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="text-white/60">
                <div className="text-xs sm:text-sm">AI Analysis</div>
                <div className="font-medium text-white text-sm sm:text-base">
                  {activeFeatures.performanceMode ? "Fast" : "Advanced"}
                </div>
              </div>
              <div className="text-white/60">
                <div className="text-xs sm:text-sm">Rendering</div>
                <div className="font-medium text-white text-sm sm:text-base">
                  {activeFeatures.webGL
                    ? "WebGL"
                    : activeFeatures.advancedParticles
                    ? "Canvas2D (Advanced)"
                    : "Canvas2D (Basic)"}
                </div>
              </div>
              <div className="text-white/60">
                <div className="text-xs sm:text-sm">Audio</div>
                <div className="font-medium text-white text-sm sm:text-base">
                  {activeFeatures.backgroundAudio
                    ? isPlaying()
                      ? "Playing"
                      : "Enabled"
                    : "Disabled"}
                </div>
              </div>
              <div className="text-white/60">
                <div className="text-xs sm:text-sm">Quality</div>
                <div className="font-medium text-white text-sm sm:text-base capitalize">
                  {quality.quality}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        <motion.footer
          className="mt-8 sm:mt-12 text-center text-white/40 text-xs sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>
            MoodCanvas - Transform your emotions into art • Built with ❤️ by Mr.
            Amazing
          </p>
          <p className="mt-2">
            FPS: {metrics.fps} • Particles: {metrics.particleCount} • Memory:{" "}
            {(metrics.memory / 1024 / 1024).toFixed(1)}MB
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
