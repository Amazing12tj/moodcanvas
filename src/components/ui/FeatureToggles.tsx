// src/components/ui/FeatureToggles.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeatureTogglesProps {
  features: {
    audioInput: boolean;
    webGL: boolean;
    advancedParticles: boolean;
    performanceMode: boolean;
    backgroundAudio: boolean;
  };
  onToggle: (feature: keyof typeof features) => void;
}

const FeatureToggles: React.FC<FeatureTogglesProps> = ({
  features,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleConfigs = [
    {
      key: "audioInput" as const,
      label: "🎤 Audio Input",
      description: "Real-time mood detection from microphone",
    },
    {
      key: "webGL" as const,
      label: "✨ WebGL Render",
      description: "Hardware-accelerated graphics",
    },
    {
      key: "advancedParticles" as const,
      label: "🌟 Advanced FX",
      description: "Enhanced particle effects",
    },
    {
      key: "backgroundAudio" as const,
      label: "🎵 Background Audio",
      description: "Ambient soundscapes",
    },
    {
      key: "performanceMode" as const,
      label: "📊 Performance Mode",
      description: "Show performance metrics",
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black/80 backdrop-blur-lg rounded-lg p-3 text-white border border-white/20 shadow-lg"
          aria-label={isOpen ? "Close features" : "Open features"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Features Panel */}
      <AnimatePresence>
        {/* Mobile Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="sm:hidden fixed top-16 left-4 right-4 bg-black/90 backdrop-blur-lg rounded-lg p-4 text-white z-50 border border-white/20 shadow-xl max-w-sm mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-sm">Features</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Close features"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {toggleConfigs.map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between space-x-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{label}</div>
                    <div className="text-xs text-white/60 truncate">
                      {description}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggle(key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      features[key] ? "bg-purple-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        features[key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Desktop Panel - Always Visible */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:block fixed top-4 left-4 bg-black/80 backdrop-blur-lg rounded-lg p-4 text-white z-50 border border-white/20 min-w-64"
        >
          <h4 className="font-semibold mb-3 text-sm">Features</h4>
          <div className="space-y-3">
            {toggleConfigs.map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between space-x-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{label}</div>
                  <div className="text-xs text-white/60 truncate">
                    {description}
                  </div>
                </div>
                <button
                  onClick={() => onToggle(key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    features[key] ? "bg-purple-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      features[key] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Overlay for mobile when panel is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sm:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FeatureToggles;
