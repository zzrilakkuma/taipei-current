# 台北洋流舞台 🌊

> **粉絲創作，非官方網站。** 與沈伯洋競選團隊無關；內容友善正向，不攻擊任何人或政黨。

陽明山山頂的 3D 互動舞台：山海黃昏背景、橘色的台灣島旗與洋流旗在風中飄，沈伯洋在台上揮手，台下的洋流舉著螢光棒歡呼。
政見一條一條化成 3D 大字飛進舞台上空，底下的卡片附上 puma.taipei 的原始頁面連結；背景音樂是 YouTube 內嵌的〈台北順起來〉官方 MV。

🔗 https://zzrilakkuma.github.io/taipei-current/

## 操作

| 動作 | 電腦 | 手機 | 台北安可大舞台遙控器 |
| --- | --- | --- | --- |
| 下一條／上一條政見 | ↑ ↓、空白鍵 | 底部按鈕 | 🟢 綠 ／ 🔵 藍 |
| 全場歡呼 | C | 🙌 歡呼 | 🟡 黃 |
| 靜音 | 🔊 按鈕 | 🔊 按鈕 | 🔴 紅、音量鍵 |
| 轉動鏡頭、拉遠拉近 | 拖曳、滾輪 | 拖曳、雙指 | — |
| 轉台 | ← → | — | ← → |

可被任何網站用 `<iframe>` 嵌入（沒有 X-Frame-Options 或 `frame-ancestors` 限制）。

## 資料來源與素材

- 政見內容整理自 [puma.taipei 政策專區](https://puma.taipei/policies)（本站文字與政策專區圖文採 CC BY 4.0），每條政見卡片附原始頁面連結；HEART 政策生態系見 [puma.taipei/heart](https://puma.taipei/heart)。資料對照見 [`src/policies.ts`](src/policies.ts)。
- 3D 場景、人物、旗幟、山海、文字：全部由程式即時生成（Three.js），無外部照片或模型。
- 背景音樂：以 YouTube 官方播放器嵌入〈台北順起來〉官方 MV（沈伯洋台北市長競選總部），未重製音檔。
- 字型：系統字型。

## 製作工具

Three.js、Vite、TypeScript、YouTube IFrame API、GitHub Pages、Claude Code。

## 開發

```bash
npm install
npm run dev
```

MIT License。
