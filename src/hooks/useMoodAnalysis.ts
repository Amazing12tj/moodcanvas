// src/hooks/useMoodAnalysis.ts
import { useCallback } from 'react';
import type { MoodState } from '../types/mood';

export const useMoodAnalysis = () => {
  const analyzeText = useCallback(async (text: string): Promise<MoodState> => {
    // Simple keyword-based mood analysis without eval
    const moodKeywords = {
      creative: ['creative', 'happy', 'inspired', 'artistic', 'imagine', 'create', 'design', 'paint', 'draw'],
      melancholy: ['sad', 'calm', 'peaceful', 'quiet', 'reflective', 'nostalgic', 'memory', 'thoughtful', 'blue'],
      energetic: ['energized', 'excited', 'dynamic', 'alive', 'powerful', 'vibrant', 'active', 'lively', 'thrilled'],
      happy: ['happy', 'joy', 'smile', 'laugh', 'fun', 'great', 'wonderful', 'amazing', 'delighted']
    };

    const words = text.toLowerCase().split(/\W+/);
    const scores = { creative: 0, melancholy: 0, energetic: 0, neutral: 0 };

    // Safe iteration without eval
    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      words.forEach(word => {
        if (keywords.includes(word)) {
          scores[mood as keyof typeof scores]++;
        }
      });
    });

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) {
      return {
        type: 'neutral',
        intensity: 0.3,
        confidence: 0.7,
        timestamp: Date.now()
      };
    }

    const maxMood = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
    const intensity = Math.min(maxMood[1] / 3, 1);
    const confidence = Math.min(maxMood[1] / totalScore, 1);

    return {
      type: maxMood[0] as keyof typeof scores,
      intensity,
      confidence: Math.max(confidence, 0.6),
      timestamp: Date.now()
    };
  }, []);

  return { analyzeText };
};