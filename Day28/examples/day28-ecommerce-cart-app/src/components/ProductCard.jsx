import { Link } from 'react-router'
import { CATEGORY_LABELS } from '../utils/productsApi.js'

/**
 * 商品卡片：首頁「精選商品」與商品列表頁共用同一張卡片，
 * 只靠 <Link> 導向商品詳情頁，不在卡片上直接加入購物車
 * （加入購物車前，先讓使用者在詳情頁選擇數量，見 ProductDetailPage）。
 */
function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card link-card">
      <div className="product-card__image" aria-hidden="true">
        {product.image}
      </div>
      <p className="badge">{CATEGORY_LABELS[product.category] ?? product.category}</p>
      <p className="product-card__name">{product.name}</p>
      <p className="product-card__price">NT$ {product.price.toLocaleString()}</p>
    </Link>
  )
}

export default ProductCard
