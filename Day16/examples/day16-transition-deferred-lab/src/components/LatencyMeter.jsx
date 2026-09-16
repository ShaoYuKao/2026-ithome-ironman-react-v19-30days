import { HISTORY_SIZE } from '../utils/useTypingLatency.js'

// 超過這個毫秒數，就把這一鍵的延遲標記成「使用者感覺得到的卡頓」——
// 這個數字對應到常見的「一秒 60 幀」的說法：單一幀的預算大約是 16.7ms，
// 超過太多倍，肉眼就會感覺到明顯的延遲、而不只是「理論上比較慢」。
const NOTICEABLE_LATENCY_MS = 50

/**
 * 即時顯示「輸入延遲」量測結果的小面板，讓你不用相信文件裡的數字，
 * 直接在自己的瀏覽器上打字、親眼看著這些數字即時跳出來。
 *
 * 三個版本（Sync／Deferred／Transition）共用同一個元件——
 * 差異完全來自各自傳進來的 `history`（由 useTypingLatency 量測出來），
 * 這正好呼應今天的重點：三種寫法的差異不在「畫面長什麼樣子」，
 * 而在「背後的 state 什麼時候更新」。
 */
function LatencyMeter({ last, history, total }) {
  const isNoticeable = last != null && last > NOTICEABLE_LATENCY_MS

  return (
    <div className="latency-meter">
      <p className="latency-meter__row">
        <span className="latency-meter__label">上一鍵實際延遲</span>
        <strong
          className={
            isNoticeable
              ? 'latency-meter__value latency-meter__value--bad'
              : 'latency-meter__value latency-meter__value--good'
          }
        >
          {last == null ? '－' : `${last.toFixed(1)} ms`}
        </strong>
      </p>
      <p className="latency-meter__row">
        <span className="latency-meter__label">
          最近 {history.length} / {HISTORY_SIZE} 鍵加總
        </span>
        <strong className="latency-meter__value">{total.toFixed(1)} ms</strong>
      </p>
      <p className="latency-meter__hint">
        量測方式：從「瀏覽器收到這次按鍵」到「畫面真正畫出這個字」的實際時間——
        跟感覺卡不卡是同一件事，只是換成看得到的數字。
      </p>
    </div>
  )
}

export default LatencyMeter
