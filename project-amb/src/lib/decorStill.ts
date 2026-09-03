'use client'

import * as THREE from 'three'
import type { DecorKind } from '@/data/site'
import { buildDecor, createStudio, STILL_BG } from './decor'

/**
 * Студийные рендеры декораций для галереи.
 *
 * Пока у проекта нет реальной съёмки, его визуал — не серый прямоугольник
 * и не сток, а собственный рендер: белый объект, мягкая тень, тот же свет,
 * что и на первом экране. Рендер выполняется один раз, результат
 * превращается в обычную картинку, после чего WebGL-контекст закрывается —
 * во время скролла не работает ни один кадр.
 */

const cache = new Map<string, string>()

export interface StillJob {
  /** Идентификатор карточки — под него кешируется результат. */
  id: string
  kind: DecorKind
  /** Пропорции кадра карточки, ширина / высота. */
  aspect: number
}

interface Rig {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  ground: THREE.Mesh
  holder: THREE.Group
}

function createRig(width: number, height: number, background: string): Rig | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' })
  } catch {
    return null
  }
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(1)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(background)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: background, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  scene.add(createStudio({ shadowMapSize: 1024, radius: 4.5 }))

  const holder = new THREE.Group()
  scene.add(holder)

  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
  return { renderer, scene, camera, ground, holder }
}

/** Ставит камеру так, чтобы объект занял заданную долю кадра. */
function frame(camera: THREE.PerspectiveCamera, object: THREE.Object3D, fill: number) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
  const needV = size.y / 2 / Math.tan(halfFov)
  const needH = size.x / 2 / Math.tan(halfFov) / camera.aspect
  // В широком кадре объект кадрируется по высоте: иначе он превращается в
  // точку посреди пустого пола.
  const need = camera.aspect > 2 ? needV : Math.max(needV, needH)
  const distance = (need / fill) * 1.02

  const direction = new THREE.Vector3(0.44, 0.46, 1).normalize()
  camera.position.copy(center).addScaledVector(direction, distance)
  // Смотрим чуть ниже центра — объект «стоит» в кадре, а не висит.
  camera.lookAt(center.x, center.y - size.y * 0.04, center.z)
  camera.updateProjectionMatrix()
}

export interface StillOptions {
  /** Ширина рендера; высота считается из пропорций карточки. */
  width?: number
  detail?: number
  background?: string
  /** Какую долю кадра занимает объект. */
  fill?: number
}

/**
 * Рендерит запрошенные декорации по одной, отдавая результат по мере
 * готовности. Между кадрами уступает браузеру, чтобы не подвешивать
 * прокрутку, и закрывает контекст, когда всё готово.
 */
export async function renderStills(
  jobs: StillJob[],
  onStill: (id: string, url: string) => void,
  options: StillOptions = {},
): Promise<void> {
  const { width = 1200, detail = 1, background = STILL_BG, fill = 0.62 } = options

  const pending: StillJob[] = []
  for (const job of jobs) {
    const key = `${job.id}@${width}`
    const hit = cache.get(key)
    if (hit) onStill(job.id, hit)
    else pending.push(job)
  }
  if (pending.length === 0) return

  const rig = createRig(width, Math.round(width / pending[0].aspect), background)
  if (!rig) return

  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  try {
    for (const job of pending) {
      const height = Math.round(width / job.aspect)
      rig.renderer.setSize(width, height, false)
      rig.camera.aspect = job.aspect
      // Широкий кадр обрезает объект по высоте, поэтому в нём объект мельче.
      const frameFill = job.aspect > 2 ? 0.74 : fill

      const model = buildDecor(job.kind, detail)
      rig.holder.add(model)
      frame(rig.camera, model, frameFill)
      rig.renderer.render(rig.scene, rig.camera)

      const url = rig.renderer.domElement.toDataURL('image/webp', 0.92)
      cache.set(`${job.id}@${width}`, url)
      onStill(job.id, url)

      rig.holder.remove(model)
      await nextFrame()
    }
  } finally {
    rig.ground.geometry.dispose()
    ;(rig.ground.material as THREE.Material).dispose()
    rig.renderer.dispose()
    rig.renderer.forceContextLoss()
  }
}
