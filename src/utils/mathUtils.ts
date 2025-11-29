export const average = (arr: number[]): number => {
  if (arr.length === 0) return 0
  return arr.reduce((acc, val) => acc + val, 0) / arr.length
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor
}

export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}