// 「數量調整」元件：純粹的展示型（Presentational）元件——完全不知道
// Redux、也不知道「購物車」是什麼，只負責「顯示目前數量 + 兩個按鈕 +
// 一個輸入框」，並透過 onChange 把使用者想要的新數量丟回給外層元件。
//
// 這種「只靠 props 決定畫面長相、不含任何業務邏輯」的元件，是最容易寫測試
// 的元件：不需要包 <Provider>，直接 render 就能驗證畫面與互動行為。
function QuantityStepper({ qty, min = 1, max = 99, onChange, label = '購買數量' }) {
  function clamp(nextQty) {
    return Math.min(Math.max(nextQty, min), max)
  }

  return (
    <div className="qty-stepper">
      <button
        type="button"
        onClick={() => onChange(clamp(qty - 1))}
        disabled={qty <= min}
        aria-label="減少數量"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={qty}
        onChange={(event) => onChange(clamp(Number(event.target.value) || min))}
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(qty + 1))}
        disabled={qty >= max}
        aria-label="增加數量"
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
