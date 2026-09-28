import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../store/cartSlice.js'
import {
  fetchProducts,
  selectProductById,
  selectProductsError,
  selectProductsStatus,
} from '../store/productsSlice.js'
import { CATEGORY_LABELS } from '../utils/productsApi.js'
import ErrorRetryPanel from '../components/ErrorRetryPanel.jsx'

// ProductDetailPage：用 useParams（Day23 教過的 Hook）取出網址上的
// :productId，直接從 productsSlice 已經載入的 items 裡用 id 查找
// （見 selectProductById）。
//
// 如果使用者是「直接貼網址進來」（例如重新整理、分享連結），這時候
// productsSlice 可能還是 idle／沒有資料，所以一樣要 dispatch(fetchProducts())
// 當作保險：已經抓過的話，condition 會自動跳過，不會重複打 API。
function ProductDetailPage() {
  const { productId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const product = useSelector(selectProductById(productId))
  const status = useSelector(selectProductsStatus)
  const error = useSelector(selectProductsError)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  if (status === 'loading' && !product) {
    return <p className="empty-state">商品資料載入中…</p>
  }

  if (status === 'failed' && !product) {
    return <ErrorRetryPanel message={error} onRetry={() => dispatch(fetchProducts())} />
  }

  if (!product) {
    return (
      <div className="empty-state">
        <p>找不到這件商品，可能已經下架。</p>
        <Link to="/products" className="secondary-btn">
          回商品列表
        </Link>
      </div>
    )
  }

  function handleChangeQty(nextQty) {
    const clamped = Math.min(Math.max(nextQty, 1), product.stock)
    setQty(clamped)
  }

  function handleAddToCart() {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty,
      }),
    )
    navigate('/cart')
  }

  return (
    <div className="page-inner product-detail">
      <Link to="/products" className="back-link">
        ← 回商品列表
      </Link>

      <div className="product-detail__layout">
        <div className="product-detail__image" aria-hidden="true">
          {product.image}
        </div>

        <div className="product-detail__info">
          <p className="badge">{CATEGORY_LABELS[product.category] ?? product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">NT$ {product.price.toLocaleString()}</p>
          <p className="product-detail__desc">{product.description}</p>
          <p className="product-detail__stock">庫存：{product.stock} 件</p>

          <div className="qty-stepper">
            <button type="button" onClick={() => handleChangeQty(qty - 1)} disabled={qty <= 1} aria-label="減少數量">
              −
            </button>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(event) => handleChangeQty(Number(event.target.value) || 1)}
              aria-label="購買數量"
            />
            <button
              type="button"
              onClick={() => handleChangeQty(qty + 1)}
              disabled={qty >= product.stock}
              aria-label="增加數量"
            >
              +
            </button>
          </div>

          <button type="button" className="primary-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
            {product.stock === 0 ? '已售完' : '🛒 加入購物車'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
