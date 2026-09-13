import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useWindowSize } from '../hooks/useWindowSize.js'

const NARROW_BREAKPOINT = 720

function SidebarLayoutDemo() {
  // 一個元件裡同時使用兩個自訂 Hook：useWindowSize() 判斷「視窗是否過窄，需要強制收合」，
  // useLocalStorage() 記住「使用者上一次手動選擇的展開／收合狀態」。
  // 自訂 Hook 本質上只是一個會呼叫其他 Hook 的普通函式，所以可以像這樣自由組合使用。
  const { width } = useWindowSize()
  const [collapsed, setCollapsed] = useLocalStorage('day13-sidebar-collapsed', false)

  const isNarrowScreen = width < NARROW_BREAKPOINT
  // 視窗夠窄時，即使使用者之前手動展開過，也強制收合，讓內容區有足夠空間；
  // 視窗夠寬時，則尊重使用者上次手動設定、且已持久化在 localStorage 的展開/收合狀態。
  const effectiveCollapsed = isNarrowScreen ? true : collapsed

  return (
    <section className="card">
      <h2>4️⃣ 組合兩個自訂 Hook：會記住偏好的響應式側邊欄</h2>
      <p className="card-desc">
        這個元件同時呼叫了 <code>useWindowSize()</code> 與 <code>useLocalStorage()</code>
        兩個各自獨立開發、互不相干的自訂 Hook，組合起來就完成了一個更完整的功能：
        視窗夠寬時，側邊欄展開／收合的狀態會被記住（重新整理頁面也不會跑掉）；
        視窗窄於 {NARROW_BREAKPOINT}px 時，則自動強制收合，讓內容區保留足夠空間。
      </p>

      <div className="sidebar-demo" data-collapsed={effectiveCollapsed}>
        <aside className="sidebar-demo__aside">{effectiveCollapsed ? '☰' : '展開中的側邊選單'}</aside>
        <div className="sidebar-demo__content">
          <p className="form-hint">
            目前視窗寬度：{width}px（
            {isNarrowScreen
              ? `小於 ${NARROW_BREAKPOINT}px，強制收合`
              : `大於等於 ${NARROW_BREAKPOINT}px，依照上次手動設定顯示`}
            ）
          </p>
          <div className="button-row">
            <button
              type="button"
              className="secondary-btn"
              disabled={isNarrowScreen}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? '展開側邊欄' : '收合側邊欄'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SidebarLayoutDemo
