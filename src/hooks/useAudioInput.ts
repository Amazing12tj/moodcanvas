// src/hooks/useAudioInput.ts
import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);

  const startListening = useCallback(async () => {
    try {
      console.log('🎤 Starting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;
      setIsListening(true);
      
      // Start analyzing audio levels
      analyzeAudio(analyser);
      
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      setIsListening(false);
      alert('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log('🎤 Stopping microphone...');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
    }
    
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    setIsListening(false);
    setAudioLevel(0);
  }, []);

  const analyzeAudio = useCallback((analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!isListening) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = Math.min(average / 255, 1);
      
      setAudioLevel(normalizedLevel);
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    animationRef.current = requestAnimationFrame(updateAudioLevel);
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    audioLevel,
    startListening,
    stopListening
  };
};