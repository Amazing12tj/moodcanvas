// src/hooks/useAudioPlayer.ts
import { useCallback, useRef, useEffect, useState } from 'react';
import type { MoodType } from '../types/mood';
import { MOOD_ORCHESTRATION } from '../constants/moodConfig';

// Create a single instance outside the hook to ensure consistency
let globalAudioInstance: HTMLAudioElement | null = null;

export const useAudioPlayer = () => {
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0.3);

  // Initialize audio element
  useEffect(() => {
    if (!globalAudioInstance) {
      globalAudioInstance = new Audio();
      globalAudioInstance.loop = true;
      globalAudioInstance.volume = currentVolume;

      const handlePlay = () => {
        setIsPlayingState(true);
        console.log('🎵 Audio started playing, volume:', globalAudioInstance?.volume);
      };

      const handlePause = () => {
        setIsPlayingState(false);
        console.log('🎵 Audio paused');
      };

      const handleEnded = () => {
        setIsPlayingState(false);
        console.log('🎵 Audio ended');
      };

      const handleError = (e: Event) => {
        console.error('🎵 Audio error:', e);
        setIsPlayingState(false);
      };

      globalAudioInstance.addEventListener('play', handlePlay);
      globalAudioInstance.addEventListener('pause', handlePause);
      globalAudioInstance.addEventListener('ended', handleEnded);
      globalAudioInstance.addEventListener('error', handleError);
    }

    return () => {
      // Don't clean up the global instance to maintain volume state
    };
  }, []);

  const playMoodSound = useCallback(async (mood: MoodType) => {
    if (!globalAudioInstance) return;

    const soundscape = MOOD_ORCHESTRATION[mood]?.soundscape;
    if (!soundscape) {
      console.warn('🎵 No soundscape found for mood:', mood);
      return;
    }

    try {
      console.log('🎵 Loading soundscape:', soundscape);
      
      // Stop current audio first
      if (globalAudioInstance.src) {
        globalAudioInstance.pause();
        globalAudioInstance.currentTime = 0;
      }

      // Set new audio source
      globalAudioInstance.src = `/soundscapes/${soundscape}`;
      
      // Play with current volume
      globalAudioInstance.volume = currentVolume;
      await globalAudioInstance.play();
      
      console.log('🎵 Now playing with volume:', currentVolume);
    } catch (error) {
      console.error('🎵 Playback failed:', error);
      setIsPlayingState(false);
    }
  }, [currentVolume]);

  const stopAudio = useCallback(() => {
    console.log('🎵 Stopping audio...');
    if (globalAudioInstance) {
      globalAudioInstance.pause();
      globalAudioInstance.currentTime = 0;
      // Clear the src to completely stop playback
      globalAudioInstance.src = '';
      setIsPlayingState(false);
      console.log('🎵 Audio stopped completely');
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setCurrentVolume(clampedVolume);
    
    if (globalAudioInstance) {
      globalAudioInstance.volume = clampedVolume;
      console.log('🎵 Volume set to:', clampedVolume, 'Actual audio volume:', globalAudioInstance.volume);
    }
  }, []);

  const isPlaying = useCallback(() => {
    return isPlayingState;
  }, [isPlayingState]);

  return {
    playMoodSound,
    stopAudio,
    setVolume,
    isPlaying
  };
};