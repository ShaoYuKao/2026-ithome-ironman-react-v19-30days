import { createSlice } from '@reduxjs/toolkit'

// cartSlice：沿用 Day26／Day28 設計好的購物車規格（state shape、四個 action、
// 三個 selector），今天沒有新的 Redux 語法。今天真正的重點是「這個 slice 好不好
// 測試」——所有 reducer 都是單純的同步函式，不需要任何 mock 就能被 Vitest 直接
// 呼叫，這也是 Day29 選擇拿購物車當練習素材的原因之一。
const initialState = {
  items: [], // [{ id, name, price, image, qty }]
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // 對應 cart/addItem：已存在相同 id → qty 累加；不存在 → 新增一筆項目。
    addItem(state, action) {
      const { id, name, price, image, qty = 1 } = action.payload
      const existing = state.items.find((item) => item.id === id)
      if (existing) {
        existing.qty += qty
      } else {
        state.items.push({ id, name, price, image, qty })
      }
    },

    // 對應 cart/removeItem：依 id 移除整個項目。
    removeItem(state, action) {
      const { id } = action.payload
      state.items = state.items.filter((item) => item.id !== id)
    },

    // 對應 cart/changeQty：qty 降到 0 或以下視同移除。
    changeQty(state, action) {
      const { id, qty } = action.payload
      if (qty <= 0) {
        state.items = state.items.filter((item) => item.id !== id)
        return
      }
      const target = state.items.find((item) => item.id === id)
      if (target) {
        target.qty = qty
      }
    },

    // 對應 cart/clearCart：清空 items。
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, removeItem, changeQty, clearCart } = cartSlice.actions
export default cartSlice.reducer

// --- Selectors：永遠即時從 items 計算，不額外存進 state ---
export const selectCartItems = (state) => state.cart.items

export const selectCartTotalCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0)

export const selectCartTotalPrice = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)

// 依 id 找出某一筆購物車項目；ProductCard 用它判斷「這件商品是不是已經在購物車裡」。
export const selectCartItemById = (id) => (state) => state.cart.items.find((item) => item.id === id)
