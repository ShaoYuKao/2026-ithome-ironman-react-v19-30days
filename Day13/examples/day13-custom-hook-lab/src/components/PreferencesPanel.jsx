import { useLocalStorage } from '../hooks/useLocalStorage.js'

const THEME_OPTIONS = [
  { value: 'system', label: '跟隨系統' },
  { value: 'light', label: '亮色' },
  { value: 'dark', label: '暗色' },
]

const DEFAULT_PREFERENCES = {
  displayName: '',
  theme: 'system',
  notifyByEmail: true,
}

function PreferencesPanel() {
  // 跟上面的待辦清單完全無關的另一個元件、另一個 localStorage key、
  // 另一種資料形狀（這裡存的是物件，待辦清單存的是陣列）——
  // 卻同樣只用一行 useLocalStorage(...) 就搞定，證明這個 Hook 真的可以重複使用。
  const [preferences, setPreferences] = useLocalStorage('day13-preferences', DEFAULT_PREFERENCES)

  function updateField(key, value) {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    setPreferences(DEFAULT_PREFERENCES)
  }

  return (
    <section className="card">
      <h2>3️⃣ useLocalStorage 的第二次重複使用：偏好設定面板</h2>
      <p className="card-desc">
        修改下面任何一個欄位後重新整理頁面，資料一樣會保留——跟待辦清單使用的是
        <strong>同一個</strong> <code>useLocalStorage</code> 實作，只是換了 key（
        <code>day13-preferences</code>）跟初始值。這正是抽出自訂 Hook 帶來的「邏輯複用」：
        不需要重新寫一次 <code>useState</code> + <code>useEffect</code> + JSON 序列化 /
        反序列化。
      </p>

      <label className="form-label" htmlFor="pref-name">
        顯示名稱
      </label>
      <input
        id="pref-name"
        type="text"
        className="form-input"
        value={preferences.displayName}
        onChange={(event) => updateField('displayName', event.target.value)}
        placeholder="輸入你的暱稱"
      />

      <label className="form-label" htmlFor="pref-theme">
        主題
      </label>
      <select
        id="pref-theme"
        className="form-input"
        value={preferences.theme}
        onChange={(event) => updateField('theme', event.target.value)}
      >
        {THEME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={preferences.notifyByEmail}
          onChange={(event) => updateField('notifyByEmail', event.target.checked)}
        />
        透過 Email 通知
      </label>

      <div className="live-echo">
        目前儲存的內容：<code>{JSON.stringify(preferences)}</code>
      </div>

      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={handleReset}>
          重設為預設值
        </button>
      </div>
    </section>
  )
}

export default PreferencesPanel
