import * as THREE from 'three'
import type { DecorKind } from '@/data/site'

/**
 * Процедурные модели декораций.
 *
 * Это обычный three.js без React — один и тот же код собирает объекты для
 * 3D-сцены первого экрана и для студийных рендеров в галерее. Геометрия и
 * материалы переиспользуются между всеми объектами, поэтому сцена стоит
 * очень немного даже на слабых устройствах.
 */

export const CONCRETE = '#e9e7e2'
export const FLOOR = '#eeece7'
export const STILL_BG = '#e4e1da'

const geometryCache = new Map<string, THREE.BufferGeometry>()

function geometry<T extends THREE.BufferGeometry>(key: string, build: () => T): T {
  const hit = geometryCache.get(key)
  if (hit) return hit as T
  const geo = build()
  geometryCache.set(key, geo)
  return geo
}

const box = () => geometry('box', () => new THREE.BoxGeometry(1, 1, 1))
const sphere = (segments: number) =>
  geometry(`sphere-${segments}`, () => new THREE.SphereGeometry(0.5, segments, Math.round(segments * 0.7)))
const cylinder = (segments: number) =>
  geometry(`cyl-${segments}`, () => new THREE.CylinderGeometry(0.5, 0.5, 1, segments))
const torus = (segments: number) =>
  geometry(`torus-${segments}`, () => new THREE.TorusGeometry(1, 0.055, Math.max(6, segments / 3), segments))
const arc = (segments: number) =>
  geometry(`arc-${segments}`, () =>
    new THREE.TorusGeometry(1, 0.075, Math.max(6, segments / 3), segments, Math.PI),
  )

/** Матовый пластик — из него «отлиты» все объекты. */
export const materials = {
  white: new THREE.MeshStandardMaterial({ color: '#fbfaf8', roughness: 0.55, metalness: 0 }),
  soft: new THREE.MeshStandardMaterial({ color: '#eeebe4', roughness: 0.68, metalness: 0 }),
  deep: new THREE.MeshStandardMaterial({ color: '#d9d5cc', roughness: 0.76, metalness: 0 }),
}

type Mat = keyof typeof materials

function mesh(
  geo: THREE.BufferGeometry,
  mat: Mat,
  position: [number, number, number],
  scale: [number, number, number] | number,
  rotation?: [number, number, number],
) {
  const m = new THREE.Mesh(geo, materials[mat])
  m.position.set(...position)
  if (typeof scale === 'number') m.scale.setScalar(scale)
  else m.scale.set(...scale)
  if (rotation) m.rotation.set(...rotation)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/* ------------------------------------------------------------------ */

/** Свадебная арка: две колонны, дуга и флористика по верху. */
function buildArch(s: number) {
  const g = new THREE.Group()
  const seg = Math.round(28 * s)

  g.add(mesh(box(), 'soft', [0, 0.045, 0], [2.1, 0.09, 0.62]))
  for (const x of [-0.78, 0.78]) {
    g.add(mesh(cylinder(seg), 'white', [x, 0.72, 0], [0.15, 1.32, 0.15]))
    g.add(mesh(box(), 'soft', [x, 0.12, 0], [0.32, 0.14, 0.32]))
  }
  g.add(mesh(arc(seg), 'white', [0, 1.38, 0], [0.78, 0.78, 1.1]))

  // соцветия по дуге
  const blooms = Math.max(11, Math.round(19 * s))
  for (let i = 0; i < blooms; i++) {
    const t = i / (blooms - 1)
    const a = Math.PI * (0.08 + t * 0.84)
    const r = 0.78 + 0.06
    const wobble = Math.sin(i * 2.7) * 0.03
    g.add(
      mesh(
        sphere(Math.max(8, Math.round(14 * s))),
        i % 3 === 0 ? 'soft' : 'white',
        [Math.cos(a) * r + wobble, 1.38 + Math.sin(a) * r, Math.sin(i * 1.9) * 0.12],
        0.1 + Math.abs(Math.sin(i * 1.3)) * 0.085,
      ),
    )
  }
  return g
}

/** Цветочная композиция: низкая ваза и плотная шапка соцветий. */
function buildBloom(s: number) {
  const g = new THREE.Group()
  const seg = Math.round(26 * s)
  const petal = Math.max(8, Math.round(14 * s))

  g.add(mesh(cylinder(seg), 'soft', [0, 0.23, 0], [0.92, 0.46, 0.92]))
  g.add(mesh(cylinder(seg), 'deep', [0, 0.46, 0], [0.99, 0.045, 0.99]))
  g.add(mesh(cylinder(seg), 'deep', [0, 0.02, 0], [0.84, 0.04, 0.84]))

  // Купол соцветий: точки раскладываются по спирали Фибоначчи, поэтому
  // масса получается плотной и одинаковой в сцене и в рендере.
  const blooms = Math.max(20, Math.round(36 * s))
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < blooms; i++) {
    const t = (i + 0.5) / blooms
    const phi = Math.acos(1 - t * 1.5)
    const theta = golden * i
    const r = 0.58 * (0.88 + 0.12 * Math.sin(i * 2.9))
    g.add(
      mesh(
        sphere(petal),
        i % 5 === 0 ? 'soft' : 'white',
        [
          Math.sin(phi) * Math.cos(theta) * r,
          0.7 + Math.cos(phi) * r * 0.78,
          Math.sin(phi) * Math.sin(theta) * r,
        ],
        0.13 + Math.abs(Math.cos(i * 2.3)) * 0.07,
      ),
    )
  }

  // Листья: узкие вытянутые формы, уходящие от кромки вниз и наружу.
  const leaves = Math.max(5, Math.round(7 * s))
  for (let i = 0; i < leaves; i++) {
    const a = (i / leaves) * Math.PI * 2 + 0.4
    g.add(
      mesh(
        sphere(petal),
        'soft',
        [Math.cos(a) * 0.6, 0.5 - (i % 2) * 0.05, Math.sin(a) * 0.6],
        [0.46, 0.055, 0.14],
        [0, -a, -0.34],
      ),
    )
  }
  return g
}

