export type MoodType = 'creative' | 'melancholy' | 'energetic' | 'neutral'

export interface MoodState {
  type: MoodType
  intensity: number
  confidence: number
  timestamp: number
  emotions?: string[]
  dominantEmotion?: string
}

export interface MoodAnalysis {
  mood: MoodState
  keywords: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  suggestions?: string[]
}

export interface MoodOrchestration {
  background: string
  spawnRate: number
  velocity: number
  particleTypes: string[]
  soundscape?: string
  description: string
}