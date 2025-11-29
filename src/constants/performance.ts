export const PERFORMANCE_LIMITS = {
  HIGH: {
    maxParticles: 2000,
    resolution: 1,
    effects: true
  },
  MEDIUM: {
    maxParticles: 1000,
    resolution: 0.75,
    effects: true
  },
  LOW: {
    maxParticles: 500,
    resolution: 0.5,
    effects: false
  }
}

export const TARGET_FPS = 60
export const MEMORY_THRESHOLD = 50 * 1024 * 1024 // 50MB