/** Кинетическое кольцо на стойке. */
function buildRing(s: number) {
  const g = new THREE.Group()
  const seg = Math.round(48 * s)

  g.add(mesh(box(), 'soft', [0, 0.05, 0], [1.0, 0.1, 1.0]))
  g.add(mesh(box(), 'white', [0, 0.9, -0.42], [0.1, 1.7, 0.1]))
  g.add(mesh(box(), 'white', [0, 1.72, -0.22], [0.1, 0.09, 0.5]))

  const ring = mesh(torus(seg), 'white', [0, 1.35, 0.16], 1.02, [Math.PI / 2 - 0.34, 0, 0])
  g.add(ring)
  const inner = mesh(torus(Math.round(seg * 0.8)), 'soft', [0, 1.35, 0.16], 0.66, [Math.PI / 2 - 0.34, 0.4, 0])
  g.add(inner)

  for (const x of [-0.42, 0, 0.42]) {
    g.add(mesh(box(), 'deep', [x, 0.9, 0.34], [0.24, 0.014, 0.24]))
  }
  return g
}

/** Объёмные облака на тонких стойках. */
function buildCloud(s: number) {
  const g = new THREE.Group()
  const seg = Math.max(10, Math.round(18 * s))
  const clouds: [number, number, number, number][] = [
    [-0.62, 1.18, 0.1, 1.0],
    [0.66, 1.62, -0.18, 0.78],
    [0.18, 0.72, 0.28, 0.62],
  ]

  g.add(mesh(box(), 'soft', [0, 0.045, 0], [2.0, 0.09, 1.1]))

  clouds.forEach(([cx, cy, cz, size], index) => {
    g.add(mesh(cylinder(8), 'deep', [cx, cy / 2, cz], [0.035, cy, 0.035]))
    const puffs = Math.max(4, Math.round(6 * s))
    for (let i = 0; i < puffs; i++) {
      const t = i / (puffs - 1)
      const r = 0.42 * size
      g.add(
        mesh(
          sphere(seg),
          index === 1 ? 'soft' : 'white',
          [cx + (t - 0.5) * 1.05 * size, cy + Math.sin(t * Math.PI) * 0.18 * size, cz + Math.sin(i * 2.3) * 0.1],
          r * (0.62 + Math.sin(t * Math.PI) * 0.5),
        ),
      )
    }
  })
  return g
}

