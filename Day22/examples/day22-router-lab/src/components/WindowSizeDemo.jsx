import { useWindowSize } from '../hooks/index.js'

function getBreakpoint(width) {
  if (width < 640) {
    return { label: '手機', columns: 1 }
  }
  if (width < 1024) {
    return { label: '平板', columns: 2 }
  }
  return { label: '桌面', columns: 3 }
}

// ViewportReadout：只關心「數字」，即時顯示目前視窗的寬 / 高。
function ViewportReadout() {
  const { width, height } = useWindowSize()

  return (
    <div className="counter-box">
      <p className="form-label">目前視窗尺寸</p>
      <p className="counter-value">
        {width} × {height}
      </p>
      <p className="form-hint">試著調整瀏覽器視窗大小（或縮放頁面），這裡的數字會即時更新。</p>
    </div>
  )
}

// ResponsiveLayoutPreview：跟 ViewportReadout 是兩個完全獨立、互不認識的元件，
// 各自呼叫了一次 useWindowSize()，卻共用同一套「訂閱 resize 事件、卸載時取消訂閱」的邏輯。
function ResponsiveLayoutPreview() {
  const { width } = useWindowSize()
  const { label, columns } = getBreakpoint(width)

  return (
    <div className="counter-box">
      <p className="form-label">響應式版面預覽：目前判定為「{label}」版型</p>
      <div className="breakpoint-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} className="breakpoint-box">
            {index + 1}
          </div>
        ))}
      </div>
      <p className="form-hint">
        寬度 &lt; 640px 顯示 1 欄（手機）、640～1023px 顯示 2 欄（平板）、
        ≥ 1024px 顯示 3 欄（桌面）。
      </p>
    </div>
  )
}

function WindowSizeDemo() {
  return (
    <section className="card">
      <h2>useWindowSize：兩個元件共用同一套視窗尺寸偵測邏輯</h2>
      <p className="card-desc">
        延續自 Day13、Day21 的實作，原封不動收錄進今天的函式庫。
        <code>ViewportReadout</code> 與 <code>ResponsiveLayoutPreview</code>{' '}
        是兩個完全獨立、互不認識的元件，各自呼叫了一次 <code>useWindowSize()</code>——
        如果沒有自訂 Hook，「監聽 <code>window</code> 的 <code>resize</code>{' '}
        事件、記錄目前尺寸、元件卸載時記得移除監聽器」這一整套 <code>useState</code> +{' '}
        <code>useEffect</code> 邏輯，就得在兩個元件裡各寫一次；現在只需要各自呼叫{' '}
        <code>useWindowSize()</code> 一行，就能拿到隨時更新的寬高數字。
      </p>
      <div className="counter-compare-grid">
        <ViewportReadout />
        <ResponsiveLayoutPreview />
      </div>
    </section>
  )
}

export default WindowSizeDemo
