import { useEffect } from 'react'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import ProductCard from '../components/ProductCard.jsx'
import ProductListSkeleton from '../components/ProductListSkeleton.jsx'
import ErrorRetryPanel from '../components/ErrorRetryPanel.jsx'
import { fetchProducts, selectProductItems, selectProductsError, selectProductsStatus } from '../store/productsSlice.js'

// HomePage：入口首頁，展示精選商品（取前 4 筆）。
//
// 這裡也會 dispatch(fetchProducts())，跟 ProductListPage 一模一樣——因為
// productsSlice 的 condition 已經處理好去重（見 productsSlice.js），
// 不管使用者先進首頁還是先進商品列表頁，商品資料永遠只會真的抓取一次。
function HomePage() {
  const dispatch = useDispatch()
  const items = useSelector(selectProductItems)
  const status = useSelector(selectProductsStatus)
  const error = useSelector(selectProductsError)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const featured = items.slice(0, 4)

  return (
    <div className="page-inner">
      <section className="hero-card">
        <p className="eyebrow">Day 28 · 週複習與小專案</p>
        <h1>多頁面電商購物車 App</h1>
        <p className="subtitle">
          整合本週學到的 React Router 路由導覽與 Redux Toolkit 全域狀態管理，
          打造一個具備商品瀏覽、購物車、登入與結帳流程的完整購物網站 Demo。
        </p>
        <div className="hero-actions">
          <Link to="/products" className="primary-btn">
            🛍️ 開始逛商品
          </Link>
          <Link to="/cart" className="secondary-btn">
            🛒 查看購物車
          </Link>
        </div>
      </section>

      <section>
        <h2>精選商品</h2>
        {status === 'loading' && <ProductListSkeleton count={4} />}
        {status === 'failed' && <ErrorRetryPanel message={error} onRetry={() => dispatch(fetchProducts())} />}
        {status === 'succeeded' && (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
