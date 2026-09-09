import { useRef, useState } from 'react'

// 實驗一：受控元件（Controlled Component） vs 非受控元件（Uncontrolled Component）
//
// 受控元件：<input> 的 value 完全由 React state 決定，每次按鍵都會觸發 onChange，
//          state 更新 -> 重新渲染 -> input 顯示最新的 state，資料的「唯一真相來源（single source of truth）」是 state。
// 非受控元件：<input> 的值交給瀏覽器 DOM 自己管理，React 只在「需要的那一刻」（例如按下按鈕、送出表單）
//          透過 useRef 取得 inputRef.current.value，平常打字並不會觸發 React 重新渲染。
function ControlledVsUncontrolled() {
  // 受控元件：文字必須存進 state，畫面上的「即時顯示」才讀得到最新內容。
  const [controlledValue, setControlledValue] = useState('')

  // 非受控元件：用 useRef 拿到 DOM 節點，平常不需要任何 state，
  // 只有點擊「讀取目前的值」按鈕時，才主動去讀 inputRef.current.value。
  const uncontrolledInputRef = useRef(null)
  const [uncontrolledSnapshot, setUncontrolledSnapshot] = useState('（尚未讀取）')

  function handleReadUncontrolledValue() {
    setUncontrolledSnapshot(uncontrolledInputRef.current.value)
  }

  function handleFocusUncontrolled() {
    uncontrolledInputRef.current.focus()
  }

  return (
    <section className="card">
      <h2>1️⃣ 受控元件 vs 非受控元件</h2>
      <p className="card-desc">
        左邊是<strong>受控元件</strong>：<code>value</code> 綁定 state、<code>onChange</code>{' '}
        更新 state，畫面上的「即時顯示文字」才能跟著每一個按鍵同步更新。
        右邊是<strong>非受控元件</strong>：完全不設定 <code>value</code>，改用{' '}
        <code>useRef</code> 取得 DOM 節點，只有按下按鈕的那一刻才去讀取
        <code>ref.current.value</code>，平時打字不會觸發 React 重新渲染。
      </p>

      <div className="compare-grid">
        <div className="compare-col">
          <label className="form-label" htmlFor="controlled-input">
            受控元件（Controlled）
          </label>
          <input
            id="controlled-input"
            type="text"
            className="form-input"
            placeholder="輸入任何文字試試看"
            value={controlledValue}
            onChange={(event) => setControlledValue(event.target.value)}
          />
          <p className="live-echo">
            即時顯示：<strong>{controlledValue || '（尚未輸入）'}</strong>
          </p>
          <p className="form-hint">每按一個字，state 就更新一次，這裡的文字會「立刻」跟著變化。</p>
        </div>

        <div className="compare-col">
          <label className="form-label" htmlFor="uncontrolled-input">
            非受控元件（Uncontrolled）
          </label>
          <input
            id="uncontrolled-input"
            type="text"
            className="form-input"
            placeholder="輸入任何文字試試看"
            defaultValue=""
            ref={uncontrolledInputRef}
          />
          <div className="button-row">
            <button type="button" className="secondary-btn" onClick={handleReadUncontrolledValue}>
              讀取目前的值
            </button>
            <button type="button" className="secondary-btn" onClick={handleFocusUncontrolled}>
              聚焦輸入框
            </button>
          </div>
          <p className="live-echo">
            最後一次讀取到的值：<strong>{uncontrolledSnapshot}</strong>
          </p>
          <p className="form-hint">
            打字的過程中，上面的「最後一次讀取到的值」不會自動更新，只有按下「讀取目前的值」才會去讀
            DOM 裡目前真正的內容。
          </p>
        </div>
      </div>
    </section>
  )
}

export default ControlledVsUncontrolled
