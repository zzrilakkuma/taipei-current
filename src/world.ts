import * as THREE from 'three'
import { makeFlagTexture, BRAND_ORANGE } from './text'

/** 簡單的 2D 雜訊（value noise），用來堆山 */
function hash(x: number, y: number) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x: number, y: number) { let f = 0, a = 0.5; for (let i = 0; i < 4; i++) { f += a * noise(x, y); x *= 2.1; y *= 2.1; a *= 0.5 } return f }

export interface World {
  group: THREE.Group
  sea: THREE.Mesh
  flags: THREE.Mesh[]
  clouds: THREE.Sprite[]
  update(t: number): void
}

export function buildWorld(scene: THREE.Scene): World {
  const group = new THREE.Group()
  scene.add(group)

  // 天空：大球體 + 漸層 shader（黃昏山海）
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color('#1f4e8c') }, mid: { value: new THREE.Color('#7fb6e6') }, bot: { value: new THREE.Color('#ffd0a0') }, sun: { value: new THREE.Vector3(-0.45, 0.18, -0.87) } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top, mid, bot, sun; varying vec3 vP;
      void main(){ float h = clamp(vP.y, -0.1, 1.0);
        vec3 c = h < 0.25 ? mix(bot, mid, smoothstep(-0.05, 0.25, h)) : mix(mid, top, smoothstep(0.25, 0.9, h));
        float s = max(dot(vP, normalize(sun)), 0.0);
        c += vec3(1.0, 0.75, 0.45) * pow(s, 24.0) * 1.2 + vec3(1.0, 0.6, 0.3) * pow(s, 4.0) * 0.25;
        gl_FragColor = vec4(c, 1.0); }`,
  })
  group.add(new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), skyMat))

  // 太陽
  const sunPos = new THREE.Vector3(-0.45, 0.18, -0.87).multiplyScalar(820)
  const sun = new THREE.Mesh(new THREE.SphereGeometry(26, 24, 24), new THREE.MeshBasicMaterial({ color: '#fff1c4' }))
  sun.position.copy(sunPos)
  group.add(sun)

  // 海：遠方的大平面，頂點隨時間起伏
  const seaGeo = new THREE.PlaneGeometry(1800, 1800, 90, 90)
  seaGeo.rotateX(-Math.PI / 2)
  const seaMat = new THREE.MeshStandardMaterial({ color: '#1e6f9c', roughness: 0.35, metalness: 0.25, flatShading: true })
  const sea = new THREE.Mesh(seaGeo, seaMat)
  sea.position.y = -60
  group.add(sea)

  // 山：陽明山群峰，鏡頭所在的山頂在原點，周圍一圈較低的山稜
  const terrGeo = new THREE.PlaneGeometry(700, 700, 110, 110)
  terrGeo.rotateX(-Math.PI / 2)
  const pos = terrGeo.attributes.position as THREE.BufferAttribute
  const col: number[] = []
  const cGrass = new THREE.Color('#6fae55'), cRock = new THREE.Color('#8a7f6a'), cDark = new THREE.Color('#3f7a46')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const d = Math.hypot(x, z)
    // 山頂平台：半徑 26 內平坦；往外先緩降再隆起成群峰，最後落入海
    const summit = Math.max(0, 1 - d / 40)
    // 舞台後方（-z）山稜壓低，讓海平面從舞台背後露出來；兩側與前方保留群峰
    const backOpen = THREE.MathUtils.smoothstep(-z, 30, 110) * THREE.MathUtils.smoothstep(60 - Math.abs(x), 0, 60)
    const ridge = (fbm(x * 0.012 + 5, z * 0.012 + 9) * 70 + fbm(x * 0.03, z * 0.03) * 18) * (1 - backOpen * 0.85)
    const falloff = THREE.MathUtils.smoothstep(d, 200, 320)
    let y = d < 26 ? 0 : -(d - 26) * (0.55 + backOpen * 0.5) + ridge * THREE.MathUtils.smoothstep(d, 30, 120) * (1 - falloff) - falloff * 80
    y = y * (1 - summit) + 0 * summit
    pos.setY(i, y)
    const slope = Math.abs(ridge) / 70
    const c = cGrass.clone().lerp(cDark, fbm(x * 0.05, z * 0.05)).lerp(cRock, slope > 0.75 ? 0.5 : 0)
    col.push(c.r, c.g, c.b)
  }
  terrGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  terrGeo.computeVertexNormals()
  const terrain = new THREE.Mesh(terrGeo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }))
  terrain.receiveShadow = true
  group.add(terrain)

  // 山頂草地（舞台與觀眾區）
  const lawn = new THREE.Mesh(new THREE.CircleGeometry(27, 48), new THREE.MeshStandardMaterial({ color: '#79b85c', roughness: 1 }))
  lawn.rotation.x = -Math.PI / 2; lawn.position.y = 0.02; lawn.receiveShadow = true
  group.add(lawn)

  // 芒草（陽明山秋天的白背芒）——細長錐體隨機散在草地外圍
  const grassGeo = new THREE.ConeGeometry(0.25, 2.2, 4)
  const grassMat = new THREE.MeshStandardMaterial({ color: '#e9dcb0', roughness: 1 })
  const grass = new THREE.InstancedMesh(grassGeo, grassMat, 260)
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3()
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2, r = 22 + Math.random() * 9
    const sc = 0.7 + Math.random() * 0.8
    s.set(sc, sc, sc); q.setFromEuler(new THREE.Euler(0, a, (Math.random() - 0.5) * 0.3))
    m.compose(new THREE.Vector3(Math.cos(a) * r, 1.0 * sc, Math.sin(a) * r), q, s)
    grass.setMatrixAt(i, m)
  }
  group.add(grass)

  // 舞台：木質平台 + 前緣階梯 + 背板桁架
  const stage = new THREE.Group()
  const deck = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 7), new THREE.MeshStandardMaterial({ color: '#8c6a4a', roughness: 0.8 }))
  deck.position.y = 0.6; deck.castShadow = true; deck.receiveShadow = true
  stage.add(deck)
  const step = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 1.2), deck.material)
  step.position.set(0, 0.3, 4.1); stage.add(step)
  const trussMat = new THREE.MeshStandardMaterial({ color: '#2b3a44', roughness: 0.5, metalness: 0.6 })
  for (const x of [-6.5, 6.5]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 7.5, 8), trussMat)
    post.position.set(x, 4.5, -3.2); stage.add(post)
  }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 13.4, 8), trussMat)
  beam.rotation.z = Math.PI / 2; beam.position.set(0, 8.2, -3.2); stage.add(beam)
  // 背板：競選橘色橫幅
  // 背板背光，補一點自發光讓橘色不會變棕
  const bannerMat = new THREE.MeshStandardMaterial({ color: BRAND_ORANGE, emissive: BRAND_ORANGE, emissiveIntensity: 0.55, roughness: 0.9, side: THREE.DoubleSide })
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.6), bannerMat)
  banner.position.set(0, 6, -3.3); stage.add(banner)
  stage.position.z = -8
  group.add(stage)

  // 旗幟：兩支旗桿，旗面用 shader 飄動
  const flags: THREE.Mesh[] = []
  const flagKinds: ('island' | 'wave')[] = ['island', 'wave']
  flagKinds.forEach((kind, i) => {
    const x = i === 0 ? -9.5 : 9.5
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 12, 8), new THREE.MeshStandardMaterial({ color: '#dcdcdc', metalness: 0.5, roughness: 0.4 }))
    pole.position.set(x, 6, -7); group.add(pole)
    const geo = new THREE.PlaneGeometry(4.5, 3, 24, 12)
    const tex = makeFlagTexture(kind)
    const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.9 })
    const f = new THREE.Mesh(geo, mat)
    f.position.set(x + (i === 0 ? 2.3 : -2.3), 10.2, -7)
    f.castShadow = true
    f.userData.phase = i * 1.7
    group.add(f); flags.push(f)
  })

  // 雲：幾朵柔軟的 sprite 雲
  const clouds: THREE.Sprite[] = []
  const cloudTex = makeCloudTexture()
  for (let i = 0; i < 14; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.85, depthWrite: false }))
    const a = Math.random() * Math.PI * 2, r = 260 + Math.random() * 300
    sp.position.set(Math.cos(a) * r, 40 + Math.random() * 60, Math.sin(a) * r)
    const sc = 60 + Math.random() * 80
    sp.scale.set(sc, sc * 0.45, 1)
    sp.userData.speed = 0.3 + Math.random() * 0.5
    group.add(sp); clouds.push(sp)
  }

  // 光
  const hemi = new THREE.HemisphereLight('#bfe3ff', '#5a7a3a', 0.75)
  group.add(hemi)
  const dir = new THREE.DirectionalLight('#ffd9a8', 2.2)
  dir.position.set(-40, 30, -70)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  dir.shadow.camera.left = -30; dir.shadow.camera.right = 30; dir.shadow.camera.top = 30; dir.shadow.camera.bottom = -30
  dir.shadow.camera.near = 10; dir.shadow.camera.far = 200
  group.add(dir)
  scene.fog = new THREE.Fog('#c9dcea', 180, 700)

  const seaBase = (sea.geometry.attributes.position as THREE.BufferAttribute).array.slice() as Float32Array
  const flagBase = flags.map(f => (f.geometry.attributes.position as THREE.BufferAttribute).array.slice() as Float32Array)

  return {
    group, sea, flags, clouds,
    update(t) {
      // 海浪
      const p = sea.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < p.count; i++) {
        const x = seaBase[i * 3], z = seaBase[i * 3 + 2]
        p.setY(i, Math.sin(x * 0.02 + t * 0.9) * 2.2 + Math.cos(z * 0.025 + t * 0.7) * 1.8)
      }
      p.needsUpdate = true
      // 旗幟飄動
      flags.forEach((f, k) => {
        const fp = f.geometry.attributes.position as THREE.BufferAttribute
        const base = flagBase[k], ph = f.userData.phase as number
        const dirSign = k === 0 ? 1 : -1
        for (let i = 0; i < fp.count; i++) {
          const x = base[i * 3], y = base[i * 3 + 1]
          const d = (x * dirSign + 2.25) / 4.5 // 0 在旗桿側、1 在旗尾
          fp.setZ(i, Math.sin(d * 5 - t * 4 + ph + y * 0.6) * 0.35 * d)
        }
        fp.needsUpdate = true
        f.geometry.computeVertexNormals()
      })
      // 雲慢慢飄
      clouds.forEach(c => { c.position.x += c.userData.speed * 0.05; if (c.position.x > 600) c.position.x = -600 })
    },
  }
}

function makeCloudTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128
  const ctx = c.getContext('2d')!
  for (let i = 0; i < 9; i++) {
    const x = 40 + Math.random() * 176, y = 50 + Math.random() * 40, r = 25 + Math.random() * 30
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128)
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}
