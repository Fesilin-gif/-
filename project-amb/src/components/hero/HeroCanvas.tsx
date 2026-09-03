'use client'

import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { CONCRETE } from '@/lib/decor'
import type { Quality } from '@/lib/quality'
import { HeroScene } from './HeroScene'

/**
 * Обёртка над WebGL-холстом. Вынесена в отдельный чанк и подгружается
 * динамически, поэтому текст и вёрстка первого экрана появляются сразу,
 * не дожидаясь three.js.
 */
export default function HeroCanvas({
  quality,
  active,
  pointer,
  scroll,
  onReady,
}: {
  quality: Quality
  active: boolean
  pointer: { x: number; y: number }
  scroll: { value: number }
  onReady: () => void
}) {
  return (
    <Canvas
      dpr={quality.dpr}
      frameloop={active ? 'always' : 'never'}
      shadows={quality.shadows ? 'soft' : false}
      gl={{ antialias: quality.antialias, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 1.62, 7.5] }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(CONCRETE))
        gl.toneMapping = THREE.NeutralToneMapping
        gl.toneMappingExposure = 1
        onReady()
      }}
    >
      <HeroScene
        detail={quality.detail}
        reduced={quality.reducedMotion}
        pointer={pointer}
        scroll={scroll}
      />
    </Canvas>
  )
}
