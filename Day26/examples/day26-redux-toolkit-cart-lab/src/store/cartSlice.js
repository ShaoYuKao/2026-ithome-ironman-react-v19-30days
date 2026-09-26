import { createSlice } from '@reduxjs/toolkit'

// initialState 對應 Day25 Step 2 設計的 State Shape：
// state.cart 只存「必要」的原始資料（items 陣列），
// 完全不存任何「算得出來的值」（像小計、總件數），
// 那些改用檔案最下方的 Selector 現算，對照 Day25 Step 5 的設計。
const initialState = {
  items: [], // [{ id, name, price, image, qty }]
}

const cartSlice = createSlice({
  name: 'cart', // 這個字串會變成每個 action type 的前綴，例如 'cart/addItem'
  initialState,
  reducers: {
    // 對應 Day25 Step 3／Step 4 的 cart/addItem：
    // 購物車裡已經有相同 id 的商品 → 只把 qty 加 1；
    // 沒有的話 → 加入一筆新項目，qty 從 1 開始。
    //
    // 這裡的 `existing.qty += 1`、`state.items.push(...)` 看起來像直接
    // 修改（mutate）state，但 createSlice 內建的 Immer 會在背後把這些操作
    // 自動轉換成正確的不可變更新（產生一份全新的 state），並不會真的
    // mutate 到原本的資料——這正是 Day25 第五節提過的「Immer 讓寫法更直覺，
    // 但沒有違反 Redux 的原則本身」。
    addItem(state, action) {
      const { id, name, price, image } = action.payload
      const existing = state.items.find((item) => item.id === id)
      if (existing) {
        existing.qty += 1
      } else {
        state.items.push({ id, name, price, image, qty: 1 })
      }
    },

    // 對應 cart/removeItem：依 id 把整個項目移除，不論目前 qty 是多少。
    removeItem(state, action) {
      const { id } = action.payload
      state.items = state.items.filter((item) => item.id !== id)
    },

    // 對應 cart/changeQty：把指定 id 項目的 qty 更新成傳入的數值；
    // qty 降到 0 或以下視同移除——這是 Day25 Step 4 明確記錄下來的設計決策
    // (a)：讓「減少數量」與「移除商品」共用同一個操作入口，體驗更直覺。
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
    // 如果之後 cart 這個 slice 又多了 couponCode／discountRate 等欄位
    // （Day25 第六節的挑戰任務），記得要在這裡一次全部重設，
    // 不能只清空 items、忘記重設其他關聯欄位。
    clearCart(state) {
      state.items = []
    },
  },
})

// createSlice 會自動幫每個 reducer 產生對應的 action creator，
// 呼叫 addItem(payload) 會得到 { type: 'cart/addItem', payload }，
// 不需要像 Day12 的 cartReducer.js 那樣手動寫出 action type 字串常數。
export const { addItem, removeItem, changeQty, clearCart } = cartSlice.actions

export default cartSlice.reducer

// --- Selectors：對應 Day25 Step 5 的設計 ---
// 「算出來的值」（小計、總件數）一律用 Selector 現算，不存進 state，
// 保證 items 一改變，這些值馬上就是最新、彼此一致的結果，
// 不會有「改了 qty 卻忘記同步更新總金額」的風險。
export const selectCartItems = (state) => state.cart.items

export const selectCartTotalCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0)

export const selectCartTotalPrice = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
