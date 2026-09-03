'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildDecor, createStudio, CONCRETE, FLOOR } from '@/lib/decor'
import type { DecorKind } from '@/data/site'

interface Piece {
  kind: DecorKind
  position: [number, number, number]
  rotation: number
  scale: number
  /** Насколько сильно объект реагирует на движение мыши. */
  depth: number
}

/** Композиция первого экрана: арка по центру, композиция и кольцо по краям. */
const PIECES: Piece[] = [
  { kind: 'arch', position: [0.1, 0, -3.0], rotation: 0.14, scale: 1.45, depth: 0.35 },
  { kind: 'bloom', position: [-3.7, 0, 0.3], rotation: -0.35, scale: 1.05, depth: 1 },
  { kind: 'ring', position: [3.95, 0, -1.0], rotation: 0.42, scale: 1.0, depth: 0.72 },
]

export function HeroScene({
  detail,
  reduced,
  pointer,
  scroll,
}: {
  detail: number
  reduced: boolean
  pointer: { x: number; y: number }
  scroll: { value: number }
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const size = useThree((state) => state.size)
  const groups = useRef<(THREE.Group | null)[]>([])

  const studio = useMemo(() => createStudio({ shadowMapSize: detail > 0.7 ? 1024 : 512, radius: 7 }), [detail])

  const models = useMemo(
    () => PIECES.map((piece) => buildDecor(piece.kind, detail)),
    [detail],
  )

  const ground = useMemo(() => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: FLOOR, roughness: 1 }),
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.receiveShadow = true
    return mesh
  }, [])

  // Туман в цвет фона: пол не обрывается линией, а растворяется в воздухе.
  const fog = useMemo(() => new THREE.Fog(CONCRETE, 12, 32), [])

  const smooth = useRef({ x: 0, y: 0, scroll: 0 })

  // Узкий экран не может вместить ту же композицию с той же точки, поэтому
  // камера отъезжает ровно настолько, насколько кадр стал уже.
  const dolly = Math.min(5, Math.max(0, (1.3 / (size.width / size.height) - 1) * 1.9))

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const lerp = 1 - Math.exp(-3.2 * dt)

    const targetX = reduced ? 0 : pointer.x
    const targetY = reduced ? 0 : pointer.y
    smooth.current.x += (targetX - smooth.current.x) * lerp
    smooth.current.y += (targetY - smooth.current.y) * lerp
    smooth.current.scroll += (scroll.value - smooth.current.scroll) * lerp

    const s = smooth.current

    // Камера чуть подъезжает по мере прокрутки и мягко следует за курсором.
    camera.position.set(s.x * 0.5, 1.74 + dolly * 0.12 + s.y * 0.26 - s.scroll * 0.3, 10.1 + dolly - s.scroll * 1.7)
    camera.lookAt(s.x * 0.1, 1.3 - s.scroll * 0.08, -0.9)

    for (let i = 0; i < PIECES.length; i++) {
      const group = groups.current[i]
      if (!group) continue
      const piece = PIECES[i]
      group.position.x = piece.position[0] + s.x * 0.32 * piece.depth
      group.position.y = piece.position[1] + s.scroll * 0.24 * piece.depth
      group.rotation.y = piece.rotation + s.x * 0.1 * piece.depth
    }
  })

  return (
    <>
      <primitive object={fog} attach="fog" />
      <primitive object={studio} />
      <primitive object={ground} />
      {PIECES.map((piece, index) => (
        <group
          key={piece.kind}
          ref={(el) => {
            groups.current[index] = el
          }}
          position={piece.position}
          rotation={[0, piece.rotation, 0]}
          scale={piece.scale}
        >
          <primitive object={models[index]} />
        </group>
      ))}
    </>
  )
}
