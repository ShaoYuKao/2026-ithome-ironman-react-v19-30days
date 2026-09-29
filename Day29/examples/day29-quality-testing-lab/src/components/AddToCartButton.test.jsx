import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddToCartButton from './AddToCartButton.jsx'

// AddToCartButton 也是純展示型元件：同樣不需要 <Provider>。
describe('AddToCartButton（加入購物車按鈕）', () => {
  it('預設狀態顯示「加入購物車」，點擊會呼叫 onAdd 一次', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn()
    render(<AddToCartButton onAdd={handleAdd} />)

    await user.click(screen.getByRole('button', { name: '🛒 加入購物車' }))

    expect(handleAdd).toHaveBeenCalledTimes(1)
  })

  it('disabled 為 true（沒有庫存）時顯示「已售完」，且點擊不會呼叫 onAdd', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn()
    render(<AddToCartButton disabled onAdd={handleAdd} />)

    const button = screen.getByRole('button', { name: '已售完' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleAdd).not.toHaveBeenCalled()
  })

  it('inCart 為 true 時，文字要換成「已加入購物車」的提示', () => {
    render(<AddToCartButton inCart onAdd={() => {}} />)

    expect(screen.getByRole('button', { name: /已加入購物車/ })).toBeInTheDocument()
  })
})
