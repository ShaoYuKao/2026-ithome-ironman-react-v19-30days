import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import QuantityStepper from './QuantityStepper.jsx'
import AddToCartButton from './AddToCartButton.jsx'
import { addItem, selectCartItemById } from '../store/cartSlice.js'

// ProductCard：連接 Redux 的「容器（Container）元件」。跟 QuantityStepper／
// AddToCartButton 這兩個展示型元件不一樣，它知道 Redux store 長什麼樣子，
// 負責把「使用者操作」（調整數量、按下加入購物車）轉成實際的 dispatch。
//
// 這種「展示型元件 + 容器元件」的分工，是讓 UI 元件容易測試的常見作法：
// QuantityStepper／AddToCartButton 可以完全不靠 Redux 就測試互動行為；
// ProductCard 則額外需要一個 <Provider> 包住，用來測試「操作畫面 → store
// 資料正確更新」這件整合行為（見 ProductCard.test.jsx）。
function ProductCard({ product }) {
  const dispatch = useDispatch()
  const cartItem = useSelector(selectCartItemById(product.id))
  const [qty, setQty] = useState(1)

  function handleAdd() {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty,
      }),
    )
  }

  return (
    <li className="product-card">
      <span className="product-card__image" aria-hidden="true">
        {product.image}
      </span>
      <p className="product-card__name">{product.name}</p>
      <p className="product-card__price">NT$ {product.price.toLocaleString()}</p>
      <p className="product-card__stock">庫存：{product.stock} 件</p>

      <QuantityStepper qty={qty} min={1} max={Math.max(product.stock, 1)} onChange={setQty} />

      <AddToCartButton
        disabled={product.stock === 0}
        inCart={Boolean(cartItem)}
        onAdd={handleAdd}
      />
    </li>
  )
}

export default ProductCard
