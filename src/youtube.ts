// YouTube IFrame API：隱藏播放器只當背景音樂用（官方嵌入，不重製音檔）
declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void }
}

export const VIDEO_ID = 'jgz-Q6vC2gM' // 〈台北順起來〉官方 MV

export class Music {
  private player: any = null
  private ready = false
  private pendingPlay = false
  private volume = 100
  muted = false
  onState?: (playing: boolean) => void

  constructor(private elId: string) {
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
    window.onYouTubeIframeAPIReady = () => this.create()
  }

  private create() {
    this.player = new window.YT.Player(this.elId, {
      videoId: VIDEO_ID,
      playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: VIDEO_ID, playsinline: 1, rel: 0, origin: location.origin },
      events: {
        onReady: () => {
          this.ready = true
          this.applyVolume()
          if (this.pendingPlay) this.play()
        },
        onStateChange: (e: any) => this.onState?.(e.data === window.YT.PlayerState.PLAYING),
      },
    })
  }

  play() {
    if (!this.ready) { this.pendingPlay = true; return }
    this.player.playVideo()
  }

  setVolume(v: number, muted: boolean) {
    this.volume = Math.round(Math.max(0, Math.min(1, v)) * 100)
    this.muted = muted
    this.applyVolume()
  }

  toggleMute() { this.setVolume(this.volume / 100, !this.muted) }

  private applyVolume() {
    if (!this.ready) return
    this.player.setVolume(this.volume)
    this.muted ? this.player.mute() : this.player.unMute()
  }
}
