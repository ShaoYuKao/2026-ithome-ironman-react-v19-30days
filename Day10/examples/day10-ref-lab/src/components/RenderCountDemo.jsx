import { useRef, useState } from 'react'

// 實驗四：用 useRef 記錄 render 次數，實際觀察與 useState 的關鍵差異
//
// 核心觀念：
// - useState 更新後一定會觸發重新渲染（畫面會立刻反應新的值）。
// - useRef 更新 ref.current「不會」觸發重新渲染——數值確實已經改變了，
//   但畫面要等到「下一次因為其他原因發生的渲染」，才會顯示出最新的 ref 值。
// 这一步是本日最容易搞混的地方，透過下面的按鈕實際點點看，會比純看文字說明更容易理解。
function RenderCountDemo() {
  const [text, setText] = useState('')
  const [clickCount, setClickCount] = useState(0)

  // renderCountRef：元件函式主體「每執行一次」（也就是每次渲染，不論原因）就 +1，
  // 直接在渲染期間讀取 renderCountRef.current 沒有問題（純粹讀取、顯示，並沒有拿它來做渲染邏輯判斷）。
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  // silentCounterRef：故意示範「只更新 ref、不觸發渲染」的按鈕會發生什麼事。
  const silentCounterRef = useRef(0)

  return (
    <section className="card">
      <h2>4️⃣ useRef 記錄 render 次數：與 state 的差異</h2>
      <p className="card-desc">
        三個數字分別代表：元件實際渲染次數（<code>useRef</code>）、「強制重新渲染」按鈕被點擊的次數（
        <code>useState</code>），以及一個故意「只更新 ref、不觸發渲染」的背後計數器。
      </p>

      <div className="render-count-grid">
        <div className="render-count-box">
          <p className="render-count-label">元件目前渲染次數（useRef）</p>
          <p className="render-count-value">{renderCountRef.current}</p>
        </div>
        <div className="render-count-box">
          <p className="render-count-label">「強制重新渲染」按鈕點擊次數（useState）</p>
          <p className="render-count-value">{clickCount}</p>
        </div>
        <div className="render-count-box">
          <p className="render-count-label">背後偷偷累加的 silentCounterRef</p>
          <p className="render-count-value">{silentCounterRef.current}</p>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="render-count-text">
          在這裡輸入文字（會觸發 state 更新 → 重新渲染）
        </label>
        <input
          id="render-count-text"
          type="text"
          className="form-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="隨便打幾個字試試看"
        />
      </div>

      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={() => setClickCount((c) => c + 1)}>
          強制重新渲染（更新 state）
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            silentCounterRef.current += 1
          }}
        >
          只更新 ref（畫面數字不會馬上變化）
        </button>
      </div>

      <p className="form-hint">
        實際操作看看：連續點擊「只更新 ref」5 次，會發現「背後偷偷累加的 silentCounterRef」這個數字完全不動；
        接著在上面輸入框打一個字（觸發一次真正的重新渲染），會發現這個數字瞬間跳成 5，而不是慢慢從
        0 數上去——因為前面那 5 次更新其實早就生效了，只是沒有觸發重新渲染，畫面「來不及」顯示最新的值，
        要等到下一次真正發生的渲染，才會把最新的 ref 值一次顯示出來。這也是為什麼「畫面上要顯示給使用者看的資料」
        一定要用 <code>useState</code>，而不能只用 <code>useRef</code>。
      </p>
    </section>
  )
}

export default RenderCountDemo
