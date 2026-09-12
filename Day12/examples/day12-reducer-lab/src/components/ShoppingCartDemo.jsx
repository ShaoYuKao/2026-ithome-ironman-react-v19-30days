import { useReducer, useState } from 'react'
import { COUPONS, cartReducer, initCartState } from '../reducers/cartReducer.js'

const SAMPLE_PRODUCTS = [
  { id: 'p1', name: '藍牙耳機', price: 990 },
  { id: 'p2', name: '機械鍵盤', price: 2280 },
  { id: 'p3', name: '無線滑鼠', price: 590 },
]

// ShoppingCartDemo：示範「多個狀態彼此關聯」的複雜情境。
// 購物車品項（items）、優惠碼（couponCode）、折扣比例（discountRate）三者互相牽動：
// 套用優惠碼會同時影響 couponCode 與 discountRate，清空購物車則三者都要一起重設。
// 用 useReducer 搭配 initCartState（第三個參數，Lazy Initializer）把這些邏輯集中管理，
// 確保每次 dispatch 之後，state 內部的三個欄位永遠是「彼此一致」的完整結果。
function ShoppingCartDemo() {
  const [state, dispatch] = useReducer(cartReducer, [], initCartState)
  const [couponInput, setCouponInput] = useState('')

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = Math.round(subtotal * state.discountRate)
  const total = subtotal - discount

  function handleApplyCoupon(event) {
    event.preventDefault()
    dispatch({ type: 'cart/applyCoupon', payload: { code: couponInput } })
  }

  return (
    <section className="card">
      <h2>2️⃣ useReducer 管理「彼此關聯」的複雜狀態：購物車</h2>
      <p className="card-desc">
        商品清單、優惠碼、折扣比例三者互相關聯——套用優惠碼要同時更新兩個欄位，
        清空購物車要同時重設三個欄位。這正是「狀態轉換規則多、彼此關聯」該用 
        <code>useReducer</code> 取代多個 <code>useState</code> 的典型情
        境：<code>cartReducer</code>{' '} 的每個 case 都負責回傳一份「內
        部彼此一致」的完整 state，呼叫端不需要自己操心「這次操作到底該同時更
        新哪幾個欄位」。可套用的優惠碼：<code>SAVE10</code>（9 折）、
        <code>SAVE20</code>（8 折）。
      </p>

      <div className="button-row">
        {SAMPLE_PRODUCTS.map((product) => (
          <button
            key={product.id}
            type="button"
            className="secondary-btn"
            onClick={() =>
              dispatch({
                type: 'cart/addItem',
                payload: { id: product.id, name: product.name, price: product.price },
              })
            }
          >
            加入「{product.name}」NT${product.price}
          </button>
        ))}
      </div>

      {state.items.length === 0 ? (
        <p className="empty-state">購物車是空的，點擊上方按鈕加入商品</p>
      ) : (
        <ul className="cart-list">
          {state.items.map((item) => (
            <li key={item.id} className="cart-item">
              <span className="cart-item__name">{item.name}</span>
              <span className="form-hint">NT${item.price} x {item.qty}</span>
              <div className="button-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    dispatch({ type: 'cart/changeQty', payload: { id: item.id, qty: item.qty - 1 } })
                  }
                >
                  -
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    dispatch({ type: 'cart/changeQty', payload: { id: item.id, qty: item.qty + 1 } })
                  }
                >
                  +
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => dispatch({ type: 'cart/removeItem', payload: { id: item.id } })}
                >
                  移除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="todo-input-row" onSubmit={handleApplyCoupon}>
        <input
          type="text"
          className="form-input"
          placeholder="輸入優惠碼，例如 SAVE10"
          value={couponInput}
          onChange={(event) => setCouponInput(event.target.value)}
        />
        <button type="submit" className="secondary-btn">
          套用優惠碼
        </button>
      </form>

      {state.couponCode !== '' && (
        <p className="form-hint">
          目前優惠碼：{state.couponCode}
          {COUPONS[state.couponCode] ? `（折扣 ${state.discountRate * 100}%）` : '（查無此優惠碼，未套用折扣）'}
        </p>
      )}

      <p className="live-echo">
        小計 NT${subtotal} － 折扣 NT${discount} ＝ 應付 NT${total}
      </p>

      <button type="button" className="secondary-btn" onClick={() => dispatch({ type: 'cart/reset' })}>
        清空購物車
      </button>
    </section>
  )
}

export default ShoppingCartDemo
