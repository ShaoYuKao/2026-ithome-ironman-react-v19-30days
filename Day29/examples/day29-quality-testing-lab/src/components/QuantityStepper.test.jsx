import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuantityStepper from './QuantityStepper.jsx'

// QuantityStepper 是純展示型元件，不需要 <Provider>，直接 render 就能測試。
describe('QuantityStepper（數量調整元件）', () => {
  it('會把目前的 qty 顯示在輸入框內', () => {
    render(<QuantityStepper qty={3} onChange={() => {}} />)

    expect(screen.getByLabelText('購買數量')).toHaveValue(3)
  })

  it('點擊「+」按鈕時，會呼叫 onChange 並帶入 qty + 1', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<QuantityStepper qty={2} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: '增加數量' }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(3)
  })

  it('qty 已經等於 min 時，「−」按鈕要是 disabled，不能再往下減少', () => {
    render(<QuantityStepper qty={1} min={1} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: '減少數量' })).toBeDisabled()
  })

  it('qty 已經等於 max 時，「+」按鈕要是 disabled，不能再往上加（庫存上限情境）', () => {
    render(<QuantityStepper qty={5} max={5} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: '增加數量' })).toBeDisabled()
  })
})
