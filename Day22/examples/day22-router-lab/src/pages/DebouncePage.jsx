import DebounceDemo from '../components/DebounceDemo.jsx'

// DebouncePage：路由 "/debounce" 對應的頁面。
function DebouncePage() {
  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Hook 路由頁面</p>
        <h1>useDebounce</h1>
        <p className="subtitle">
          延續 Day21 新學的 <code>useDebounce</code>：只保留「安靜下來之後的最後一個值」，
          中間任何「還沒安靜就又變了」的中繼值都會被直接捨棄。
        </p>
      </header>
      <div className="card-grid">
        <DebounceDemo />
      </div>
    </div>
  )
}

export default DebouncePage
