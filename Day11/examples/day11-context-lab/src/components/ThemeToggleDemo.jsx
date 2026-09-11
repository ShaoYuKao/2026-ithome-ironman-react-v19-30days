import { ThemeProvider, useTheme } from '../contexts/ThemeContext.jsx'

// 對照組：跟 PropsDrillingDemo.jsx 一樣是「4 層元件」的結構，
// 但這次改用 Context，中間層完全不需要接收、也不需要轉傳任何跟 theme 有關的 props。

function DeepButton() {
  // 直接跟 Context 要資料，不需要任何人幫忙一層層轉傳
  const { theme, toggleTheme } = useTheme()
  return (
    <button type="button" className={`avatar-btn avatar-btn--${theme}`} onClick={toggleTheme}>
      {theme === 'light' ? '🌞 目前：亮色（點我切換）' : '🌙 目前：暗色（點我切換）'}
    </button>
  )
}

function DeepCard() {
  // 第 3 層，同樣直接呼叫 useTheme()，不需要靠 props 才能拿到 theme
  const { theme } = useTheme()
  return (
    <div className={`context-demo-card context-demo-card--${theme}`}>
      <p className="form-hint">DeepCard（第 3 層，直接讀取 Context，沒有任何 props 傳進來）</p>
      <DeepButton />
    </div>
  )
}

function DeepSidebar() {
  // 第 2 層：完全沒有 import useTheme，也不需要接收任何跟 theme 有關的 props，
  // 對照 PropsDrillingDemo 裡的 Toolbar、UserPanel，這裡乾淨得多。
  return (
    <div className="props-drilling-level">
      <p className="form-hint">DeepSidebar（第 2 層，完全不需要知道 theme 這件事的存在）</p>
      <DeepCard />
    </div>
  )
}

function DeepPage() {
  // 第 1 層，也直接讀取 Context
  const { theme } = useTheme()
  return (
    <div className={`context-demo-page context-demo-page--${theme}`}>
      <p className="form-hint">DeepPage（第 1 層，同樣直接讀取 Context）</p>
      <DeepSidebar />
    </div>
  )
}

function ThemeToggleDemo() {
  return (
    <section className="card">
      <h2>2️⃣ Context 解法：深色 / 淺色主題切換（今日主練習）</h2>
      <p className="card-desc">
        用 <code>&lt;ThemeProvider&gt;</code> 把整棵子元件樹包起來，
        <code>DeepPage</code>、<code>DeepCard</code>、<code>DeepButton</code>
        不管隔了幾層，都可以直接呼叫 <code>useTheme()</code> 拿到最新的
        <code>theme</code> 與 <code>toggleTheme</code>；而完全用不到 theme 的{' '}
        <code>DeepSidebar</code>，也不需要為了「轉傳」而多接收任何 props。
        點擊按鈕切換主題，觀察三層元件的顏色是否都同步跟著變化。
      </p>
      <ThemeProvider>
        <DeepPage />
      </ThemeProvider>
    </section>
  )
}

export default ThemeToggleDemo
