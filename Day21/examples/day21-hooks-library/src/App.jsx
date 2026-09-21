import './App.css'
import WindowSizeDemo from './components/WindowSizeDemo.jsx'
import LocalStorageDemo from './components/LocalStorageDemo.jsx'
import DebounceDemo from './components/DebounceDemo.jsx'
import CombinedSearchDemo from './components/CombinedSearchDemo.jsx'

function App() {
  return (
    <div className="hook-lab-page">
      <header className="page-header">
        <p className="eyebrow">Day 21 週複習與小專案</p>
        <h1>自訂 Hook 小型函式庫</h1>
        <p className="subtitle">
          統整本週學到的自訂 Hook 觀念，把 <code>useLocalStorage</code>、
          <code>useWindowSize</code>、<code>useFetch</code>、<code>useDebounce</code>
          （新學）四個 Hook 收錄進同一個 <code>src/hooks</code> 函式庫，
          並用四個 Demo 逐一展示每個 Hook 的用法，最後再組合兩個 Hook 完成一個
          「即時搜尋卻不狂打 API」的實戰情境。
        </p>
      </header>

      <main className="card-grid">
        <WindowSizeDemo />
        <LocalStorageDemo />
        <DebounceDemo />
        <CombinedSearchDemo />
      </main>
    </div>
  )
}

export default App
