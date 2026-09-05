import { useState } from 'react'

function LiveEcho() {
  // text：受控元件（Controlled Component）的核心 state，
  // <textarea> 的 value 永遠等於這個 state，畫面與資料狀態保持同步。
  const [text, setText] = useState('')

  function handleChange(event) {
    // event.target 就是觸發事件的 <textarea> DOM 節點本身，
    // event.target.value 則是使用者「這一刻」輸入框裡的最新文字內容。
    setText(event.target.value)
  }

  return (
    <section className="card">
      <h2>⌨️ onChange：受控輸入框即時顯示</h2>
      <p className="card-desc">
        今天的練習主角：輸入框的 <code>value</code> 綁定 <code>text</code> state，
        搭配 <code>onChange</code> 取得 <code>event.target.value</code>{' '}
        更新 state，達成「輸入什麼、畫面就即時顯示什麼」的受控元件雛型。
      </p>

      <textarea
        className="echo-textarea"
        rows={3}
        placeholder="在這裡輸入文字，下方會即時同步顯示……"
        value={text}
        onChange={handleChange}
      />

      <div className="echo-preview">
        <p className="echo-preview__label">即時預覽（共 {text.length} 個字）</p>
        <p className="echo-preview__content">{text || '（尚未輸入任何文字）'}</p>
      </div>
    </section>
  )
}

export default LiveEcho
