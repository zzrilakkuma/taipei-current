import * as THREE from 'three'
import { makeTextSprite } from './text'
import { CHEERS } from './policies'

/** 低多邊形人物：身體膠囊 + 頭 + 兩臂（右臂可揮手） */
export interface Figure { group: THREE.Group; rightArm: THREE.Group; leftArm: THREE.Group; head: THREE.Mesh }

export function makeFigure(shirt: string, skin = '#f1c9a5', scale = 1): Figure {
  const g = new THREE.Group()
  const mShirt = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.85 })
  const mSkin = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.8 })
  const mPants = new THREE.MeshStandardMaterial({ color: '#2b3b55', roughness: 0.9 })
  const mHair = new THREE.MeshStandardMaterial({ color: '#2a2320', roughness: 0.9 })

  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.1, 10), mPants); legs.position.y = 0.55
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.9, 4, 12), mShirt); body.position.y = 1.55
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 14), mSkin); head.position.y = 2.45
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.355, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mHair); hair.position.y = 2.5
  // 眼鏡（簡單兩個環）
  const glassMat = new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.4 })
  for (const sx of [-1, 1]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16), glassMat)
    ring.position.set(sx * 0.13, 2.47, 0.3); g.add(ring)
  }
  const makeArm = (side: number) => {
    const a = new THREE.Group(); a.position.set(side * 0.5, 2.0, 0)
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.55, 4, 8), mShirt); upper.position.y = -0.35
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mSkin); hand.position.y = -0.75
    a.add(upper, hand); return a
  }
  const rightArm = makeArm(1), leftArm = makeArm(-1)
  g.add(legs, body, head, hair, rightArm, leftArm)
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) o.castShadow = true })
  g.scale.setScalar(scale)
  return { group: g, rightArm, leftArm, head }
}

/** 觀眾：InstancedMesh（身體、頭、螢光棒），每人有自己的相位跳動 */
export interface Crowd { group: THREE.Group; count: number; update(t: number, hype: number): void; positions: THREE.Vector3[] }

export function makeCrowd(count = 420): Crowd {
  const group = new THREE.Group()
  const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 3, 8)
  const headGeo = new THREE.SphereGeometry(0.26, 10, 8)
  const stickGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6)
  const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.9 })
  const headMat = new THREE.MeshStandardMaterial({ color: '#f1c9a5', roughness: 0.8 })
  const stickMat = new THREE.MeshBasicMaterial({ color: '#7dffd9' })
  const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, count)
  const heads = new THREE.InstancedMesh(headGeo, headMat, count)
  const sticks = new THREE.InstancedMesh(stickGeo, stickMat, count)
  bodies.castShadow = true
  const palette = ['#1e9c8a', '#2c6fb3', '#f0f0f0', '#ffb347', '#e6e2d3', '#58b9a3', '#f7d774', '#3d8f6a', '#9fd3c7']
  const positions: THREE.Vector3[] = []
  const phase = new Float32Array(count), amp = new Float32Array(count), stickSide = new Float32Array(count)
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    // 扇形分佈在舞台前方（舞台在 z=-8），面向舞台
    const a = (Math.random() - 0.5) * Math.PI * 0.9
    const r = 6 + Math.pow(Math.random(), 0.7) * 17
    const p = new THREE.Vector3(Math.sin(a) * r, 0, -1 + Math.cos(a) * r * 0.9)
    positions.push(p)
    phase[i] = Math.random() * Math.PI * 2
    amp[i] = 0.08 + Math.random() * 0.22
    stickSide[i] = Math.random() < 0.5 ? -1 : 1
    bodies.setColorAt(i, c.set(palette[i % palette.length]))
  }
  group.add(bodies, heads, sticks)

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3()
  const lookQ = new THREE.Quaternion()
  return {
    group, count, positions,
    update(t, hype) {
      for (let i = 0; i < count; i++) {
        const p = positions[i]
        const jump = Math.max(0, Math.sin(t * (4 + hype * 3) + phase[i])) * amp[i] * (0.6 + hype)
        // 面向舞台
        lookQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(-p.x, -8 - p.z))
        v.set(p.x, 0.7 + jump, p.z)
        m.compose(v, lookQ, s); bodies.setMatrixAt(i, m)
        v.set(p.x, 1.45 + jump, p.z)
        m.compose(v, lookQ, s); heads.setMatrixAt(i, m)
        // 螢光棒：手舉高左右揮
        const sw = Math.sin(t * 3 + phase[i]) * 0.45
        q.setFromEuler(new THREE.Euler(0, 0, sw))
        v.set(p.x + stickSide[i] * 0.38, 1.75 + jump + Math.abs(sw) * 0.1, p.z)
        m.compose(v, q, s); sticks.setMatrixAt(i, m)
      }
      bodies.instanceMatrix.needsUpdate = true
      heads.instanceMatrix.needsUpdate = true
      sticks.instanceMatrix.needsUpdate = true
    },
  }
}

/** 觀眾頭上冒出的歡呼泡泡 */
export class CheerBubbles {
  group = new THREE.Group()
  private live: { s: THREE.Sprite; t0: number; base: THREE.Vector3 }[] = []
  private cache = new Map<string, THREE.Texture>()
  constructor(private crowd: Crowd) {}

  spawn(text?: string, now = performance.now() / 1000) {
    const txt = text ?? CHEERS[Math.floor(Math.random() * CHEERS.length)]
    const s = makeTextSprite(txt, { size: 52, color: '#0b1f2a', bg: 'rgba(255,252,245,0.95)', tail: true, scale: 1 / 105 })
    const p = this.crowd.positions[Math.floor(Math.random() * this.crowd.count)]
    s.position.set(p.x, 2.6, p.z)
    this.group.add(s)
    this.live.push({ s, t0: now, base: p })
  }

  update(now: number) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const b = this.live[i], age = now - b.t0
      const life = 2.6
      if (age > life) { this.group.remove(b.s); b.s.material.map?.dispose(); b.s.material.dispose(); this.live.splice(i, 1); continue }
      const k = age / life
      b.s.position.y = 2.6 + k * 1.6
      const pop = age < 0.25 ? age / 0.25 : 1
      ;(b.s.material as THREE.SpriteMaterial).opacity = pop * (k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1)
    }
  }
}
