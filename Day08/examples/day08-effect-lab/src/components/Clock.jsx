import { useEffect, useState } from 'react'
import LogPanel from './LogPanel.jsx'

let nextLogId = 1

function nowLabel() {
  return new Date().toLocaleTimeString('zh-TW', { hour12: false })
}

function Clock() {
  const [now, setNow] = useState(() => new Date())
  const [running, setRunning] = useState(true)
  const [intervalMs, setIntervalMs] = useState(1000)
  const [logs, setLogs] = useState([])

  function addLog(text, type) {
    setLogs((prev) => [...prev, { id: nextLogId++, time: nowLabel(), text, type }].slice(-12))
  }

  useEffect(() => {
    // 使用者按下「暫停計時器」時，這裡直接 return（不建立計時器），
    // 也不需要回傳 cleanup 函式（因為根本沒有建立任何需要清除的資源）。
    if (!running) {
      return undefined
    }

    addLog(`🟢 建立計時器：setInterval(..., ${intervalMs}ms)`, 'mount')
    const timerId = setInterval(() => {
      setNow(new Date())
    }, intervalMs)

    // cleanup 函式：在「running 或 intervalMs 改變、下一次 effect 即將重新執行之前」，
    // 以及「Clock 元件卸載時」都會被呼叫一次，負責清掉這一次建立的計時器。
    // 如果沒有這個 cleanup，每次切換更新頻率都會多開一個計時器疊加在背景執行，
    // 畫面上的時間會越跳越快，就是典型的「忘記清除副作用」造成的 Bug。
    return () => {
      addLog(`🔴 清除計時器：clearInterval（結束 ${intervalMs}ms 這組計時器）`, 'cleanup')
      clearInterval(timerId)
    }
  }, [running, intervalMs])

  return (
    <section className="card">
      <h2>⏰ 簡易時鐘（setInterval + Cleanup）</h2>
      <p className="card-desc">
        掛載時用 <code>setInterval</code> 啟動計時器每秒更新畫面，卸載或設定改變時，
        透過 cleanup 函式呼叫 <code>clearInterval</code> 清除，避免計時器持續在背景執行造成資源浪費。
      </p>

      <p className="clock-display">{now.toLocaleTimeString('zh-TW', { hour12: false })}</p>

      <div className="clock-controls">
        <button type="button" onClick={() => setRunning((r) => !r)}>
          {running ? '暫停計時器' : '啟動計時器'}
        </button>
        <label className="speed-select">
          更新頻率：
          <select value={intervalMs} onChange={(event) => setIntervalMs(Number(event.target.value))}>
            <option value={1000}>每 1 秒</option>
            <option value={2000}>每 2 秒</option>
            <option value={500}>每 0.5 秒</option>
          </select>
        </label>
      </div>

      <LogPanel title="計時器建立／清除紀錄" entries={logs} onClear={() => setLogs([])} />
    </section>
  )
}

export default Clock
