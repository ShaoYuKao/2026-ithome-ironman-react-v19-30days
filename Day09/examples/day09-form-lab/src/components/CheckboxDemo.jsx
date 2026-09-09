import { useState } from 'react'

const INTEREST_OPTIONS = ['閱讀', '旅遊', '運動', '音樂', '程式設計']

// 實驗二：<input type="checkbox"> 的資料綁定
//
// 單一 checkbox：綁定的是布林值，要用 checked（不是 value）+ onChange 讀取 event.target.checked。
// 多個 checkbox（複選群組）：綁定的是「陣列」或「Set」，每次點擊都是「切換某一個項目在不在陣列裡」。
function CheckboxDemo() {
  const [agreed, setAgreed] = useState(false)
  const [interests, setInterests] = useState([])

  function toggleInterest(interest) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    )
  }

  return (
    <section className="card">
      <h2>2️⃣ Checkbox 核取方塊綁定</h2>
      <p className="card-desc">
        checkbox 綁定的重點：使用 <code>checked</code>（不是 <code>value</code>）搭配{' '}
        <code>onChange</code>，並從 <code>event.target.checked</code> 讀取布林值。
      </p>

      <div className="checkbox-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          我已閱讀並同意服務條款
        </label>
        <p className="live-echo">
          目前狀態：<strong>{agreed ? '✅ 已勾選' : '⬜ 未勾選'}</strong>
        </p>
      </div>

      <div className="checkbox-group">
        <p className="form-label">興趣（複選）：</p>
        <div className="checkbox-grid">
          {INTEREST_OPTIONS.map((interest) => (
            <label key={interest} className="checkbox-label">
              <input
                type="checkbox"
                checked={interests.includes(interest)}
                onChange={() => toggleInterest(interest)}
              />
              {interest}
            </label>
          ))}
        </div>
        <p className="live-echo">
          已選擇：<strong>{interests.length > 0 ? interests.join('、') : '（尚未選擇）'}</strong>
        </p>
        <p className="form-hint">
          多個 checkbox 綁定同一組資料時，state 通常是一個陣列；每次點擊就用{' '}
          <code>includes()</code> 判斷「目前有沒有選」，再用 <code>filter</code> / 展開運算子
          切換這個項目要「加入」還是「移除」。
        </p>
      </div>
    </section>
  )
}

export default CheckboxDemo
