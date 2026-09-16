import { useState } from 'react'
import RegistrationForm from './RegistrationForm.jsx'
import ChatScrollDemo from './ChatScrollDemo.jsx'
import IdDemoLab from './IdDemoLab.jsx'

const MODES = [
  { value: 'imperative', label: '1️⃣ useImperativeHandle', Panel: RegistrationForm },
  { value: 'layout', label: '2️⃣ useLayoutEffect', Panel: ChatScrollDemo },
  { value: 'id', label: '3️⃣ useId', Panel: IdDemoLab },
]

/**
 * 今天的小專案：把 plan03.md Day17 提到的三個 Hook，各自做成一個獨立可操作的
 * 小實驗室，用分頁切換的方式呈現：
 *
 * 1. useImperativeHandle：forwardRef + useImperativeHandle 打造的自訂輸入框，
 *    暴露 focus()／clear()／shake() 給父層命令式呼叫。
 * 2. useLayoutEffect：同一段「新訊息抵達後，捲動到最下面」的邏輯，
 *    分別用 useEffect、useLayoutEffect 實作，直接比較會不會「先卡在舊的
 *    捲動位置一下下」。
 * 3. useId：同一個「地址欄位群組」元件在畫面上出現兩次，比較「寫死固定 id」
 *    與「用 useId 產生唯一 id」兩種寫法，實際點看看 label 有沒有接對 input。
 */
function ImperativeLayoutIdLab() {
  const [mode, setMode] = useState(MODES[0].value)
  const currentMode = MODES.find((item) => item.value === mode) ?? MODES[0]
  const Panel = currentMode.Panel

  return (
    <div className="lab-page">
      <header className="lab-header">
        <p className="eyebrow">Day 17 動手做</p>
        <h1>useImperativeHandle、useLayoutEffect、useId 實驗室</h1>
        <p className="subtitle">
          今天要學的三個 Hook 有一個共同點：它們都是為了處理「React
          宣告式渲染模型」沒辦法完全覆蓋的例外情況——命令式呼叫子元件方法、
          在瀏覽器繪製前搶先修正版面、產生跟渲染時機無關但穩定唯一的 ID。
          切換下方分頁，逐一動手驗證每個 Hook 實際解決的問題。
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

      <Panel />
    </div>
  )
}

export default ImperativeLayoutIdLab
