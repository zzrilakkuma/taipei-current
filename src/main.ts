import * as THREE from 'three'
import { buildWorld } from './world'
import { makePuma, makeCrowd, CheerBubbles } from './figures'
import { makeTextSprite } from './text'
import { POLICIES, HEART, type Policy } from './policies'
import { Music } from './youtube'

// ---------- 渲染器與鏡頭 ----------
const canvas = document.getElementById('scene') as HTMLCanvasElement
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000)

// 簡易軌道鏡頭：繞著舞台轉、可拉遠拉近（手機拖曳／雙指）
const orbit = { theta: 0, phi: 0.32, radius: 26, target: new THREE.Vector3(0, 3, -6) }
const orbitGoal = { theta: 0, phi: 0.32, radius: 26 }
let dragging = false, lastX = 0, lastY = 0, pinchDist = 0
canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId) })
canvas.addEventListener('pointermove', e => {
  if (!dragging) return
  orbitGoal.theta -= (e.clientX - lastX) * 0.005
  orbitGoal.phi = THREE.MathUtils.clamp(orbitGoal.phi + (e.clientY - lastY) * 0.004, 0.08, 0.9)
  lastX = e.clientX; lastY = e.clientY
})
canvas.addEventListener('pointerup', () => { dragging = false })
canvas.addEventListener('pointercancel', () => { dragging = false })
canvas.addEventListener('wheel', e => { orbitGoal.radius = THREE.MathUtils.clamp(orbitGoal.radius + e.deltaY * 0.03, 10, 60) }, { passive: true })
canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) { dragging = false; pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) } }, { passive: true })
canvas.addEventListener('touchmove', e => {
  if (e.touches.length !== 2) return
  const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
  orbitGoal.radius = THREE.MathUtils.clamp(orbitGoal.radius + (pinchDist - d) * 0.06, 10, 60)
  pinchDist = d
}, { passive: true })

function resize() {
  const w = innerWidth, h = innerHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  // 直式手機把鏡頭拉遠一點，舞台和觀眾才都在畫面裡
  orbitGoal.radius = THREE.MathUtils.clamp(orbitGoal.radius, 10, 60)
  if (h > w) orbit.target.set(0, 4, -6)
}
addEventListener('resize', resize)
resize()
if (innerHeight > innerWidth) orbitGoal.radius = 34

// ---------- 世界、人物、觀眾 ----------
const world = buildWorld(scene)

// 沈伯洋：台上揮手（高瘦、短捲髮、黑框眼鏡、淡色西裝）
const puma = makePuma(1.3)
puma.group.position.set(0, 1.2, -8)
scene.add(puma.group)

// 台上名牌
const nameTag = makeTextSprite('沈伯洋', { size: 72, color: '#fff', bg: 'rgba(11,31,42,0.75)', scale: 1 / 60 })
nameTag.position.set(0, 6.1, -10.6)
scene.add(nameTag)
const slogan = makeTextSprite('台北順起來・台北洋流', { size: 64, color: '#ffffff', stroke: 'rgba(0,0,0,0.25)', scale: 1 / 46 })
slogan.position.set(0, 7.35, -10.6)
for (const s of [nameTag, slogan]) { s.material.depthTest = false; s.renderOrder = 5 }
scene.add(slogan)

const crowd = makeCrowd(innerWidth < 600 ? 300 : 460)
scene.add(crowd.group)
const bubbles = new CheerBubbles(crowd)
scene.add(bubbles.group)

// ---------- 政見：3D 文字飛進來 + HTML 卡片 ----------
const card = document.getElementById('card')!
const cardCat = card.querySelector('.cat') as HTMLElement
const cardTtl = card.querySelector('.ttl') as HTMLElement
const cardDtl = card.querySelector('.dtl') as HTMLElement
const cardSrc = card.querySelector('.src') as HTMLAnchorElement
const heartBar = document.getElementById('heart-bar')!
for (const k of Object.keys(HEART) as (keyof typeof HEART)[]) {
  const chip = document.createElement('span')
  chip.className = 'chip'; chip.dataset.k = k
  chip.innerHTML = `<i style="background:${HEART[k].color}"></i>${k}・${HEART[k].name.split(' ')[1]}`
  chip.title = HEART[k].desc
  heartBar.appendChild(chip)
}

let policyIndex = -1
let flyer: { s: THREE.Sprite; t0: number } | null = null
let hype = 0 // 觀眾興奮度 0~1，歡呼鍵會拉高
let autoTimer = 0

function showPolicy(i: number) {
  policyIndex = (i + POLICIES.length) % POLICIES.length
  const p: Policy = POLICIES[policyIndex]
  const color = HEART[p.heart].color
  cardCat.textContent = `${p.category}　·　${p.heart} ${HEART[p.heart].name}`
  cardTtl.textContent = p.title
  cardDtl.textContent = p.detail
  cardSrc.href = p.source
  cardSrc.textContent = `資料來源：${decodeURIComponent(p.source.replace('https://', ''))}`
  card.style.borderLeftColor = color
  card.classList.remove('hidden')
  heartBar.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', (c as HTMLElement).dataset.k === p.heart))

  // 3D 大字從畫面外飛到舞台上空
  if (flyer) { scene.remove(flyer.s); flyer.s.material.map?.dispose(); flyer.s.material.dispose() }
  const s = makeTextSprite(p.title, { size: 96, color: '#fff', bg: color, scale: 1 / 64 })
  s.position.set(45, 16, -40)
  scene.add(s)
  flyer = { s, t0: clock.elapsedTime }

  // 台下跟著喊
  for (let k = 0; k < 4; k++) setTimeout(() => bubbles.spawn(k === 0 ? `${p.title}！` : undefined), 300 + k * 350)
  autoTimer = 0
  hype = Math.min(1, hype + 0.25)
}

