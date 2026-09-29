// 「加入購物車」按鈕：一樣是展示型元件，畫面（文字、是否 disabled）完全由
// props 決定，實際「把商品加進 Redux store」的邏輯交給外層容器元件
// （見 ProductCard）處理。這個按鈕只單純負責一件事：使用者按下去時呼叫 onAdd。
function AddToCartButton({ disabled = false, inCart = false, onAdd }) {
  const label = disabled ? '已售完' : inCart ? '✓ 已加入購物車（再加 1 件）' : '🛒 加入購物車'

  return (
    <button type="button" className="primary-btn" onClick={onAdd} disabled={disabled}>
      {label}
    </button>
  )
}

export default AddToCartButton
