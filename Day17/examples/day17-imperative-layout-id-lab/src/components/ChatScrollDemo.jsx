import { useEffect, useId, useLayoutEffect, useState } from 'react'
import ChatWindow from './ChatWindow.jsx'

/**
 * 練習主題（對照 plan03.md）：useLayoutEffect 在瀏覽器繪製前同步執行，
 * 適合用來「量測 layout 後立即調整」。
 *
 * 左右兩個聊天室用的是完全相同的一段「新訊息抵達後，捲動到最下面」邏輯，
 * 差別只在於：左邊用 useEffect（繪製之後才修正捲動位置），右邊用
 * useLayoutEffect（繪製之前就修正）。按下「模擬收到 3 則新訊息」後，
 * 兩邊最後都會捲到最新訊息——重點不是「最後結果」，而是「使用者眼睛在
 * 過程中，看不看得到清單卡在舊捲動位置、看不到新訊息的那個暫時畫面」。
 * 跟一閃即逝的小色塊不同，捲動位置是「一大段空間位移」，人眼很難錯過。
 */
function ChatScrollDemo() {
  const [simulateSlowMeasurement, setSimulateSlowMeasurement] = useState(true)
  const toggleId = useId()

  return (
    <div className="demo-card">
      <h2>useLayoutEffect vs useEffect：聊天室新訊息捲動</h2>
      <p className="demo-desc">
        兩個聊天室一開始都已經捲到最下面，代表使用者正盯著最新訊息看。按下
        「模擬收到 3 則新訊息」後，清單會一次新增 3 則訊息——這時候
        <span style={{ color: 'var(--danger)' }}>畫面卡在舊的捲動位置（看不到新訊息）</span>
        是還沒修正前的暫時狀態，
        <span style={{ color: 'var(--success)' }}>捲到最新訊息</span>
        才是修正後正確的最終畫面。點下面兩個按鈕比較看看。
      </p>

      <label className="chat-toggle" htmlFor={toggleId}>
        <input
          id={toggleId}
          type="checkbox"
          checked={simulateSlowMeasurement}
          onChange={(event) => setSimulateSlowMeasurement(event.target.checked)}
        />
        放大顯示差異（模擬 300ms 較慢的版面量測）
      </label>

      <div className="chat-lab-grid">
        <ChatWindow
          title="useEffect 版本（繪製後才修正）"
          effectHook={useEffect}
          isSynchronous={false}
          simulateSlowMeasurement={simulateSlowMeasurement}
        />
        <ChatWindow
          title="useLayoutEffect 版本（繪製前就修正）"
          effectHook={useLayoutEffect}
          isSynchronous
          simulateSlowMeasurement={simulateSlowMeasurement}
        />
      </div>

      <p className="demo-desc" style={{ marginTop: 16, marginBottom: 0 }}>
        勾選「放大顯示差異」時：<strong>useEffect 版本</strong>按下按鈕後，會先讓清單
        <span style={{ color: 'var(--danger)' }}>卡在舊的捲動位置、看不到新訊息</span>
        ，維持約 300ms（這段期間頁面也會稍微卡住，因為量測邏輯本身是同步的），
        才「跳」到<span style={{ color: 'var(--success)' }}>最新訊息</span>；
        <strong>useLayoutEffect 版本</strong>則是點下去之後畫面「先卡住」300ms，
        接著直接顯示<span style={{ color: 'var(--success)' }}>已經捲到最新訊息的畫面</span>
        ，你完全不會看到清單卡住的中間狀態——因為它在瀏覽器有機會畫出任何東西
        之前，就已經把捲動位置修正好了。取消勾選後，兩者的差異依然存在，只是
        縮小到 1 個影格（約 16ms）左右，肉眼通常很難察覺。
      </p>
    </div>
  )
}

export default ChatScrollDemo
