import type { MoodOrchestration } from '../types/mood'

export const MOOD_ORCHESTRATION: Record<string, MoodOrchestration> = {
  creative: {
    background: 'radial-gradient(circle, #667eea 0%, #764ba2 100%)',
    spawnRate: 0.1,
    velocity: 2,
    particleTypes: ['sparkle', 'flow'],
    soundscape: 'ambient-creative.mp3',
    description: 'Flowing with creative energy and inspiration'
  },
  melancholy: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    spawnRate: 0.02,
    velocity: 0.5,
    particleTypes: ['drift', 'fade'],
    soundscape: 'ambient-calm.mp3',
    description: 'Calm and reflective waters of emotion'
  },
  energetic: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    spawnRate: 0.3,
    velocity: 5,
    particleTypes: ['burst', 'pulse'],
    soundscape: 'ambient-energetic.mp3',
    description: 'Vibrant and dynamic energy flow'
  },
  neutral: {
    background: 'linear-gradient(135deg, #868f96 0%, #596164 100%)',
    spawnRate: 0.05,
    velocity: 1,
    particleTypes: ['float'],
    soundscape: 'ambient-neutral.mp3',
    description: 'Balanced and centered state'
  }
}