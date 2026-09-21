import { useState } from 'react'
import { useDebounce } from '../hooks/index.js'

// DebounceDemo：先用一個「不打 API、只在畫面上比較次數」的單純情境，
// 讓 useDebounce 本身的行為看起來一目了然，再交給下面的 CombinedSearchDemo
// 展示它跟 useFetch 搭配時，真正省下的是「呼叫 API 的次數」。
function DebounceDemo() {
  const [rawValue, setRawValue] = useState('')
  const [keystrokeCount, setKeystrokeCount] = useState(0)
  // 延遲 500ms：使用者停止輸入超過 500ms 後，debouncedValue 才會跟上 rawValue。
  const debouncedValue = useDebounce(rawValue, 500)
  const [debouncedUpdateCount, setDebouncedUpdateCount] = useState(0)

  function handleChange(event) {
    setRawValue(event.target.value)
    setKeystrokeCount((count) => count + 1)
  }

  // 每次 debouncedValue 真正改變，才累加一次「debounced 更新次數」——
  // 這裡刻意沒有用 useEffect，而是直接在渲染時比較「上一次記住的值」，
  // 避免多此一舉的額外副作用；因為只是拿來顯示教學用的計數字，寫在
  // render 內的簡單比較已經足夠清楚。
  const [lastSeenDebouncedValue, setLastSeenDebouncedValue] = useState(debouncedValue)
  if (debouncedValue !== lastSeenDebouncedValue) {
    setLastSeenDebouncedValue(debouncedValue)
    setDebouncedUpdateCount((count) => count + 1)
  }

  return (
    <section className="card">
      <h2>3️⃣ useDebounce：打字停下來 500ms 後才「安定」的值</h2>
      <p className="card-desc">
        快速在下面輸入框連續打字，觀察「即時值」隨著每個按鍵立刻改變，
        但「Debounce 後的值」會等到你停止輸入滿 500ms 之後才跟上——中間任何
        「還沒安靜就又變了」的中繼值都會被直接捨棄，完全不會顯示出來。
      </p>

      <label className="form-label" htmlFor="debounce-input">
        試著快速輸入文字
      </label>
      <input
        id="debounce-input"
        type="text"
        className="form-input"
        value={rawValue}
        onChange={handleChange}
        placeholder="例如快速打「useDebounce」"
      />

      <div className="counter-compare-grid">
        <div className="counter-box">
          <p className="form-label">即時值（每個按鍵都更新）</p>
          <p className="live-echo">{rawValue || '（尚未輸入）'}</p>
          <p className="form-hint">按鍵次數：{keystrokeCount}</p>
        </div>
        <div className="counter-box">
          <p className="form-label">Debounce 後的值（停止輸入 500ms 才更新）</p>
          <p className="live-echo">{debouncedValue || '（尚未輸入）'}</p>
          <p className="form-hint">實際「安定」次數：{debouncedUpdateCount}</p>
        </div>
      </div>
    </section>
  )
}

export default DebounceDemo
