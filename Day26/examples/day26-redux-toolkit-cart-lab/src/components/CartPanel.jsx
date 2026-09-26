import { useDispatch, useSelector } from 'react-redux'
import {
  changeQty,
  clearCart,
  removeItem,
  selectCartItems,
  selectCartTotalCount,
  selectCartTotalPrice,
} from '../store/cartSlice.js'

// CartPanel：今天真正的學習重點——只靠 useSelector 讀取全域狀態，
// 不需要 props、不需要 Context，購物車圖示的件數、明細、應付總金額，
// 三個 useSelector 呼叫各自訂閱 state 裡「真正會用到的那一小塊」
// （對應 Day25 第二節提過的「比 Context 更細顆粒度的重新渲染」）。
function CartPanel() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const totalCount = useSelector(selectCartTotalCount)
  const totalPrice = useSelector(selectCartTotalPrice)

  return (
    <section className="card cart-panel">
      <h2>🛒 購物車（{totalCount} 件）</h2>

      {items.length === 0 ? (
        <p className="empty-state">購物車是空的，從左側商品列表加入商品看看</p>
      ) : (
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.id} className="cart-item">
              <span className="cart-item__image" aria-hidden="true">
                {item.image}
              </span>
              <div className="cart-item__info">
                <span className="cart-item__name">{item.name}</span>
                <span className="form-hint">
                  NT$ {item.price.toLocaleString()} x {item.qty}
                </span>
              </div>
              <div className="button-row">
                <button
                  type="button"
                  className="secondary-btn"
                  aria-label={`減少 ${item.name} 數量`}
                  onClick={() => dispatch(changeQty({ id: item.id, qty: item.qty - 1 }))}
                >
                  -
                </button>
                <span className="cart-item__qty">{item.qty}</span>
                <button
                  type="button"
                  className="secondary-btn"
                  aria-label={`增加 ${item.name} 數量`}
                  onClick={() => dispatch(changeQty({ id: item.id, qty: item.qty + 1 }))}
                >
                  +
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => dispatch(removeItem({ id: item.id }))}
                >
                  移除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="live-echo">應付總金額：NT$ {totalPrice.toLocaleString()}</p>

      <button
        type="button"
        className="secondary-btn"
        disabled={items.length === 0}
        onClick={() => dispatch(clearCart())}
      >
        清空購物車
      </button>
    </section>
  )
}

export default CartPanel
