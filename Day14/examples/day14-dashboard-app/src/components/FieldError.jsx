// 共用的小型錯誤訊息元件（沿用 Day09）：沒有錯誤訊息時什麼都不渲染（Day06 條件渲染複習）。
function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="field-error">⚠️ {message}</p>
}

export default FieldError
