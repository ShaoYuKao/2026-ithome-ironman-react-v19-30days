import { useRef, useState } from 'react'
import AddressFields from './AddressFields.jsx'
import BadAddressFields from './BadAddressFields.jsx'
import { useDuplicateIdReport } from '../utils/useDuplicateIdReport.js'

const EMPTY_ADDRESS = { street: '', zip: '' }

/**
 * 練習主題（對照 plan03.md、Hook_Info/Hook.md「六、其他 Hooks」）：
 * useId 產生「無障礙屬性唯一 ID」。
 *
 * 同一個地址欄位群組元件，在畫面上被重複使用兩次（帳單地址／收件地址）。
 * 切換上方的分頁，比較「✅ 使用 useId」與「❌ 寫死固定 id」兩種寫法：
 * - 下方會即時掃描目前畫面上有沒有重複的 id，並顯示偵測結果。
 * - 實際點一下「收件地址」的 label 文字，觀察焦點到底跳到哪個欄位。
 */
function IdDemoLab() {
  const [mode, setMode] = useState('good')
  const [billing, setBilling] = useState(EMPTY_ADDRESS)
  const [shipping, setShipping] = useState(EMPTY_ADDRESS)
  const containerRef = useRef(null)

  const duplicates = useDuplicateIdReport(containerRef, [mode])

  const Fields = mode === 'good' ? AddressFields : BadAddressFields

  return (
    <div className="demo-card">
      <h2>useId：無障礙且不會撞名的唯一 ID</h2>
      <p className="demo-desc">
        下面同一個地址欄位群組元件被渲染了兩次（帳單地址、收件地址）。切換分頁，
        比較「用 <code>useId()</code> 產生 id」跟「把 id 寫死成固定字串」的差異。
      </p>

      <div className="mode-tabs" role="tablist" aria-label="切換 id 產生方式">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'good'}
          className={mode === 'good' ? 'mode-tab mode-tab--active' : 'mode-tab'}
          onClick={() => setMode('good')}
        >
          ✅ 使用 useId
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'bad'}
          className={mode === 'bad' ? 'mode-tab mode-tab--active' : 'mode-tab'}
          onClick={() => setMode('bad')}
        >
          ❌ 寫死固定 id
        </button>
      </div>

      <div ref={containerRef} className="address-grid">
        <Fields legend="帳單地址" values={billing} onChange={setBilling} />
        <Fields legend="收件地址" values={shipping} onChange={setShipping} />
      </div>

      <p className={duplicates.length ? 'id-report id-report--bad' : 'id-report id-report--good'}>
        {duplicates.length
          ? `⚠️ 偵測到重複的 id：${duplicates
              .map(([id, count]) => `${id}（共 ${count} 個）`)
              .join('、')}`
          : '✅ 沒有偵測到重複的 id，每個 label 的 htmlFor 都能正確對應到唯一的 input。'}
      </p>

      <p className="demo-desc" style={{ marginTop: 16, marginBottom: 0 }}>
        實際驗證方式：點一下「<strong>收件地址</strong>」欄位群組裡「街道地址」的
        label 文字（不要直接點輸入框）。在「✅ 使用 useId」模式下，焦點會正確跳到
        收件地址自己的輸入框；切到「❌ 寫死固定 id」模式再試一次，會發現焦點
        跳到<strong>帳單地址</strong>的輸入框——因為瀏覽器看到重複的 id，
        <code>htmlFor</code> 只會認得畫面上第一個符合的元素，這正是重複 id
        造成的真實 bug，不只是「理論上不建議」而已。
      </p>
    </div>
  )
}

export default IdDemoLab
