// src/hooks/useAdvancedMoodAnalysis.ts
import { useCallback } from 'react';
import type { MoodState } from '../types/mood';

export const useAdvancedMoodAnalysis = () => {
  const analyzeText = useCallback(async (text: string): Promise<MoodState> => {
    // Enhanced analysis without regex patterns that might trigger CSP
    const emotionalPatterns = {
      creative: {
        keywords: ['create', 'design', 'imagine', 'inspire', 'art', 'paint', 'draw', 'write', 'compose', 'innovate', 'creative', 'inspired'],
        intensityModifier: 1.2,
      },
      melancholy: {
        keywords: ['sad', 'calm', 'peaceful', 'quiet', 'serene', 'reflect', 'memory', 'nostalgia', 'thoughtful', 'contemplative', 'melancholy', 'blue'],
        intensityModifier: 0.8,
      },
      energetic: {
        keywords: ['energy', 'excite', 'dynamic', 'active', 'vibrant', 'alive', 'power', 'intense', 'thrilled', 'pumped', 'energetic', 'lively'],
        intensityModifier: 1.5,
      },
      happy: {
        keywords: ['happy', 'joy', 'smile', 'laugh', 'fun', 'great', 'wonderful', 'amazing', 'delighted', 'ecstatic', 'joyful', 'pleased'],
        intensityModifier: 1.3,
      }
    };

    const words = text.toLowerCase().split(/\W+/);
    const scores = { creative: 0, melancholy: 0, energetic: 0, neutral: 0 };
    let totalMatches = 0;

    // Score based on keywords only (no regex)
    Object.entries(emotionalPatterns).forEach(([mood, pattern]) => {
      let moodScore = 0;
      
      // Keyword matching
      pattern.keywords.forEach(keyword => {
        const matches = words.filter(word => word === keyword).length;
        moodScore += matches;
      });

      // Simple phrase detection without regex
      const lowerText = text.toLowerCase();
      if (lowerText.includes('feel creative') || lowerText.includes('so inspired')) {
        if (mood === 'creative') moodScore += 2;
      }
      if (lowerText.includes('feel calm') || lowerText.includes('bit sad')) {
        if (mood === 'melancholy') moodScore += 2;
      }
      if (lowerText.includes('so energized') || lowerText.includes('full of energy')) {
        if (mood === 'energetic') moodScore += 2;
      }
      if (lowerText.includes('feel happy') || lowerText.includes('so excited')) {
        if (mood === 'happy') moodScore += 2;
      }

      scores[mood as keyof typeof scores] = moodScore;
      totalMatches += moodScore;
    });

    if (totalMatches === 0) {
      return {
        type: 'neutral',
        intensity: 0.3,
        confidence: 0.7,
        timestamp: Date.now()
      };
    }

    const maxMood = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
    const patternConfig = emotionalPatterns[maxMood[0] as keyof typeof emotionalPatterns];
    const baseIntensity = Math.min(maxMood[1] / 5, 1);
    const intensity = Math.min(baseIntensity * (patternConfig?.intensityModifier || 1), 1);
    const confidence = Math.min(maxMood[1] / totalMatches, 1);

    // Map 'happy' to existing mood types
    const mappedType = maxMood[0] === 'happy' ? 'creative' : maxMood[0];

    return {
      type: mappedType as MoodState['type'],
      intensity,
      confidence: Math.max(confidence, 0.8),
      timestamp: Date.now(),
      emotions: [maxMood[0]],
      dominantEmotion: maxMood[0]
    };
  }, []);

  return { analyzeText };
};