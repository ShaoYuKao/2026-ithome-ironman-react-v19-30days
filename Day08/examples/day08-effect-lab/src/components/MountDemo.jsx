import { useState } from 'react'
import LogPanel from './LogPanel.jsx'
import Greeting from './Greeting.jsx'

let nextLogId = 1

function nowLabel() {
  return new Date().toLocaleTimeString('zh-TW', { hour12: false })
}

function MountDemo() {
  const [visible, setVisible] = useState(true)
  const [logs, setLogs] = useState([])

  function addLog(text, type) {
    setLogs((prev) => [...prev, { id: nextLogId++, time: nowLabel(), text, type }].slice(-12))
  }

  return (
    <section className="card">
      <h2>🚪 掛載（Mount）與卸載（Unmount）</h2>
      <p className="card-desc">
        點擊按鈕讓 <code>Greeting</code> 子元件「出現／消失」（也就是條件渲染，Day06），
        觀察 <code>useEffect</code> 搭配清除函式（cleanup function），如何近似舊版 class component 的
        <code>componentDidMount</code> / <code>componentWillUnmount</code>。
      </p>

      <button type="button" className="toggle-btn" onClick={() => setVisible((v) => !v)}>
        {visible ? '卸載 Greeting 元件' : '掛載 Greeting 元件'}
      </button>

      <div className="mount-slot">
        {visible ? (
          <Greeting onLog={addLog} />
        ) : (
          <p className="empty-state">（目前沒有掛載任何元件）</p>
        )}
      </div>

      <LogPanel title="生命週期紀錄" entries={logs} onClear={() => setLogs([])} />
    </section>
  )
}

export default MountDemo
