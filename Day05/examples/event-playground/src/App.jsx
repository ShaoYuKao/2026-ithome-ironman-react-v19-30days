import './App.css'
import ClickCounter from './components/ClickCounter.jsx'
import LiveEcho from './components/LiveEcho.jsx'
import HoverCard from './components/HoverCard.jsx'
import KeydownNotes from './components/KeydownNotes.jsx'
import SignupPreview from './components/SignupPreview.jsx'
import BubblingDemo from './components/BubblingDemo.jsx'

function App() {
  return (
    <div className="event-playground">
      <header className="page-header">
        <p className="eyebrow">Day 05 練習</p>
        <h1>事件處理 Playground</h1>
        <p className="subtitle">
          六個小卡片，分別對應今天學到的合成事件（SyntheticEvent）觀念：
          <code>onClick</code> 傳參數、<code>onChange</code> 受控輸入框、
          <code>onMouseEnter</code>/<code>onMouseLeave</code>、<code>onKeyDown</code>、
          <code>onSubmit</code> 表單，以及事件冒泡與 <code>stopPropagation</code>。
        </p>
      </header>

      <main className="card-grid">
        <ClickCounter />
        <LiveEcho />
        <HoverCard />
        <KeydownNotes />
        <SignupPreview />
        <BubblingDemo />
      </main>
    </div>
  )
}

export default App
