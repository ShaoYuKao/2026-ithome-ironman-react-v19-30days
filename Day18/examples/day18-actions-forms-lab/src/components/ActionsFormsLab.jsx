import { useState } from 'react'
import RegistrationForm from './RegistrationForm.jsx'
import CommentBoard from './CommentBoard.jsx'

const MODES = [
  { value: 'register', label: '1️⃣ 會員註冊（useActionState）', Panel: RegistrationForm },
  { value: 'comments', label: '2️⃣ 留言板（useOptimistic）', Panel: CommentBoard },
]

/**
 * 今天的小專案：把 plan03.md Day18 提到的 Actions／表單 Hooks，做成兩個
 * 獨立可操作的小實驗室，用分頁切換的方式呈現：
 *
 * 1. useActionState + useFormStatus：把 Day09 的會員註冊表單改寫成
 *    <form action={...}>，用一個 action 函式取代「onSubmit + 一堆
 *    useState」，並串接真正的 Express 後端做非同步驗證。
 * 2. useOptimistic：一個留言板，送出留言立刻樂觀顯示，稍後才由伺服器
 *    結果覆蓋（或在失敗時消失），並可切換「送出模式」重現不同狀況。
 */
function ActionsFormsLab() {
  const [mode, setMode] = useState(MODES[0].value)
  const currentMode = MODES.find((item) => item.value === mode) ?? MODES[0]
  const Panel = currentMode.Panel

  return (
    <div className="lab-page">
      <header className="lab-header">
        <p className="eyebrow">Day 18 動手做</p>
        <h1>Actions 與表單實驗室</h1>
        <p className="subtitle">
          React 19 的 Actions 系列 Hook，把非同步送出邏輯（pending、錯誤、樂觀更新）從一堆
          手動管理的 state，收斂成「<code>{'<form action={fn}>'}</code> + 幾個新 Hook」。
          切換下方分頁，動手驗證每個 Hook 實際解決的問題；背後真的有一個 Express 伺服器
          （<code>server/</code>）在處理請求、模擬網路延遲與錯誤。
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

export default ActionsFormsLab
