// src/systems/AdvancedParticleSystem.ts
export class AdvancedParticleSystem {
  private particles: AdvancedParticle[] = []
  private fields: ForceField[] = []

  constructor(private width: number, private height: number) {}

  spawnParticle(mood: MoodState, brush: CanvasBrush) {
    const config = this.getParticleConfig(mood)
    
    this.particles.push({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * config.initialVelocity,
      vy: (Math.random() - 0.5) * config.initialVelocity,
      life: 0,
      maxLife: config.lifeSpan,
      size: config.size,
      color: config.color,
      opacity: config.opacity,
      type: config.type
    })
  }

  update(deltaTime: number, mood: MoodState) {
    // Apply force fields
    this.fields.forEach(field => {
      this.particles.forEach(particle => {
        const force = field.calculateForce(particle, mood)
        particle.vx += force.x * deltaTime
        particle.vy += force.y * deltaTime
      })
    })

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx * deltaTime
      particle.y += particle.vy * deltaTime
      particle.life += deltaTime

      // Apply damping
      particle.vx *= 0.99
      particle.vy *= 0.99

      return particle.life < particle.maxLife &&
             particle.x > -100 && particle.x < this.width + 100 &&
             particle.y > -100 && particle.y < this.height + 100
    })

    // Auto-spawn based on mood intensity
    if (Math.random() < mood.intensity * 0.1) {
      this.spawnParticle(mood, this.getBrushConfig(mood))
    }
  }

  addForceField(field: ForceField) {
    this.fields.push(field)
  }
}

// Force fields for dynamic effects
export class AttractorField implements ForceField {
  constructor(private x: number, private y: number, private strength: number) {}

  calculateForce(particle: AdvancedParticle, mood: MoodState) {
    const dx = this.x - particle.x
    const dy = this.y - particle.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const force = this.strength * mood.intensity / (distance * distance)
    
    return {
      x: (dx / distance) * force,
      y: (dy / distance) * force
    }
  }
}

export class VortexField implements ForceField {
  calculateForce(particle: AdvancedParticle, mood: MoodState) {
    const dx = particle.x - this.width / 2
    const dy = particle.y - this.height / 2
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    return {
      x: -dy / distance * mood.intensity * 0.1,
      y: dx / distance * mood.intensity * 0.1
    }
  }
}