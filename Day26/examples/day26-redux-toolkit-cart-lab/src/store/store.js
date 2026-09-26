import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice.js'

// configureStore：一行程式碼建立整個 App 唯一的 store。
// 跟原始 Redux 的 createStore 比起來，configureStore 自動做了兩件事：
// ① 接上 Redux DevTools（瀏覽器安裝 Redux DevTools 擴充套件後，
//    可以直接看到今天 dispatch 過的每一個 cart/addItem、cart/removeItem…… action，
//    以及每次 state 變化前後的差異）；
// ② 內建一組常用的 Middleware（其中包含 redux-thunk）——Day27 要學的
//    createAsyncThunk 能運作，靠的正是這裡內建的 thunk middleware，
//    今天雖然還用不到，但 store 已經準備好了。
//
// reducer 這裡先只有 cart 一個 slice；Day28 做「多頁面電商購物車 App」時，
// 會在這裡繼續加入 products、user 等 slice，變成
// configureStore({ reducer: { cart, products, user } })（對照 Day25 第四節表格）。
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
})
