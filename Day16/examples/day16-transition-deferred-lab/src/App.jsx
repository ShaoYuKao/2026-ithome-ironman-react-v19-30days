import './App.css'
import TransitionDeferredLab from './components/TransitionDeferredLab.jsx'

// App 今天只負責一件事：掛載 TransitionDeferredLab。
// 延續 Day14、Day15 的檔案切分習慣，把「頁面骨架」跟「今日主練習的實際邏輯」分開放。
function App() {
  return <TransitionDeferredLab />
}

export default App
