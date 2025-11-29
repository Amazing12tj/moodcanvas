// src/utils/exportUtils.ts
export const exportCanvasAsImage = async (
  canvas: HTMLCanvasElement, 
  mood: MoodState,
  format: 'png' | 'jpeg' | 'webp' = 'png'
): Promise<Blob> => {
  return new Promise((resolve) => {
    // Add mood metadata to image
    const metadataCanvas = document.createElement('canvas')
    const ctx = metadataCanvas.getContext('2d')!
    
    metadataCanvas.width = canvas.width
    metadataCanvas.height = canvas.height + 100
    
    // Draw original artwork
    ctx.drawImage(canvas, 0, 0)
    
    // Add mood information
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '24px Arial'
    ctx.fillText(`Mood: ${mood.type} | Intensity: ${(mood.intensity * 100).toFixed(0)}%`, 20, canvas.height + 40)
    ctx.fillText(`Created with MoodCanvas AI`, 20, canvas.height + 70)
    
    metadataCanvas.toBlob((blob) => {
      resolve(blob!)
    }, `image/${format}`, 0.95)
  })
}

export const shareArtwork = async (canvas: HTMLCanvasElement, mood: MoodState) => {
  if (navigator.share) {
    const blob = await exportCanvasAsImage(canvas, mood)
    const file = new File([blob], `moodcanvas-${mood.type}-${Date.now()}.png`, { type: 'image/png' })
    
    await navigator.share({
      title: 'My MoodCanvas Creation',
      text: `I created this ${mood.type} artwork with MoodCanvas AI!`,
      files: [file]
    })
  } else {
    // Fallback to download
    const link = document.createElement('a')
    const blob = await exportCanvasAsImage(canvas, mood)
    link.href = URL.createObjectURL(blob)
    link.download = `moodcanvas-${mood.type}-${Date.now()}.png`
    link.click()
  }
}