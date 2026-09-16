/**
 * ❌ 錯誤示範：把 id 寫死成固定字串，而不是用 useId() 動態產生。
 *
 * 單獨看這個元件、只使用一次的時候完全看不出問題；但只要同一個元件在
 * 同一個頁面被重複使用兩次以上（例如「帳單地址」「收件地址」各出現一次），
 * 就會產生重複的 id——瀏覽器的 `document.getElementById()`、
 * `label` 的 `htmlFor` 對應，都只認「第一個」符合該 id 的元素，
 * 導致第二份表單的 label 點下去，焦點卻跑到第一份表單的欄位上。
 *
 * 這個元件刻意跟 AddressFields.jsx 結構完全一樣，只有 id 的來源不同，
 * 方便直接對照兩者的差異。
 */
function BadAddressFields({ legend, values, onChange }) {
  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>

      <div className="field">
        <label htmlFor="address-street" className="field-label">
          街道地址
        </label>
        <input
          id="address-street"
          className="field-input"
          aria-describedby="address-street-hint"
          value={values.street}
          onChange={(event) => onChange({ ...values, street: event.target.value })}
        />
        <p id="address-street-hint" className="field-hint">
          請包含門牌號碼
        </p>
      </div>

      <div className="field">
        <label htmlFor="address-zip" className="field-label">
          郵遞區號
        </label>
        <input
          id="address-zip"
          className="field-input"
          value={values.zip}
          onChange={(event) => onChange({ ...values, zip: event.target.value })}
        />
      </div>

      <p className="rendered-id-list">本次渲染實際產生的 id：address-street、address-zip（寫死，兩個實例完全相同）</p>
    </fieldset>
  )
}

export default BadAddressFields
