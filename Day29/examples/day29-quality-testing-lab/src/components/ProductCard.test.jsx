import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from './ProductCard.jsx'
import { renderWithStore } from '../test/test-utils.jsx'
import { selectCartItems } from '../store/cartSlice.js'

const product = { id: 'p1', name: '機械鍵盤', price: 2280, image: '⌨️', stock: 5 }

// ProductCard 是連接 Redux 的容器元件，測試時要用 renderWithStore
// 包一層 <Provider>，屬於「整合測試」：驗證的不只是畫面，還有
// 「操作畫面之後，store 裡的資料有沒有正確更新」。
describe('ProductCard（連接 Redux 的容器元件）', () => {
  it('把數量調整成 2 後按下加入購物車，store 裡的購物車項目數量要正確更新為 2', async () => {
    const user = userEvent.setup()
    const { store } = renderWithStore(<ProductCard product={product} />)

    await user.click(screen.getByRole('button', { name: '增加數量' }))
    await user.click(screen.getByRole('button', { name: '🛒 加入購物車' }))

    expect(selectCartItems(store.getState())).toEqual([
      { id: 'p1', name: '機械鍵盤', price: 2280, image: '⌨️', qty: 2 },
    ])
  })

  it('商品已經在購物車裡時（preloadedState 帶入初始資料），畫面要顯示「已加入購物車」提示', () => {
    renderWithStore(<ProductCard product={product} />, {
      preloadedState: {
        cart: { items: [{ id: 'p1', name: '機械鍵盤', price: 2280, image: '⌨️', qty: 1 }] },
      },
    })

    expect(screen.getByRole('button', { name: /已加入購物車/ })).toBeInTheDocument()
  })
})
