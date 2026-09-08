import { useEffect, useState } from 'react'
import LogPanel from './LogPanel.jsx'

let nextLogId = 1

function nowLabel() {
  return new Date().toLocaleTimeString('zh-TW', { hour12: false })
}

function EffectPlayground() {
  const [countA, setCountA] = useState(0)
  const [countB, setCountB] = useState(0)
  const [logs, setLogs] = useState([])

  // addLog 內部一律用「函式式更新」setLogs(prev => ...) 寫入，
  // 因此就算下面幾個 useEffect 沒有把 addLog 放進依賴陣列，呼叫起來也不會出錯
  // （setLogs 這個 setter 函式，React 保證每次 render 拿到的參照都相同）。
  function addLog(text, type) {
    setLogs((prev) => [...prev, { id: nextLogId++, time: nowLabel(), text, type }].slice(-12))
  }

  // 情境一：不傳依賴陣列 → 每一次 render（不論是 countA 還是 countB 造成的）都會執行一次。
  useEffect(() => {
    addLog(`🟠 無依賴陣列：每次 render 後都會執行一次（countA=${countA}, countB=${countB}）`, 'warn')
  })

  // 情境二：傳入空陣列 [] → 只在「掛載」時執行一次，之後不管任何 state 怎麼改變都不會再執行。
  useEffect(() => {
    addLog('🟢 空陣列 []：只在元件掛載時執行一次，之後永遠不會再執行', 'mount')
  }, [])

  // 情境三：依賴陣列放入 [countA] → 只有 countA 改變時才重新執行；
  // 點擊「countB + 1」造成的重新渲染，不會觸發這個 effect。
  useEffect(() => {
    addLog(`🔵 依賴 [countA]：countA 改變時才執行（目前 countA=${countA}）`, 'dep')

    // cleanup 函式：在「countA 下一次改變、這個 effect 即將重新執行之前」被呼叫一次，
    // 也會在 EffectPlayground 元件卸載時被呼叫一次。
    return () => {
      addLog(`⚪ 清除函式：在下一次「依賴 [countA]」effect 執行前被呼叫（清除舊的 countA=${countA}）`, 'cleanup')
    }
  }, [countA])

  return (
    <section className="card">
      <h2>🧪 依賴陣列（Dependency Array）三種情境</h2>
      <p className="card-desc">
        分別點擊下面兩個按鈕，觀察哪一個 <code>useEffect</code> 有反應、哪一個沒有反應：
        「無依賴陣列」「空陣列 <code>[]</code>」「有值陣列 <code>[countA]</code>」，
        三種情境對照 <code>Hook_Info/Hook.md</code> 的 Effect Hooks 說明。
      </p>

      <div className="playground-counters">
        <div className="counter-block">
          <p>
            countA：<strong>{countA}</strong>
          </p>
          <button type="button" onClick={() => setCountA((c) => c + 1)}>
            countA + 1
          </button>
          <p className="counter-hint">會觸發「無依賴陣列」與「依賴 [countA]」兩個 effect</p>
        </div>
        <div className="counter-block">
          <p>
            countB：<strong>{countB}</strong>
          </p>
          <button type="button" onClick={() => setCountB((c) => c + 1)}>
            countB + 1
          </button>
          <p className="counter-hint">只會觸發「無依賴陣列」的 effect，不會影響「依賴 [countA]」的 effect</p>
        </div>
      </div>

      <LogPanel title="Effect 執行紀錄" entries={logs} onClear={() => setLogs([])} />
    </section>
  )
}

export default EffectPlayground