function cheer() {
  hype = 1
  for (let k = 0; k < 10; k++) setTimeout(() => bubbles.spawn(), k * 120)
}

// ---------- 音樂 ----------
const music = new Music('yt')
const muteBtn = document.getElementById('mute') as HTMLButtonElement
music.onState = () => { muteBtn.textContent = music.muted ? '🔇' : '🔊' }

// ---------- UI ----------
document.getElementById('next')!.onclick = () => showPolicy(policyIndex + 1)
document.getElementById('prev')!.onclick = () => showPolicy(policyIndex - 1)
document.getElementById('cheer')!.onclick = cheer
muteBtn.onclick = () => { music.toggleMute(); muteBtn.textContent = music.muted ? '🔇' : '🔊' }
document.getElementById('about')!.onclick = () => document.getElementById('aboutPanel')!.classList.remove('hidden')
document.getElementById('aboutClose')!.onclick = () => document.getElementById('aboutPanel')!.classList.add('hidden')
const startEl = document.getElementById('start')!
let started = false
function start() {
  if (started) return
  started = true
  startEl.classList.add('hidden')
  music.play()
  setTimeout(() => showPolicy(0), 1200)
  cheer()
}
document.getElementById('play')!.onclick = start

// ---------- 台北安可大舞台遙控器 ----------
window.addEventListener('message', e => {
  const d = e.data
  if (!d || typeof d !== 'object') return
  if (d.type === 'encore:volume') { music.setVolume(d.volume ?? 1, !!d.muted); muteBtn.textContent = music.muted ? '🔇' : '🔊' }
  if (d.type === 'encore:color') {
    if (d.color === 'green') showPolicy(policyIndex + 1)
    if (d.color === 'blue') showPolicy(policyIndex - 1)
    if (d.color === 'yellow') cheer()
    if (d.color === 'red') { music.toggleMute(); muteBtn.textContent = music.muted ? '🔇' : '🔊' }
    if (!started) start()
  }
})
window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight'].includes(e.key) && parent !== window) parent.postMessage({ type: 'encore:key', key: e.key }, '*')
  if (e.key === ' ' || e.key === 'Enter') { started ? showPolicy(policyIndex + 1) : start() }
  if (e.key === 'ArrowUp') showPolicy(policyIndex + 1)
  if (e.key === 'ArrowDown') showPolicy(policyIndex - 1)
  if (e.key.toLowerCase() === 'c') cheer()
})

// ---------- 主迴圈 ----------
const clock = new THREE.Clock()
let last = 0
function frame() {
  requestAnimationFrame(frame)
  const t = clock.getElapsedTime()
  const dt = Math.min(0.05, t - last); last = t

  // 鏡頭緩動
  orbit.theta += (orbitGoal.theta - orbit.theta) * 0.08
  orbit.phi += (orbitGoal.phi - orbit.phi) * 0.08
  orbit.radius += (orbitGoal.radius - orbit.radius) * 0.08
  const idle = dragging ? 0 : Math.sin(t * 0.15) * 0.12
  camera.position.set(
    orbit.target.x + Math.sin(orbit.theta + idle) * Math.cos(orbit.phi) * orbit.radius,
    orbit.target.y + Math.sin(orbit.phi) * orbit.radius,
    orbit.target.z + Math.cos(orbit.theta + idle) * Math.cos(orbit.phi) * orbit.radius,
  )
  camera.lookAt(orbit.target)

  world.update(t)

  // 沈伯洋揮手 + 微微搖擺
  puma.rightArm.rotation.z = -2.4 + Math.sin(t * 6) * 0.35
  puma.rightArm.rotation.x = Math.sin(t * 6) * 0.15
  puma.leftArm.rotation.z = 0.25 + Math.sin(t * 2) * 0.08
  puma.group.rotation.y = Math.sin(t * 0.8) * 0.25
  puma.group.position.y = 1.2 + Math.abs(Math.sin(t * 3)) * 0.12
  puma.head.rotation.y = Math.sin(t * 1.3) * 0.3

  hype = Math.max(0.15, hype - dt * 0.08)
  crowd.update(t, hype)
  bubbles.update(t)

  // 政見大字飛行：先飛進舞台上空，再慢慢懸浮
  if (flyer) {
    const age = t - flyer.t0
    const k = 1 - Math.pow(1 - Math.min(1, age / 1.1), 3)
    flyer.s.position.x = 45 * (1 - k)
    flyer.s.position.z = -40 + 23 * k
    flyer.s.position.y = 16 - 3.2 * k + Math.sin(t * 1.5) * 0.25
  }

  // 自動輪播政見
  if (started) { autoTimer += dt; if (autoTimer > 9) showPolicy(policyIndex + 1) }
  // 平常偶爾也有人喊
  if (started && Math.random() < dt * 1.2) bubbles.spawn()

  renderer.render(scene, camera)
}
frame()
