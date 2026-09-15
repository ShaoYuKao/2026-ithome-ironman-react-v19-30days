import './App.css'
import MemoCallbackLab from './components/MemoCallbackLab.jsx'

// App 今天只負責一件事：掛載 MemoCallbackLab。
// 把「頁面骨架」跟「今日主練習的實際邏輯」分開放，延續 Day14 的檔案切分習慣。
function App() {
  return <MemoCallbackLab />
}

export default App
