// src/engines/WebGLRenderer.ts
export class WebGLMoodRenderer {
  private gl: WebGL2RenderingContext
  private program: WebGLProgram
  private particleBuffer: WebGLBuffer
  private particles: Float32Array
  private particleCount: number

  constructor(private canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl2')!
    this.initShaders()
    this.initBuffers()
    this.particleCount = 1000
  }

  private initShaders() {
    const vertexShader = `#version 300 es
      in vec2 a_position;
      in vec4 a_color;
      in float a_size;
      
      uniform mat4 u_matrix;
      uniform float u_time;
      
      out vec4 v_color;
      
      void main() {
        vec2 position = a_position + vec2(sin(u_time + a_position.x) * 0.1, cos(u_time + a_position.y) * 0.1);
        gl_Position = u_matrix * vec4(position, 0.0, 1.0);
        gl_PointSize = a_size * (1.0 + sin(u_time * 2.0 + a_position.x) * 0.3);
        v_color = a_color;
      }
    `

    const fragmentShader = `#version 300 es
      precision highp float;
      
      in vec4 v_color;
      out vec4 outColor;
      
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) discard;
        
        float alpha = smoothstep(0.5, 0.3, dist);
        outColor = v_color * alpha;
      }
    `

    this.program = this.createProgram(vertexShader, fragmentShader)
  }

  setMood(mood: MoodState) {
    const colors = this.getMoodColors(mood.type)
    this.updateParticles(colors, mood.intensity)
  }

  private updateParticles(colors: string[], intensity: number) {
    const particlesPerColor = this.particleCount / colors.length
    
    for (let i = 0; i < this.particleCount; i++) {
      const colorIndex = Math.floor(i / particlesPerColor)
      const color = this.hexToRgb(colors[colorIndex])
      
      // Position
      this.particles[i * 7] = Math.random() * 2 - 1 // x
      this.particles[i * 7 + 1] = Math.random() * 2 - 1 // y
      
      // Color (RGB)
      this.particles[i * 7 + 2] = color.r
      this.particles[i * 7 + 3] = color.g
      this.particles[i * 7 + 4] = color.b
      this.particles[i * 7 + 5] = Math.random() * 0.8 + 0.2 // alpha
      this.particles[i * 7 + 6] = Math.random() * 10 + 5 * intensity // size
    }
    
    this.updateBuffer()
  }

  render(time: number) {
    const gl = this.gl
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(this.program)
    
    // Set uniforms
    const timeLocation = gl.getUniformLocation(this.program, "u_time")
    gl.uniform1f(timeLocation, time * 0.001)
    
    // Draw particles
    gl.drawArrays(gl.POINTS, 0, this.particleCount)
    
    requestAnimationFrame((t) => this.render(t))
  }
}