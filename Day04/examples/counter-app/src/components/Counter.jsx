import { useState } from 'react'

let nextHistoryId = 1

// Lazy Initializer：只有 State 初始化時才會呼叫（重新渲染不會再呼叫）。
// 注意：這裡的 nextHistoryId++ 修改了外部變數，嚴格來說不是純函式；
// 開發環境啟用 <StrictMode> 時，這個函式可能被連續呼叫兩次，
// nextHistoryId 也會因此多加一次，屬於範例中刻意保留、可觀察的陷阱。
// 可以打開瀏覽器開發者工具的 Console，觀察這行 log 在 StrictMode 開發環境下很可能印出兩次。
function createInitialHistory() {
  console.log('createInitialHistory() 執行了')
  return [{ id: nextHistoryId++, label: '初始化', value: 0 }]
}

function Counter() {
  // count：計數器目前的數值
  const [count, setCount] = useState(0)
  // history：操作歷程（陣列），用來示範「不可變更新（immutability）」
  const [history, setHistory] = useState(createInitialHistory)

  // 不可變更新：一律用展開運算符（spread）建立「新陣列」，
  // 絕對不要對 prevHistory 呼叫 push()／pop() 之類會「直接修改原陣列」的方法。
  function addHistory(label, value) {
    setHistory((prevHistory) => [
      ...prevHistory,
      { id: nextHistoryId++, label, value },
    ])
  }

  function handleIncrement() {
    const nextCount = count + 1
    setCount(nextCount)
    addHistory('+1', nextCount)
  }

  function handleDecrement() {
    const nextCount = count - 1
    setCount(nextCount)
    addHistory('-1', nextCount)
  }

  function handleReset() {
    setCount(0)
    addHistory('重設', 0)
  }

  // ❌ 錯誤示範：連續三次「直接設值」，三次都讀到同一個 render 裡的 count，
  // 所以最後只會 +1，不是預期中的 +3。
  function handleWrongTripleIncrement() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
    addHistory('連續 +3（❌ 直接設值，結果只 +1）', count + 1)
  }

  // ✅ 正確做法：使用「函式式更新」，每一次都拿「上一次更新後的值」去計算，
  // 三次呼叫會依序疊加，最後正確 +3。
  function handleCorrectTripleIncrement() {
    setCount((prevCount) => prevCount + 1)
    setCount((prevCount) => prevCount + 1)
    setCount((prevCount) => prevCount + 1)
    addHistory('連續 +3（✅ 函式式更新，結果 +3）', count + 3)
  }

  return (
    <div className="counter-app">
      <p className="count-label">目前計數</p>
      <h1 className="count-display">{count}</h1>

      <div className="button-group">
        <button type="button" onClick={handleDecrement}>
          -1
        </button>
        <button type="button" onClick={handleIncrement}>
          +1
        </button>
        <button type="button" className="reset" onClick={handleReset}>
          重設
        </button>
      </div>

      <div className="button-group secondary">
        <button type="button" onClick={handleWrongTripleIncrement}>
          連續 +3（❌ 直接設值）
        </button>
        <button type="button" onClick={handleCorrectTripleIncrement}>
          連續 +3（✅ 函式式更新）
        </button>
      </div>

      <section className="history">
        <h2>操作歷程</h2>
        <ul>
          {history.map((item) => (
            <li key={item.id}>
              {item.label} → {item.value}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default Counter
