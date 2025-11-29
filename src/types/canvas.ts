export interface CanvasBrush {
  color: string
  size: number
  opacity: number
  flow: number
  blendMode: GlobalCompositeOperation
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  opacity: number
  type: string
}

export interface ForceField {
  x: number
  y: number
  strength: number
  type: 'attractor' | 'repeller' | 'vortex'
}