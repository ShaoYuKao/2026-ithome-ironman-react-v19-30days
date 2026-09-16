import { useId } from 'react'

/**
 * ✅ 正確作法：用 useId() 產生「這一個元件實例」專屬的 id 前綴，
 * 再用字串樣板組出多個彼此相關的子 id（-street、-zip、-hint）。
 *
 * 對照 Hook_Info/Hook.md「六、其他 Hooks」：
 * 「產生一個在同一次渲染中、伺服端與客戶端皆一致且唯一的 ID 字串，
 *   常用於 aria-*、htmlFor 等無障礙屬性」。
 *
 * 因為 id 是在元件內部、每次「掛載」時才產生的，即使這個元件在同一個頁面
 * 被重複使用兩次（例如「帳單地址」與「收件地址」），兩份 id 也保證不會撞名。
 */
function AddressFields({ legend, values, onChange }) {
  const id = useId()
  const streetId = `${id}-street`
  const streetHintId = `${id}-street-hint`
  const zipId = `${id}-zip`

  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>

      <div className="field">
        <label htmlFor={streetId} className="field-label">
          街道地址
        </label>
        <input
          id={streetId}
          className="field-input"
          aria-describedby={streetHintId}
          value={values.street}
          onChange={(event) => onChange({ ...values, street: event.target.value })}
        />
        <p id={streetHintId} className="field-hint">
          請包含門牌號碼
        </p>
      </div>

      <div className="field">
        <label htmlFor={zipId} className="field-label">
          郵遞區號
        </label>
        <input
          id={zipId}
          className="field-input"
          value={values.zip}
          onChange={(event) => onChange({ ...values, zip: event.target.value })}
        />
      </div>

      <p className="rendered-id-list">
        本次渲染實際產生的 id：{streetId}、{zipId}
      </p>
    </fieldset>
  )
}

export default AddressFields
