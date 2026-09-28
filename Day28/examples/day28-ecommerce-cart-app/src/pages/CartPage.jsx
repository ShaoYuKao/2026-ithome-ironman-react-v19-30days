import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { changeQty, clearCart, removeItem, selectCartItems, selectCartTotalPrice } from '../store/cartSlice.js'

// CartPage：Day26 的 CartPanel 的「整頁版」，邏輯完全相同
// （調整數量、移除、清空、小計），只是換成獨立頁面呈現，並且多了
// 「前往結帳」的連結——按下去之後，是否需要先登入，交給 /checkout
// 路由外層包的 <RequireAuth> 處理，這一頁完全不需要關心登入狀態。
function CartPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const totalPrice = useSelector(selectCartTotalPrice)

  if (items.length === 0) {
    return (
      <div className="page-inner">
        <h1>購物車</h1>
        <div className="empty-state">
          <p>購物車目前是空的。</p>
          <Link to="/products" className="secondary-btn">
            去逛逛商品
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-inner">
      <h1>購物車</h1>

      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-list__item">
            <span className="cart-list__image" aria-hidden="true">
              {item.image}
            </span>
            <div className="cart-list__info">
              <p className="cart-list__name">{item.name}</p>
              <p className="cart-list__price">NT$ {item.price.toLocaleString()}</p>
            </div>

            <div className="qty-stepper">
              <button
                type="button"
                onClick={() => dispatch(changeQty({ id: item.id, qty: item.qty - 1 }))}
                aria-label="減少數量"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(event) =>
                  dispatch(changeQty({ id: item.id, qty: Number(event.target.value) || 1 }))
                }
                aria-label="購買數量"
              />
              <button
                type="button"
                onClick={() => dispatch(changeQty({ id: item.id, qty: item.qty + 1 }))}
                aria-label="增加數量"
              >
                +
              </button>
            </div>

            <p className="cart-list__subtotal">NT$ {(item.price * item.qty).toLocaleString()}</p>

            <button type="button" className="secondary-btn" onClick={() => dispatch(removeItem({ id: item.id }))}>
              移除
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <button type="button" className="secondary-btn" onClick={() => dispatch(clearCart())}>
          清空購物車
        </button>
        <p className="cart-summary__total">總計：NT$ {totalPrice.toLocaleString()}</p>
        <Link to="/checkout" className="primary-btn">
          前往結帳
        </Link>
      </div>
    </div>
  )
}

export default CartPage