/** Игровая карусель: мачта, лучи и подвесы. */
function buildCarousel(s: number) {
  const g = new THREE.Group()
  const seg = Math.round(26 * s)
  const arms = Math.max(6, Math.round(8 * s))

  g.add(mesh(cylinder(seg), 'soft', [0, 0.06, 0], [2.0, 0.12, 2.0]))
  g.add(mesh(cylinder(seg), 'white', [0, 1.05, 0], [0.16, 2.1, 0.16]))
  g.add(mesh(cylinder(seg), 'soft', [0, 2.06, 0], [0.5, 0.12, 0.5]))

  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2
    const x = Math.cos(a)
    const z = Math.sin(a)
    g.add(mesh(box(), 'white', [x * 0.45, 2.0, z * 0.45], [0.9, 0.05, 0.05], [0, -a, 0.12]))
    const dropHeight = 0.55 + (i % 3) * 0.2
    g.add(mesh(cylinder(6), 'deep', [x * 0.86, 1.9 - dropHeight / 2, z * 0.86], [0.02, dropHeight, 0.02]))
    g.add(
      mesh(
        i % 2 === 0 ? sphere(Math.max(10, Math.round(16 * s))) : box(),
        i % 2 === 0 ? 'white' : 'soft',
        [x * 0.86, 1.9 - dropHeight - 0.12, z * 0.86],
        i % 2 === 0 ? 0.26 : [0.26, 0.26, 0.26],
        [0, a, 0.2],
      ),
    )
  }
  return g
}

/** Стена вертикальных ламелей. */
function buildFins(s: number) {
  const g = new THREE.Group()
  const count = Math.max(14, Math.round(26 * s))

  g.add(mesh(box(), 'soft', [0, 0.05, 0], [2.3, 0.1, 0.5]))
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const height = 0.5 + Math.sin(t * Math.PI) * 1.35 + Math.sin(t * 12.4) * 0.1
    g.add(
      mesh(
        box(),
        i % 5 === 0 ? 'soft' : 'white',
        [(t - 0.5) * 2.15, 0.1 + height / 2, 0],
        [0.045, height, 0.3],
        [0, Math.sin(t * 3.1) * 0.5, 0],
      ),
    )
  }
  return g
}

const BUILDERS: Record<DecorKind, (s: number) => THREE.Group> = {
  arch: buildArch,
  bloom: buildBloom,
  ring: buildRing,
  cloud: buildCloud,
  carousel: buildCarousel,
  fins: buildFins,
}

/** `detail` от 0 до 1 — бюджет геометрии для слабых устройств. */
export function buildDecor(kind: DecorKind, detail = 1): THREE.Group {
  return BUILDERS[kind](Math.max(0.4, Math.min(1, detail)))
}

/* ------------------------------------------------------------------ */

export interface StudioOptions {
  shadows?: boolean
  shadowMapSize?: number
  /** Куда светит ключевой источник. */
  target?: THREE.Vector3
  radius?: number
}

/**
 * Одна и та же студийная схема для сцены и для рендеров: мягкий ключ
 * сверху-справа, слабая заливка и подсветка снизу, чтобы белое на белом
 * читалось объёмом, а не пятном.
 */
export function createStudio(options: StudioOptions = {}) {
  const { shadows = true, shadowMapSize = 1024, target = new THREE.Vector3(), radius = 6 } = options
  const group = new THREE.Group()

  // Уровни подобраны так, чтобы освещённая поверхность подходила к 1.0 и не
  // выгорала: белое на белом должно читаться формой, а не пятном. С учётом
  // деления на π в диффузной модели three это даёт около 0.95 на полу и
  // примерно 0.63 на грани, отвёрнутой от ключа.
  group.add(new THREE.AmbientLight(0xffffff, 0.9))
  group.add(new THREE.HemisphereLight(0xffffff, 0xdcd8cf, 0.45))

  const key = new THREE.DirectionalLight(0xffffff, 2.3)
  key.position.set(target.x + radius * 0.72, target.y + radius * 1.0, target.z + radius * 0.78)
  key.target.position.copy(target)
  key.castShadow = shadows
  key.shadow.mapSize.set(shadowMapSize, shadowMapSize)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = radius * 4
  key.shadow.camera.left = -radius
  key.shadow.camera.right = radius
  key.shadow.camera.top = radius
  key.shadow.camera.bottom = -radius
  key.shadow.bias = -0.0006
  key.shadow.normalBias = 0.02
  // Тень мягкая и светлая — как в съёмочном павильоне, а не на солнце.
  key.shadow.intensity = 0.45
  group.add(key)
  group.add(key.target)

  const fill = new THREE.DirectionalLight(0xffffff, 0.35)
  fill.position.set(target.x - radius, target.y + radius * 0.5, target.z + radius * 0.4)
  group.add(fill)

  return group
}
