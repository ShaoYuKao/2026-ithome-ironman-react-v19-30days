// cartReducer：示範「多個狀態彼此關聯」的複雜情境——購物車。
//
// 如果改用好幾個 useState 分別管理 items（品項清單）、couponCode（優惠碼）、
// discountRate（折扣比例），會遇到幾個麻煩：
// - 套用優惠碼時，要同時更新 couponCode 與 discountRate 兩個 state，
//   一不小心漏更新其中一個，畫面顯示的折扣跟實際套用的優惠碼就會兜不起來。
// - 清空購物車時，items、couponCode、discountRate 三個 state 都要一起重設，
//   同樣有「忘記重設某一個」的風險。
// useReducer 把這些「一次要同時變動好幾個欄位」的邏輯，集中寫在同一個 case 裡，
// 保證每次 dispatch 之後，回傳的都是一份「內部彼此一致」的完整 state。

export const COUPONS = {
  SAVE10: 0.1,
  SAVE20: 0.2,
}

// initCartState：useReducer 的 Lazy Initializer（第三個參數），
// 讓「一開始要放哪些商品進購物車」這種計算邏輯獨立成一個純函式，方便閱讀與測試。
export function initCartState(initialItems) {
  return {
    items: initialItems, // [{ id, name, price, qty }]
    couponCode: '',
    discountRate: 0,
  }
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'cart/addItem': {
      const { id, name, price } = action.payload
      const existing = state.items.find((item) => item.id === id)
      // 商品已經在購物車裡：只增加數量；否則加入一筆新項目。
      const items = existing
        ? state.items.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
        : [...state.items, { id, name, price, qty: 1 }]
      return { ...state, items }
    }

    case 'cart/removeItem':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) }

    case 'cart/changeQty': {
      const { id, qty } = action.payload
      if (qty <= 0) {
        // 數量歸零視同移除，避免畫面出現「數量 0」這種沒有意義的狀態。
        return { ...state, items: state.items.filter((item) => item.id !== id) }
      }
      return {
        ...state,
        items: state.items.map((item) => (item.id === id ? { ...item, qty } : item)),
      }
    }

    case 'cart/applyCoupon': {
      const code = action.payload.code.trim().toUpperCase()
      const rate = COUPONS[code]
      // 找不到對應優惠碼：只更新 couponCode（讓畫面顯示使用者輸入了什麼），
      // discountRate 維持 0，不套用任何折扣。
      return { ...state, couponCode: code, discountRate: rate ?? 0 }
    }

    case 'cart/reset':
      // 一次性把 items、couponCode、discountRate 三個欄位重設，
      // 不會有「重設了商品清單，卻忘記清掉優惠碼」這種不一致的狀態。
      return { items: [], couponCode: '', discountRate: 0 }

    default:
      throw new Error(`cartReducer 收到未知的 action type：${action.type}`)
  }
}
