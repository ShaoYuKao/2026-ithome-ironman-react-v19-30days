import { useState } from 'react'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, selectCartItems, selectCartTotalPrice } from '../store/cartSlice.js'
import { selectCurrentUser } from '../store/userSlice.js'

// CheckoutPage：受 RequireAuth 保護（見 router.jsx），能進到這一頁時，
// user slice 一定已經有登入資料，可以放心用 selectCurrentUser 預填表單。
//
// 送出訂單後，今天刻意「不」跳轉到 /order-success 這種獨立頁面，而是用
// 元件內的 local state（orderId）切換畫面內容——避免在還沒教過
// navigate(path, { state }) 的情況下畫蛇添足；下單完成的畫面本身就在
// 同一個路由、同一個元件裡，邏輯更直接也更容易理解。
function CheckoutPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const totalPrice = useSelector(selectCartTotalPrice)
  const currentUser = useSelector(selectCurrentUser)

  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [address, setAddress] = useState('')
  const [orderId, setOrderId] = useState(null)

  if (orderId) {
    return (
      <div className="page-inner page-inner--narrow">
        <div className="success-card">
          <p className="success-card__icon">✅</p>
          <h1>訂單已送出！</h1>
          <p>訂單編號：{orderId}</p>
          <p className="subtitle">我們已收到您的訂單，稍後會寄送出貨通知到 {email}。</p>
          <div className="hero-actions">
            <Link to="/" className="primary-btn">
              回首頁
            </Link>
            <Link to="/products" className="secondary-btn">
              繼續購物
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-inner">
        <h1>結帳</h1>
        <div className="empty-state">
          <p>購物車是空的，無法結帳。</p>
          <Link to="/products" className="secondary-btn">
            去逛逛商品
          </Link>
        </div>
      </div>
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    // 範例專案沒有真正的訂單後端，這裡用時間戳記做一個看起來夠真實的假訂單編號。
    const fakeOrderId = `D28-${Date.now().toString(36).toUpperCase()}`
    setOrderId(fakeOrderId)
    dispatch(clearCart())
  }

  return (
    <div className="page-inner">
      <h1>結帳</h1>

      <div className="checkout-layout">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>收件資訊</h2>

          <label className="form-field">
            <span>收件人姓名</span>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>收件地址</span>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="請輸入收件地址"
              required
            />
          </label>

          <button type="submit" className="primary-btn">
            送出訂單
          </button>
        </form>

        <aside className="order-summary card">
          <h2>訂單明細</h2>
          <ul className="order-summary__list">
            {items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>NT$ {(item.price * item.qty).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="order-summary__total">總計：NT$ {totalPrice.toLocaleString()}</p>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
