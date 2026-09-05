import { useState } from 'react'

function BubblingDemo() {
  const [log, setLog] = useState([])
  const [shouldStop, setShouldStop] = useState(false)

  function appendLog(message) {
    setLog((prev) => [...prev.slice(-4), message])
  }

  // React 的事件冒泡（bubbling）跟原生 DOM 一致：
  // 點擊最內層的元素時，事件會依序從內層往外層的祖先元素傳遞，
  // 外層元素上綁定的 onClick 也會跟著被觸發。
  function handleOuterClick() {
    appendLog('outer 收到事件（冒泡）')
  }

  function handleMiddleClick() {
    appendLog('middle 收到事件（冒泡）')
  }

  function handleInnerClick(event) {
    if (shouldStop) {
      // stopPropagation() 會讓事件「停在這一層」，不再往外層的祖先繼續冒泡，
      // 外層的 onClick 就不會被觸發。
      event.stopPropagation()
    }
    appendLog(`inner 被點擊${shouldStop ? '（已呼叫 stopPropagation，事件到此為止）' : ''}`)
  }

  return (
    <section className="card">
      <h2>🎯 事件冒泡（Bubbling）與 stopPropagation</h2>
      <p className="card-desc">
        點擊最內層的方框，觀察事件是否會依序冒泡到 middle、outer；
        勾選下方選項後再點一次，比較呼叫 <code>event.stopPropagation()</code> 前後的差異。
      </p>

      <label className="stop-toggle">
        <input
          type="checkbox"
          checked={shouldStop}
          onChange={(event) => setShouldStop(event.target.checked)}
        />
        在 inner 呼叫 stopPropagation()，阻止事件繼續冒泡
      </label>

      <div className="bubble-box bubble-box--outer" onClick={handleOuterClick}>
        outer
        <div className="bubble-box bubble-box--middle" onClick={handleMiddleClick}>
          middle
          <div className="bubble-box bubble-box--inner" onClick={handleInnerClick}>
            inner（點我）
          </div>
        </div>
      </div>

      <ul className="bubble-log">
        {log.length === 0 && <li className="note-list__empty">尚未點擊過</li>}
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </section>
  )
}

export default BubblingDemo
