import { useSelector } from 'react-redux'
import { selectCartTotalCount, selectCartTotalPrice } from '../store/cartSlice.js'

// CartSummary：另一種容器元件——只從 store「讀」資料，不 dispatch 任何
// action。測試這種元件時不需要模擬使用者操作，只要準備好 preloadedState、
// 確認畫面渲染出正確的文字即可（見 README 的延伸練習）。
function CartSummary() {
  const totalCount = useSelector(selectCartTotalCount)
  const totalPrice = useSelector(selectCartTotalPrice)

  return (
    <p className="cart-summary">
      🛒 購物車：{totalCount} 件，小計 NT$ {totalPrice.toLocaleString()}
    </p>
  )
}

export default CartSummary
