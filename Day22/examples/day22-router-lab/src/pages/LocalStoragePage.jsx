import LocalStorageDemo from '../components/LocalStorageDemo.jsx'

// LocalStoragePage：路由 "/local-storage" 對應的頁面。
function LocalStoragePage() {
  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Hook 路由頁面</p>
        <h1>useLocalStorage</h1>
        <p className="subtitle">
          延續 Day13、Day21 的實作：把 <code>useState</code> 換成{' '}
          <code>useLocalStorage(key, initialValue)</code>，就能讓資料在重新整理頁面、
          甚至切換到別的路由頁面再切回來之後，內容依然保留。
        </p>
      </header>
      <div className="card-grid">
        <LocalStorageDemo />
      </div>
    </div>
  )
}

export default LocalStoragePage
