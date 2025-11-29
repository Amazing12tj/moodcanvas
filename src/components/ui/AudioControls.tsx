// src/components/ui/AudioControls.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Music } from "lucide-react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

interface AudioControlsProps {
  currentMood: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({ currentMood }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const { setVolume: setAudioVolume, isPlaying } = useAudioPlayer();

  // Sync volume with audio system
  useEffect(() => {
    setAudioVolume(volume);
    setIsMuted(volume === 0);
  }, [volume, setAudioVolume]);

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.3); // Unmute to 30%
    } else {
      setVolume(0); // Mute
    }
  };

  // Format volume display
  const formatVolume = (vol: number) => {
    if (vol === 0) return "Muted";
    return `${Math.round(vol * 100)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/50 backdrop-blur-lg rounded-lg p-4 border border-white/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music size={16} className="text-purple-400" />
          <span className="text-white text-sm font-medium">Soundscape</span>
        </div>
        <span className="text-purple-300 text-xs capitalize">
          {currentMood} Mode
        </span>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <VolumeX size={18} className="text-red-400" />
          ) : volume < 0.5 ? (
            <Volume2 size={18} className="text-yellow-400" />
          ) : (
            <Volume2 size={18} className="text-green-400" />
          )}
        </motion.button>

        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                volume * 100
              }%, rgba(255,255,255,0.2) ${
                volume * 100
              }%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
        </div>

        <div className="text-white text-xs min-w-[50px] text-right">
          {formatVolume(volume)}
        </div>
      </div>

      {isPlaying() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-2 text-green-400 text-xs"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Now Playing
        </motion.div>
      )}

      {/* Add some custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          background: transparent;
        }

        .slider::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    </motion.div>
  );
};

export default AudioControls;
