import './App.css'
import AutoFocusDemo from './components/AutoFocusDemo.jsx'
import ScrollToTopDemo from './components/ScrollToTopDemo.jsx'
import MeasureSizeDemo from './components/MeasureSizeDemo.jsx'
import RenderCountDemo from './components/RenderCountDemo.jsx'
import StopwatchDemo from './components/StopwatchDemo.jsx'

function App() {
  return (
    <div className="ref-lab-page">
      <header className="page-header">
        <p className="eyebrow">Day 10 useRef 與 DOM 操作</p>
        <h1>useRef 實驗室</h1>
        <p className="subtitle">
          五個小型範例，依序練習 <code>useRef</code> 最常見的三大情境：取得 DOM
          節點（自動聚焦、捲動、量測尺寸）、保存不需要觸發重新渲染的可變資料（計時器
          ID）、保存「前一次的值」，並實際比較 <code>useRef</code> 與{' '}
          <code>useState</code> 在「是否觸發重新渲染」上的關鍵差異。
        </p>
      </header>

      <main className="card-grid">
        <AutoFocusDemo />
        <ScrollToTopDemo />
        <MeasureSizeDemo />
        <RenderCountDemo />
        <StopwatchDemo />
      </main>
    </div>
  )
}

export default App
