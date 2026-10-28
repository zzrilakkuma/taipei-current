// 政見資料：全部整理自 puma.taipei 政策專區（本站文字與政策專區圖文採 CC BY 4.0）。
// 每一條都附該政策的原始頁面網址，畫面上會顯示資料來源連結。

export interface Policy {
  /** HEART 分類：H 空間、E 培力、A 陪伴、R 韌性、T 時間 */
  heart: 'H' | 'E' | 'A' | 'R' | 'T'
  category: string
  title: string
  detail: string
  source: string
}

const P = (slug: string) => `https://puma.taipei/policies/${encodeURIComponent(slug)}`

export const POLICIES: Policy[] = [
  // 教育
  { heart: 'A', category: '教育政策', title: '教師不超載，學習更有感', detail: '117 學年度國小每班降至 24 人、國中 25 人，試辦雙導師與行政助理。', source: P('教育政策') },
  { heart: 'A', category: '教育政策', title: '幼教環境再提升', detail: '幼幼班降至每班 10 人、幼兒園 24 人，推動公幼專任主任制度。', source: P('教育政策') },
  { heart: 'R', category: '教育政策', title: '孩子的安全不能等', detail: '四層策略反毒，八年內改善 150 所通學區。', source: P('教育政策') },
  { heart: 'E', category: '教育政策', title: '讓 AI 成為教育資源', detail: '補助市立學校採購教育版 AI 工具，校管帳號、限定時段、教師在場。', source: P('教育政策') },
  // 交通
  { heart: 'R', category: '交通政策', title: '通學區安全改善', detail: '學校周邊 150 公尺統一工程規格，低成本試辦、成效確認後永久化。', source: P('交通政策') },
  { heart: 'T', category: '交通政策', title: '自行車通勤路網', detail: '迎風—港墘跨基隆河專用橋，YouBike 2.0E 尖峰前 30 分鐘免費。', source: P('交通政策') },
  { heart: 'T', category: '交通政策', title: '共享電動機車納入 TPASS', detail: '記名 TPASS 每日前 10 分鐘免費，媒合路外停車場。', source: P('交通政策') },
  { heart: 'R', category: '交通政策', title: '公車安全改革', detail: '重新設計駕駛座告警與螢幕，折返點休息納入班表。', source: P('交通政策') },
  // 社福
  { heart: 'A', category: '社福政策', title: '長者尊嚴安居', detail: '彈性臨時托老券、在宅醫療，以都更與退場學校用地增加住宿型機構。', source: P('社福政策') },
  { heart: 'A', category: '社福政策', title: '15–65 歲免費心理諮商', detail: '產後媽媽加碼；50 歲以上補助一劑皮蛇疫苗。', source: P('社福政策') },
  { heart: 'R', category: '社福政策', title: '兒少安全治理中心', detail: '0–6 歲免費腸病毒疫苗，跨局處整合數據做事故回溯與風險預防。', source: P('社福政策') },
  { heart: 'R', category: '社福政策', title: '女性安全審計', detail: '由下而上檢視公共空間安全，設立單身女性專屬服務專線。', source: P('社福政策') },
  // 文化徑×山林徑
  { heart: 'H', category: '台北文化徑×山林徑', title: '四條台北文化徑', detail: '城市歷史記憶、現代台北、產業文化遺跡、多元族群。', source: P('台北文化徑×山林徑') },
  { heart: 'H', category: '台北文化徑×山林徑', title: '三個登山觀光中心', detail: '北劍潭、東象山、南貓空：裝備租借、四語導覽、步道狀態預約。', source: P('台北文化徑×山林徑') },
  // 都市微森林
  { heart: 'H', category: '都市微森林', title: '窗前可見 3 棵樹', detail: '全市樹木覆蓋率 20%、綠覆率 30%，每位市民 300 公尺內有綠蔭公園。', source: P('都市微森林') },
  { heart: 'H', category: '都市微森林', title: '200 座口袋公園', detail: '閒置土地規劃口袋公園，導入數位雙生與樹木健康履歷。', source: P('都市微森林') },
  { heart: 'H', category: '都市微森林', title: '先有根域，才准種樹', detail: '樹木版都市計畫：以街廓、道路與公園為單位規劃種植與管理。', source: P('都市微森林') },
  // 青年
  { heart: 'E', category: '青年政策', title: '城市青年基金', detail: '18–22 歲青年每月提撥 1,500 元，弱勢青年加碼至 3,000 元。', source: P('青年政策') },
  { heart: 'E', category: '青年政策', title: '青年 AI 教育錢包', detail: '整合多家 AI 模型的台北青年平台，免先墊款、按使用量結算。', source: P('青年政策') },
  { heart: 'E', category: '青年政策', title: '台北青年圓夢計畫', detail: '串聯海外學習、市政實習、公共參與與創業資源。', source: P('青年政策') },
  // 運動
  { heart: 'T', category: '運動政策', title: '社區運動小巴', detail: '巡迴車輛主動接近市民，提供專業指導與營養諮詢。', source: P('運動政策') },
  { heart: 'T', category: '運動政策', title: '運動驛站', detail: '重點捷運站旁與登山口設據點，行程空檔也能運動。', source: P('運動政策') },
  { heart: 'E', category: '運動政策', title: '關渡國際足球場', detail: '符合國際賽事標準，帶動區域發展；花博旗艦運動中心補足大眾運動需求。', source: P('運動政策') },
  // 家庭一站通
  { heart: 'A', category: '家庭一站通', title: '每區設家庭支持服務站', detail: '以家庭教育中心為基礎逐步擴充，服務 0–18 歲孩子的家庭。', source: P('家庭一站通') },
  { heart: 'T', category: '家庭一站通', title: '每週固定時數免費臨托', detail: '滿 6 個月至 6 歲孩子，讓家長有喘息時間。', source: P('家庭一站通') },
  { heart: 'A', category: '家庭一站通', title: '增設夜間托育據點', detail: '在夜市、百貨等夜間工作場所附近設托育點。', source: P('家庭一站通') },
  // 親子同行卡
  { heart: 'A', category: '親子同行卡', title: '親子同行卡每月 600 點', detail: '設籍台北 0–18 歲每人每月 600 點，文化幣、運動幣、閱讀禮袋。', source: P('親子同行卡') },
  { heart: 'A', category: '親子同行卡', title: '分齡閱讀禮袋', detail: '出生閱讀袋（0 歲）、語言探索袋（2 歲）、入學準備袋（5 歲）。', source: P('親子同行卡') },
]

export const HEART: Record<Policy['heart'], { name: string; color: string; desc: string }> = {
  H: { name: 'Habitat 空間', color: '#5fd38a', desc: '把好好生活的空間還給台北人' },
  E: { name: 'Empower 培力', color: '#ffb347', desc: '把發展的機會留在台北' },
  A: { name: 'Accompany 陪伴', color: '#ff7eb6', desc: '讓每個人生階段都有城市支持' },
  R: { name: 'Resilience 韌性', color: '#6ec6ff', desc: '把城市的根扎得更深' },
  T: { name: 'Time 時間', color: '#c9a7ff', desc: '把生活的時間還給台北人' },
}

export const HEART_SOURCE = 'https://puma.taipei/heart'

/** 台下觀眾的歡呼詞（粉絲創作，語氣友善正向） */
export const CHEERS = [
  '台北順起來！', '洋流來襲！', '伯洋加油！', '順起來～', '一起順起來！',
  '窗前三棵樹！', '通學區安全！', '免費臨托讚！', '口袋公園好！', '運動小巴來了！',
  '青年基金！', '文化徑走起！', '陽明山見！', '洋流 GO！', '台北讚！',
]
