import { useState, useCallback } from 'react'
import type { MoodState } from '../types/mood'

// Helper function from src/utils/mathUtils.ts
const average = (arr: number[]): number => {
  if (arr.length === 0) return 0
  return arr.reduce((acc, val) => acc + val, 0) / arr.length
}

export const useAudioAnalysis = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null)

  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn('Audio API not supported in this browser')
        return false
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = context.createMediaStreamSource(stream)
      const analyserNode = context.createAnalyser()
      
      analyserNode.fftSize = 256
      analyserNode.smoothingTimeConstant = 0.8
      source.connect(analyserNode)
      
      setAudioContext(context)
      setAnalyser(analyserNode)
      setFrequencyData(new Uint8Array(analyserNode.frequencyBinCount))
      
      return true
    } catch (error) {
      console.error('Audio initialization failed:', error)
      return false
    }
  }, [])

  const getAudioMood = useCallback((): Partial<MoodState> => {
    if (!analyser || !frequencyData) {
      return { type: 'neutral', intensity: 0.3 }
    }
    
    const tempFrequencyData = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(tempFrequencyData)
    
    const lowFreq = average(Array.from(tempFrequencyData.slice(0, 10))) / 255
    const midFreq = average(Array.from(tempFrequencyData.slice(10, 50))) / 255
    const highFreq = average(Array.from(tempFrequencyData.slice(50, 100))) / 255
    
    const overallIntensity = average(Array.from(tempFrequencyData)) / 255
    
    if (highFreq > 0.7 && overallIntensity > 0.5) {
      return { type: 'energetic', intensity: Math.min(highFreq * 1.2, 1) }
    } else if (lowFreq > 0.6 && overallIntensity < 0.4) {
      return { type: 'melancholy', intensity: Math.min(lowFreq * 1.1, 1) }
    } else if (midFreq > 0.5 && overallIntensity > 0.3) {
      return { type: 'creative', intensity: Math.min(midFreq, 1) }
    }
    
    return { 
      type: 'neutral', 
      intensity: Math.max(overallIntensity * 0.5, 0.1) 
    }
  }, [analyser, frequencyData])

  const stopAudio = useCallback(() => {
    if (audioContext) {
      audioContext.close()
      setAudioContext(null)
      setAnalyser(null)
      setFrequencyData(null)
    }
  }, [audioContext])

  const isInitialized = useCallback(() => {
    return !!(audioContext && analyser && frequencyData)
  }, [audioContext, analyser, frequencyData])

  return { 
    initializeAudio, 
    getAudioMood, 
    stopAudio, 
    isInitialized,
    audioContext
  }
}