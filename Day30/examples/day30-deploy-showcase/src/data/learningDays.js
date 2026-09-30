// learningDays：把 plan03.md 的 30 天課程大綱，整理成資料陣列。
//
// 這份資料刻意寫成純 JavaScript（沒有任何後端 API），因為今天的重點是
// 「部署」而不是「資料請求」——靜態託管平台（GitHub Pages／Vercel／Netlify）
// 本來就只能放靜態檔案，沒辦法像 Day20、Day27、Day28 那樣跑一個常駐的
// Node.js/Express 後端，所以最貼近實際情境的做法，就是把資料直接打包
// 進前端程式碼裡（詳見本篇 README「為什麼今天的範例沒有後端 API」）。
export const learningDays = [
  { day: 1, week: '第一週．React 基礎入門', title: 'React 是什麼 & 開發環境建置' },
  { day: 2, week: '第一週．React 基礎入門', title: 'JSX 語法' },
  { day: 3, week: '第一週．React 基礎入門', title: '元件（Component）與 Props' },
  { day: 4, week: '第一週．React 基礎入門', title: 'State 與 useState' },
  { day: 5, week: '第一週．React 基礎入門', title: '事件處理（Event Handling）' },
  { day: 6, week: '第一週．React 基礎入門', title: '條件渲染 & 列表渲染' },
  { day: 7, week: '第一週．React 基礎入門', title: '週複習與小專案：待辦清單 App' },
  { day: 8, week: '第二週．Hooks 核心與表單', title: 'useEffect 副作用處理' },
  { day: 9, week: '第二週．Hooks 核心與表單', title: '表單處理進階' },
  { day: 10, week: '第二週．Hooks 核心與表單', title: 'useRef 與 DOM 操作' },
  { day: 11, week: '第二週．Hooks 核心與表單', title: 'useContext 與跨層級資料傳遞' },
  { day: 12, week: '第二週．Hooks 核心與表單', title: 'useReducer 複雜狀態管理' },
  { day: 13, week: '第二週．Hooks 核心與表單', title: '自訂 Hook（Custom Hook）入門' },
  { day: 14, week: '第二週．Hooks 核心與表單', title: '週複習與小專案：多分頁資料切換 App' },
  { day: 15, week: '第三週．效能優化與 React 19', title: 'useMemo 與 useCallback' },
  { day: 16, week: '第三週．效能優化與 React 19', title: 'useTransition 與 useDeferredValue' },
  {
    day: 17,
    week: '第三週．效能優化與 React 19',
    title: 'useImperativeHandle、useLayoutEffect、useId',
  },
  { day: 18, week: '第三週．效能優化與 React 19', title: 'React 19 新特性（一）：Actions 與表單' },
  { day: 19, week: '第三週．效能優化與 React 19', title: 'React 19 新特性（二）：use 與 Suspense' },
  { day: 20, week: '第三週．效能優化與 React 19', title: '資料請求與非同步處理實戰' },
  {
    day: 21,
    week: '第三週．效能優化與 React 19',
    title: '週複習與小專案：效能優化 + 自訂 Hook 函式庫',
  },
  { day: 22, week: '第四週．路由與全域狀態管理', title: 'React Router 基礎' },
  { day: 23, week: '第四週．路由與全域狀態管理', title: 'React Router 進階：巢狀路由與動態參數' },
  { day: 24, week: '第四週．路由與全域狀態管理', title: 'React Router：資料載入與保護路由' },
  { day: 25, week: '第四週．路由與全域狀態管理', title: '狀態管理概念 & Redux 核心' },
  { day: 26, week: '第四週．路由與全域狀態管理', title: 'Redux Toolkit 實戰（一）' },
  { day: 27, week: '第四週．路由與全域狀態管理', title: 'Redux Toolkit 實戰（二）：非同步處理' },
  { day: 28, week: '第四週．路由與全域狀態管理', title: '週複習與小專案：多頁面電商購物車 App' },
  { day: 29, week: '收尾週．整合、測試與部署', title: '程式碼品質與測試基礎' },
  { day: 30, week: '收尾週．整合、測試與部署', title: '專案整合與部署上線' },
]

// formatDayNumber：把 1 補成 "01"、30 維持 "30"，對應 Books/DayXX 的資料夾命名規則。
export function formatDayNumber(day) {
  return String(day).padStart(2, '0')
}

// buildDayReadmeUrl：組出「這一天教學文件」在 GitHub 上的完整網址。
//
// 特別把「GitHub repo 網址」抽成環境變數 VITE_GITHUB_REPO_URL（見 .env），
// 而不是寫死在程式碼裡：同一份程式碼，只要換一個 .env 設定值，
// 部署到任何人自己的 GitHub 帳號下都能自動組出正確的連結，
// 不需要改任何一行 JavaScript——這正是本篇 README 第三節要說明的
// 「環境變數讓同一份建置結果，能套用到不同環境」的具體案例。
export function buildDayReadmeUrl(day) {
  const repoUrl = (import.meta.env.VITE_GITHUB_REPO_URL || '').replace(/\/+$/, '')
  return `${repoUrl}/blob/main/Books/Day${formatDayNumber(day)}/README.md`
}
