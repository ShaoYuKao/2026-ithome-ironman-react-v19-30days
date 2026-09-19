import { useState } from 'react'
import UserProfileLab from './UserProfileLab.jsx'
import PriceFormattingLab from './PriceFormattingLab.jsx'

const MODES = [
  { value: 'profile', label: '1️⃣ 使用者卡片（use + Suspense）', Panel: UserProfileLab },
  { value: 'price', label: '2️⃣ 價格格式化（use 條件式讀取）', Panel: PriceFormattingLab },
]

/**
 * 今天的小專案：把 plan03.md Day19 提到的 use()／Suspense，做成兩個
 * 獨立可操作的小實驗室，用分頁切換的方式呈現：
 *
 * 1. use(promise) + Suspense：非同步讀取使用者資料，實測 Promise 快取、
 *    手動刷新、讀取失敗（Error Boundary）三種情境。
 * 2. use(context)：在 .map() 迴圈中依每一列的勾選狀態，條件式地呼叫
 *    use() 讀取 Context，對照 useContext 做不到這件事。
 */
function UseSuspenseLab() {
  const [mode, setMode] = useState(MODES[0].value)
  const currentMode = MODES.find((item) => item.value === mode) ?? MODES[0]
  const Panel = currentMode.Panel

  return (
    <div className="lab-page">
      <header className="lab-header">
        <p className="eyebrow">Day 19 動手做</p>
        <h1>
          <code>use</code> 與 Suspense 實驗室
        </h1>
        <p className="subtitle">
          React 19 的 <code>use()</code> 可以讀取 Promise 或 Context，且能在
          條件式、迴圈中呼叫；搭配 <code>Suspense</code>，資料還沒準備好之前
          會先顯示 fallback 畫面。切換下方分頁，動手驗證這兩件事實際運作的
          樣子；背後真的有一個 Express 伺服器（<code>server/</code>）提供
          使用者資料。
        </p>
      </header>

      <div className="mode-tabs" role="tablist" aria-label="切換示範模式">
        {MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={mode === item.value}
            className={mode === item.value ? 'mode-tab mode-tab--active' : 'mode-tab'}
            onClick={() => setMode(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Panel />
    </div>
  )
}

export default UseSuspenseLab
