import * as THREE from 'three'

const FONT = '-apple-system, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif'

export interface TextSpriteOptions {
  size?: number       // 字級（畫布像素）
  color?: string
  bg?: string         // 背景（泡泡）顏色；空字串＝無背景
  stroke?: string
  padding?: number
  bold?: boolean
  tail?: boolean      // 對話泡泡尾巴
  scale?: number      // 畫布像素 → 世界單位
}

/** 用 2D canvas 畫中文字，做成 Sprite（Three.js 內建字型不含中文）。 */
export function makeTextSprite(text: string, o: TextSpriteOptions = {}): THREE.Sprite {
  const size = o.size ?? 64
  const pad = o.padding ?? size * 0.5
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  ctx.font = `${o.bold === false ? 500 : 900} ${size}px ${FONT}`
  const w = Math.ceil(ctx.measureText(text).width + pad * 2)
  const h = Math.ceil(size * 1.4 + pad * 1.2 + (o.tail ? size * 0.5 : 0))
  c.width = w; c.height = h
  ctx.font = `${o.bold === false ? 500 : 900} ${size}px ${FONT}`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const bodyH = h - (o.tail ? size * 0.5 : 0)
  if (o.bg) {
    ctx.fillStyle = o.bg
    roundRect(ctx, 2, 2, w - 4, bodyH - 4, Math.min(bodyH * 0.45, size))
    ctx.fill()
    if (o.tail) {
      ctx.beginPath()
      ctx.moveTo(w * 0.5 - size * 0.35, bodyH - 6)
      ctx.lineTo(w * 0.5, h - 2)
      ctx.lineTo(w * 0.5 + size * 0.35, bodyH - 6)
      ctx.closePath(); ctx.fill()
    }
  }
  if (o.stroke) { ctx.lineWidth = size * 0.16; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(text, w / 2, bodyH / 2) }
  ctx.fillStyle = o.color ?? '#fff'
  ctx.fillText(text, w / 2, bodyH / 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  const s = new THREE.Sprite(mat)
  const k = o.scale ?? 1 / 64
  s.scale.set(w * k, h * k, 1)
  return s
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 旗面貼圖：以 canvas 畫出（自製，不使用外部圖片）。 */
/** 競選主色：puma.taipei 的橘色 */
export const BRAND_ORANGE = '#db6a41'

export function makeFlagTexture(kind: 'island' | 'wave'): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 342
  const ctx = c.getContext('2d')!
  ctx.fillStyle = BRAND_ORANGE; ctx.fillRect(0, 0, 512, 342)
  if (kind === 'island') {
    // 橘底白色台灣島（自行繪製）
    drawTaiwanIsland(ctx, 256, 171, 120, '#ffffff')
  } else {
    // 橘底白色洋流波浪（自製設計）
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 22; ctx.lineCap = 'round'
    for (const y of [120, 171, 222]) {
      ctx.beginPath()
      for (let x = 70; x <= 442; x += 8) { const Y = y + Math.sin((x - 70) / 40) * 18; x === 70 ? ctx.moveTo(x, Y) : ctx.lineTo(x, Y) }
      ctx.stroke()
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** 簡化的台灣島輪廓（手繪多邊形） */
function drawTaiwanIsland(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  const pts: [number, number][] = [
    [0.05, -1.0], [0.28, -0.82], [0.4, -0.55], [0.42, -0.2], [0.33, 0.15], [0.2, 0.5], [0.05, 0.85], [-0.08, 1.0],
    [-0.2, 0.8], [-0.3, 0.45], [-0.42, 0.1], [-0.45, -0.25], [-0.35, -0.6], [-0.18, -0.88],
  ]
  ctx.fillStyle = color
  ctx.beginPath()
  pts.forEach(([x, y], i) => { const X = cx + x * r * 0.9, Y = cy + y * r; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y) })
  ctx.closePath(); ctx.fill()
}
