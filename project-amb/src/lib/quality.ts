'use client'

import { useEffect, useState } from 'react'

export interface Quality {
  dpr: [number, number]
  shadows: boolean
  antialias: boolean
  /** Бюджет геометрии, 0…1. */
  detail: number
  reducedMotion: boolean
  /** Размер студийных рендеров для галереи. */
  still: { width: number; height: number; detail: number }
}

const HIGH: Quality = {
  dpr: [1, 1.75],
  shadows: true,
  antialias: true,
  detail: 1,
  reducedMotion: false,
  still: { width: 1280, height: 880, detail: 1 },
}

const LOW: Quality = {
  dpr: [1, 1.25],
  shadows: false,
  antialias: false,
  detail: 0.5,
  reducedMotion: false,
  still: { width: 720, height: 500, detail: 0.6 },
}

const MEDIUM: Quality = {
  dpr: [1, 1.5],
  shadows: true,
  antialias: true,
  detail: 0.75,
  reducedMotion: false,
  still: { width: 980, height: 680, detail: 0.8 },
}

function detect(): Quality {
  if (typeof window === 'undefined') return MEDIUM

  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return LOW
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)).toLowerCase() : ''
    if (renderer.includes('swiftshader') || renderer.includes('llvmpipe')) return LOW
  } catch {
    /* определение возможностей — по возможности, без падений */
  }

  if (cores <= 4 || memory <= 4) return LOW
  if (window.matchMedia('(pointer: coarse)').matches) return MEDIUM
  return HIGH
}

/**
 * Профиль качества устройства. На сервере и в первом кадре — средний,
 * чтобы разметка совпала, дальше уточняется на клиенте.
 */
export function useQuality(): Quality {
  const [quality, setQuality] = useState<Quality>(MEDIUM)

  useEffect(() => {
    const forced =
      process.env.NODE_ENV !== 'production'
        ? new URLSearchParams(window.location.search).get('quality')
        : null
    const base = forced === 'low' ? LOW : forced === 'high' ? HIGH : forced === 'medium' ? MEDIUM : detect()

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setQuality({ ...base, reducedMotion: motion.matches })
    sync()
    motion.addEventListener('change', sync)
    return () => motion.removeEventListener('change', sync)
  }, [])

  return quality
}
