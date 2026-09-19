import { use } from 'react'
import CurrencyContext from '../utils/CurrencyContext.js'

/**
 * 只有 showFormatted 為 true 時才會呼叫 use(CurrencyContext)。
 * 未勾選時提早 return，下面的 use() 完全不會被執行到——一般 Hook（例如
 * useContext、useState）不允許這樣寫（Hook 規則要求一定要在頂層、每次
 * 渲染都用相同順序呼叫），但 use() 是官方文件明確允許的例外。
 */
function ProductPrice({ amount, showFormatted }) {
  if (!showFormatted) {
    return <span className="price price--plain">{amount}（原始數字）</span>
  }

  const format = use(CurrencyContext)
  const formatted = new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.currency,
    maximumFractionDigits: 0,
  }).format(amount)

  return <span className="price price--formatted">{formatted}</span>
}

function ProductPriceRow({ product, showFormatted, onToggle }) {
  return (
    <tr>
      <td>{product.name}</td>
      <td>
        <ProductPrice amount={product.amount} showFormatted={showFormatted} />
      </td>
      <td>
        <label className="checkbox-label">
          <input type="checkbox" checked={showFormatted} onChange={onToggle} />
          格式化
        </label>
      </td>
    </tr>
  )
}

export default ProductPriceRow
