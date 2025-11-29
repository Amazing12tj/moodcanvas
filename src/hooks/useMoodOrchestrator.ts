// src/hooks/useMoodOrchestrator.ts
import { useState, useEffect } from 'react';
import type { MoodState } from '../types/mood';
import { MOOD_ORCHESTRATION } from '../constants/moodConfig';
import { useAudioPlayer } from './useAudioPlayer';

export const useMoodOrchestrator = (currentMood: MoodState) => {
  const [orchestration, setOrchestration] = useState(MOOD_ORCHESTRATION.neutral);
  const { playMoodSound, stopAudio } = useAudioPlayer();

  useEffect(() => {
    const moodConfig = MOOD_ORCHESTRATION[currentMood.type] || MOOD_ORCHESTRATION.neutral;
    
    // Adjust spawn rate and velocity based on intensity
    const adjustedConfig = {
      ...moodConfig,
      spawnRate: moodConfig.spawnRate * currentMood.intensity,
      velocity: moodConfig.velocity * currentMood.intensity,
      description: `${moodConfig.description} (${Math.round(currentMood.intensity * 100)}% intensity)`
    };

    setOrchestration(adjustedConfig);

    // Play corresponding soundscape
    if (currentMood.intensity > 0.1) { // Only play if there's significant mood
      playMoodSound(currentMood.type);
    } else {
      stopAudio(); // Stop audio for very low intensity
    }
  }, [currentMood.type, currentMood.intensity, playMoodSound, stopAudio]);

  return orchestration;
};