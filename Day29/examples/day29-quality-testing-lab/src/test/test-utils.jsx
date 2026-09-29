import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import { createAppStore } from '../store/store.js'

// renderWithStore：測試「有連接 Redux」的容器元件（例如 ProductCard）時的
// 共用工具函式。每次呼叫都會（除非自己傳入 store）建立一份全新的 store，
// 可用 preloadedState 指定初始資料，測試之間不會共用同一份全域狀態。
//
// 回傳值除了 render() 原本的 screen 查詢方法之外，多回傳一個 store，
// 方便測試直接讀取 store.getState() 驗證「操作畫面後，資料是否真的更新」。
export function renderWithStore(
  ui,
  { preloadedState, store = createAppStore(preloadedState) } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper }) }
}
