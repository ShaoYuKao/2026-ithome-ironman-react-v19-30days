import { createSlice } from '@reduxjs/toolkit'

// cartSlice：直接沿用 Day26／Day25 設計好的購物車規格（state shape、四個
// action、三個 selector），今天沒有任何邏輯上的改變。
//
// 唯一的小擴充：addItem 的 payload 多支援一個可選的 qty 欄位——
// Day26 的商品列表頁只會「加入 1 件」，今天多了商品詳情頁（可以選數量
// 再加入購物車），所以 addItem 需要能一次加入 qty 件。沒有帶 qty 時預設
// 為 1，跟 Day26 的行為完全相容。
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

    // 對應 cart/changeQty：qty 降到 0 或以下視同移除（Day25 設計決策 (a)）。
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

    // 對應 cart/clearCart：清空 items。結帳完成後也會呼叫這個 action。
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, removeItem, changeQty, clearCart } = cartSlice.actions
export default cartSlice.reducer

// --- Selectors：對應 Day25 Step 5 的設計，永遠即時從 items 計算，不存進 state ---
export const selectCartItems = (state) => state.cart.items

export const selectCartTotalCount = (state) => state.cart.items.reduce((sum, item) => sum + item.qty, 0)

export const selectCartTotalPrice = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
