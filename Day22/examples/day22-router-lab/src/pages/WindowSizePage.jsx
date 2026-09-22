import WindowSizeDemo from '../components/WindowSizeDemo.jsx'

// WindowSizePage：路由 "/window-size" 對應的頁面，內容就是 Day21 的
// WindowSizeDemo——今天的重點是「這個 Hook 有了自己獨立的網址」，
// Hook 本身的實作完全沒有改變。
function WindowSizePage() {
  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Hook 路由頁面</p>
        <h1>useWindowSize</h1>
        <p className="subtitle">
          延續 Day13、Day21 的實作：兩個互不認識的元件各自呼叫一次{' '}
          <code>useWindowSize()</code>，卻共用同一套「訂閱 resize 事件、卸載時取消訂閱」的邏輯。
        </p>
      </header>
      <div className="card-grid">
        <WindowSizeDemo />
      </div>
    </div>
  )
}

export default WindowSizePage
