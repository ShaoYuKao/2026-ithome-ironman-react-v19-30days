import { useLayoutEffect, useRef, useState } from 'react'
import { useAutoScrollToBottom } from '../utils/useAutoScrollToBottom.js'

const SEED_MESSAGES = [
  '哈囉，這是聊天室 Demo 👋',
  '訊息夠多時，清單會需要捲動才看得到全部內容。',
  '請按下方按鈕，模擬同時收到 3 則新訊息。',
  '留意新訊息送達後，畫面是不是「卡在原地」一下下，才跳到最下面。',
].map((text, index) => ({ id: `seed-${index}`, text }))

function createIncomingBatch(round) {
  return [1, 2, 3].map((i) => ({
    id: `round-${round}-${i}`,
    text: `🔔 第 ${round} 輪・新訊息 ${i}/3 抵達`,
  }))
}

/**
 * 同一份「新訊息抵達 + 捲動到最下面」邏輯，透過 props 傳入的 effectHook
 * （useEffect 或 useLayoutEffect）決定修正時機。
 *
 * 掛載時先用一支「一律直接執行」的 useLayoutEffect 把畫面捲到底部一次，
 * 讓兩邊在按下「模擬收到新訊息」之前，起始畫面看起來完全一樣——
 * 真正要比較的，是掛載「之後」新訊息抵達時的行為，不是初次掛載。
 */
function ChatWindow({ title, effectHook, isSynchronous, simulateSlowMeasurement }) {
  const [messages, setMessages] = useState(SEED_MESSAGES)
  const [round, setRound] = useState(0)
  const containerRef = useRef(null)

  const { atBottom, lastDurationMs, history } = useAutoScrollToBottom(effectHook, {
    messages,
    containerRef,
    simulateSlowMeasurement,
    // 只有「非同步」的 useEffect 版本需要等瀏覽器先真的畫過一次卡住的畫面，
    // 才開始修正捲動位置；useLayoutEffect 版本必須維持同步、立即執行。
    waitForPaint: !isSynchronous,
  })

  useLayoutEffect(() => {
    const container = containerRef.current
    if (container) container.scrollTop = container.scrollHeight
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在掛載時執行一次
  }, [])

  function handleReceiveMessages() {
    const nextRound = round + 1
    setRound(nextRound)
    setMessages((prev) => [...prev, ...createIncomingBatch(nextRound)])
  }

  return (
    <div className="chat-demo">
      <h3>{title}</h3>

      <div
        ref={containerRef}
        className={`chat-window chat-window--${atBottom ? 'ok' : 'stale'}`}
      >
        {messages.map((message) => (
          <div key={message.id} className="chat-bubble">
            {message.text}
          </div>
        ))}
      </div>

      <button type="button" className="btn" onClick={handleReceiveMessages}>
        模擬收到 3 則新訊息
      </button>

      <p className="chat-status">
        <span>
          目前狀態：
          <strong>{atBottom ? '✅ 已捲到最新訊息' : '⚠️ 卡在舊的捲動位置'}</strong>
        </span>
        <span>
          這次量測與捲動花費：
          <strong>{lastDurationMs === null ? '尚未觸發' : `${lastDurationMs} ms`}</strong>
        </span>
      </p>

      {history.length > 0 && (
        <div className="chat-timeline-wrap">
          <ol className="chat-timeline" aria-label="捲動修正時間軸">
            {history.map((entry, index) => (
              <li key={index}>
                新訊息抵達後 {entry.atMs} ms：
                {entry.atBottom
                  ? '已捲到最新訊息（正確位置）'
                  : '暫時卡在舊的捲動位置（尚未捲到底）'}
              </li>
            ))}
          </ol>
          <p className="chat-timeline-note">
            {isSynchronous
              ? '⚠️ 注意：上面「0 ms」那筆只是量測前的暫時狀態，這裡在瀏覽器來得及畫出任何東西之前，就已經被下面那筆修正取代，使用者實際上「完全不會看到」清單卡在舊位置的樣子。'
              : '⚠️ 注意：上面「0 ms」那筆，瀏覽器已經真的把畫面停在舊的捲動位置畫出來了——使用者會先看到清單「卡住」、看不到新訊息，過了對應毫秒數之後，才會看到畫面「跳」到最新訊息。'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ChatWindow
