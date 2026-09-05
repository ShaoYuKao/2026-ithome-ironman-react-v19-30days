import { useState } from 'react'

function ClickCounter() {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  // lastEvent：記錄「最後一次事件」的原生欄位，用來證明 event 是 React 包裝過的合成事件物件
  const [lastEvent, setLastEvent] = useState(null)

  // handleVote 接受兩個參數：第一個是我們自訂的資料（'like' / 'dislike'），
  // 第二個才是 React 傳進來的合成事件物件。
  // 因為原生 onClick 只會自動帶入 event，若還想多傳一個自訂參數，
  // 就要改用「inline arrow function」包一層：onClick={(event) => handleVote('like', event)}
  function handleVote(type, event) {
    if (type === 'like') {
      setLikes((prev) => prev + 1)
    } else {
      setDislikes((prev) => prev + 1)
    }

    setLastEvent({
      type: event.type, // 事件類型，例如 'click'
      target: event.currentTarget.textContent, // 目前綁定監聽器的元素（按鈕本身）
      isTrusted: event.nativeEvent.isTrusted, // 透過 event.nativeEvent 取回原生瀏覽器事件
    })
  }

  return (
    <section className="card">
      <h2>👍 onClick：inline arrow function 傳參數</h2>
      <p className="card-desc">
        按鈕的 <code>onClick</code> 用 <code>(event) =&gt; handleVote('like', event)</code>{' '}
        包成一個新的箭頭函式，這樣除了拿到 React 自動帶入的合成事件 <code>event</code>，
        還能多夾帶一個自訂參數 <code>'like'</code> / <code>'dislike'</code>。
      </p>

      <div className="vote-row">
        <button type="button" onClick={(event) => handleVote('like', event)}>
          👍 讚 {likes}
        </button>
        <button type="button" onClick={(event) => handleVote('dislike', event)}>
          👎 倒讚 {dislikes}
        </button>
      </div>

      {lastEvent && (
        <p className="event-log">
          最後觸發：<code>{lastEvent.type}</code> on{' '}
          <code>{lastEvent.target}</code>（isTrusted:{' '}
          <code>{String(lastEvent.isTrusted)}</code>）
        </p>
      )}
    </section>
  )
}

export default ClickCounter
