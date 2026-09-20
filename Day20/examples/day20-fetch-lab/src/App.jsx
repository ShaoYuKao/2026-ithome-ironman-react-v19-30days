import './App.css'
import FetchLab from './components/FetchLab.jsx'

// App 今天只負責一件事：掛載 FetchLab。
// 延續 Day14～Day19 的檔案切分習慣，把「頁面骨架」跟「今日主練習的實際邏輯」分開放。
function App() {
  return (
    <div className="lab-page">
      <header className="lab-header">
        <p className="eyebrow">Day 20</p>
        <h1>資料請求與非同步處理實戰</h1>
        <p className="subtitle">
          用 <code>fetch</code> 串接 Express 後端 API，練習 loading / error / success
          三態管理，並抽成可重複使用的 <code>useFetch(url)</code> 自訂 Hook。
        </p>
      </header>
      <FetchLab />
    </div>
  )
}

export default App
