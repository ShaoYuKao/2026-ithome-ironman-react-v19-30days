import { useState } from 'react'
import { generateContacts } from '../utils/generateContacts.js'
import { CONTACT_COUNT } from '../utils/searchContacts.js'
import SyncSearchBoard from './SyncSearchBoard.jsx'
import DeferredSearchBoard from './DeferredSearchBoard.jsx'
import TransitionSearchBoard from './TransitionSearchBoard.jsx'

const MODES = [
  { value: 'sync', label: '無優化（Sync）', Board: SyncSearchBoard },
  { value: 'deferred', label: 'useDeferredValue', Board: DeferredSearchBoard },
  { value: 'transition', label: 'useTransition', Board: TransitionSearchBoard },
]

/**
 * 今天的小專案：一個「搜尋大量聯絡人」的頁面，用同一份資料、同一個昂貴的
 * searchContacts 運算，讓你可以直接切換「無優化」／「useDeferredValue」／
 * 「useTransition」三種寫法，在同一台電腦上肉眼比較打字時的手感差異。
 *
 * 建議操作方式：切到「無優化」分頁，在輸入框裡快速連續打字（例如打「陳小明」），
 * 感受一下畫面「卡頓、落後」的感覺；再切到另外兩個分頁，用同樣的方式打字，
 * 感受輸入框本身「完全不卡」、但清單結果會晚一點才跟上的差異。
 */
function TransitionDeferredLab() {
  // 惰性初始化（Day04、Day12、Day15 都用過）：只有第一次渲染時，
  // () => generateContacts(CONTACT_COUNT) 才會真的被呼叫一次。
  const [contacts] = useState(() => generateContacts(CONTACT_COUNT))
  const [mode, setMode] = useState(MODES[0].value)

  const currentMode = MODES.find((item) => item.value === mode) ?? MODES[0]
  const Board = currentMode.Board

  return (
    <div className="lab-page">
      <header className="lab-header">
        <p className="eyebrow">Day 16 動手做</p>
        <h1>useTransition 與 useDeferredValue 搜尋實驗室</h1>
        <p className="subtitle">
          {CONTACT_COUNT.toLocaleString()} 筆假聯絡人資料、一段刻意設計得很花時間的「關聯分數」計算——
          切換下方分頁，比較「無優化」「useDeferredValue」「useTransition」三種寫法，
          在同一段昂貴運算之下，打字手感有什麼不同。
        </p>
      </header>

      <div className="mode-tabs" role="tablist" aria-label="切換示範模式">
        {MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={mode === item.value}
            className={
              mode === item.value ? 'mode-tab mode-tab--active' : 'mode-tab'
            }
            onClick={() => setMode(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Board contacts={contacts} />
    </div>
  )
}

export default TransitionDeferredLab
