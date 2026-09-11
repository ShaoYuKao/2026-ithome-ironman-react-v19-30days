import { useState } from 'react'

// 情境示範：一個「頁面框架」需要把 theme 與切換方法，一路傳給最底層的 Avatar 按鈕，
// 但中間的 Toolbar、UserPanel 其實根本用不到 theme，純粹只是「順便」幫忙轉傳，
// 這就是 Props Drilling（屬性鑽孔）：資料要流動的路徑，跟「元件實際需要這份資料」的位置對不上。

function Avatar({ theme, onToggleTheme }) {
  // 只有 Avatar 真正用到 theme（決定顯示太陽還是月亮）與 onToggleTheme（點擊切換）
  return (
    <button
      type="button"
      className={`avatar-btn avatar-btn--${theme}`}
      onClick={onToggleTheme}
      title="點我切換主題"
    >
      {theme === 'light' ? '🌞' : '🌙'}
    </button>
  )
}

function UserPanel({ theme, onToggleTheme }) {
  // UserPanel 自己完全用不到 theme / onToggleTheme，純粹只是幫忙轉傳給更底層的 Avatar
  return (
    <div className="props-drilling-level">
      <p className="form-hint">UserPanel（第 2 層中繼元件，沒用到 theme，只負責轉傳 props）</p>
      <Avatar theme={theme} onToggleTheme={onToggleTheme} />
    </div>
  )
}

function Toolbar({ theme, onToggleTheme }) {
  // Toolbar 同樣用不到 theme，卻也得在自己的 props 裡多接兩個參數，才能繼續往下傳
  return (
    <div className="props-drilling-level">
      <p className="form-hint">Toolbar（第 1 層中繼元件，沒用到 theme，只負責轉傳 props）</p>
      <UserPanel theme={theme} onToggleTheme={onToggleTheme} />
    </div>
  )
}

function PropsDrillingDemo() {
  // 真正「擁有」theme 狀態的地方：最上層的 PropsDrillingDemo
  const [theme, setTheme] = useState('light')

  function handleToggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <section className="card">
      <h2>1️⃣ Props Drilling 問題示範（尚未使用 Context）</h2>
      <p className="card-desc">
        點擊最底層的按鈕即可切換主題，但請留意：<code>theme</code> 與{' '}
        <code>onToggleTheme</code> 必須從 <code>PropsDrillingDemo</code> 一路手動傳過{' '}
        <code>Toolbar</code>、<code>UserPanel</code>，才能交到真正需要它的{' '}
        <code>Avatar</code> 手上。中間這兩層元件本身完全用不到這兩個值，卻都得在自己的 props
        參數裡多寫一份，程式改起來也會很麻煩：以後如果要新增第 4 層、第 5
        層元件，或是要多傳一個欄位，中間每一層都要跟著修改。
      </p>
      <div className={`props-drilling-tree props-drilling-tree--${theme}`}>
        <p className="form-hint">PropsDrillingDemo（真正持有 theme 狀態的地方）</p>
        <Toolbar theme={theme} onToggleTheme={handleToggleTheme} />
      </div>
      <p className="form-hint">
        目前 theme：<code>{theme}</code>，這個值一路手動傳了 3 層 props 才送到 Avatar
        手上。
      </p>
    </section>
  )
}

export default PropsDrillingDemo
