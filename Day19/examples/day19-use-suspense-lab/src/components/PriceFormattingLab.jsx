import { useState } from 'react'
import CurrencyContext from '../utils/CurrencyContext.js'
import ProductPriceRow from './ProductPriceRow.jsx'

const PRODUCTS = [
  { id: 1, name: '藍牙耳機', amount: 1290 },
  { id: 2, name: '機械式鍵盤', amount: 2490 },
  { id: 3, name: '行動電源', amount: 890 },
  { id: 4, name: '無線滑鼠', amount: 690 },
]

/**
 * Demo 2：use(context) 可以在條件式、迴圈中呼叫。
 *
 * 每一列商品都各自決定「要不要格式化價格」；ProductPrice（見
 * ProductPriceRow.jsx）只有在 showFormatted 為 true 的那一列，才會呼叫
 * use(CurrencyContext)——同一個 .map() 迴圈裡，有些次呼叫了 use()、有些次
 * 完全沒呼叫，呼叫與否因列而異、也因使用者勾選狀態而異。若換成
 * useContext，這種寫法在 render 期間就會直接違反 Hook 規則（Hook 不能放
 * 在條件式或迴圈中）。
 */
function PriceFormattingLab() {
  const [formattedIds, setFormattedIds] = useState(() => new Set([1, 3]))

  function toggleRow(id) {
    setFormattedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <section className="demo-card">
      <h2>2️⃣ use(context)：迴圈中條件式讀取</h2>
      <p className="demo-desc">
        勾選右側「格式化」核取方塊，該列才會呼叫 <code>use(CurrencyContext)</code>{' '}
        把數字轉換成含千分位與貨幣符號的字串；沒勾選的列完全不會呼叫{' '}
        <code>use()</code>。這種「同一個迴圈裡，每一列呼叫與否都不一樣」的
        寫法，正是 <code>useContext</code> 做不到、但官方文件特別允許{' '}
        <code>use()</code> 這樣用的地方。
      </p>

      {/* React 19 開始，Context 物件本身就能當作 Provider 使用，
          不需要再寫成 <CurrencyContext.Provider value={...}>。 */}
      <CurrencyContext value={{ locale: 'zh-TW', currency: 'TWD' }}>
        <table className="price-table">
          <thead>
            <tr>
              <th>商品</th>
              <th>價格</th>
              <th>顯示方式</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((product) => (
              <ProductPriceRow
                key={product.id}
                product={product}
                showFormatted={formattedIds.has(product.id)}
                onToggle={() => toggleRow(product.id)}
              />
            ))}
          </tbody>
        </table>
      </CurrencyContext>
    </section>
  )
}

export default PriceFormattingLab
