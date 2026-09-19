import { createContext } from 'react'

// 給 Demo 2（PriceFormattingLab）使用：locale 決定千分位符號／貨幣符號的
// 顯示慣例，currency 是 ISO 4217 貨幣代碼，兩者都會傳給 Intl.NumberFormat。
const CurrencyContext = createContext({ locale: 'zh-TW', currency: 'TWD' })

export default CurrencyContext
