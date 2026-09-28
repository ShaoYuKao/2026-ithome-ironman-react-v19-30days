import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import ProductCard from '../components/ProductCard.jsx'
import ProductListSkeleton from '../components/ProductListSkeleton.jsx'
import ErrorRetryPanel from '../components/ErrorRetryPanel.jsx'
import { PRODUCT_CATEGORIES } from '../utils/productsApi.js'
import { fetchProducts, selectProductItems, selectProductsError, selectProductsStatus } from '../store/productsSlice.js'

// ProductListPage：商品列表頁，用 useSearchParams（Day23 教過的 Hook）
// 把「目前選擇的分類」放進網址查詢字串 ?category=xxx，分類篩選改用
// Array.filter 在前端處理（見 utils/productsApi.js 開頭的說明）。
function ProductListPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectProductItems)
  const status = useSelector(selectProductsStatus)
  const error = useSelector(selectProductsError)
  const [searchParams, setSearchParams] = useSearchParams()

  // simulateError／retryToken 沿用 Day27 ArticlesPage 的手法：
  // 勾選「模擬 API 失敗」會讓下面的 effect 重新 dispatch 一次
  // fetchProducts({ simulateError: true })；「重試」按鈕不一定會改變
  // simulateError 的值（例如使用者已經取消勾選後才按重試），所以額外用
  // retryToken 確保 effect 一定會重新執行一次。
  const [simulateError, setSimulateError] = useState(false)
  const [retryToken, setRetryToken] = useState(0)

  const category = searchParams.get('category') || 'all'

  useEffect(() => {
    dispatch(fetchProducts({ simulateError }))
  }, [dispatch, simulateError, retryToken])

  const visibleItems = category === 'all' ? items : items.filter((item) => item.category === category)

  function handleCategoryChange(nextCategory) {
    if (nextCategory === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: nextCategory })
    }
  }

  function handleRetry() {
    setRetryToken((token) => token + 1)
  }

  return (
    <div className="page-inner">
      <header className="page-header">
        <h1>商品列表</h1>
        <p className="subtitle">共 {items.length} 件商品，選擇分類即可篩選。</p>
      </header>

      <div className="filter-bar" role="group" aria-label="商品分類篩選">
        {PRODUCT_CATEGORIES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip${category === option.value ? ' chip--active' : ''}`}
            onClick={() => handleCategoryChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={simulateError}
          onChange={(event) => setSimulateError(event.target.checked)}
        />
        🧪 模擬 API 失敗（測試錯誤重試按鈕）
      </label>

      {status === 'loading' && <ProductListSkeleton count={8} />}
      {status === 'failed' && <ErrorRetryPanel message={error} onRetry={handleRetry} />}
      {status === 'succeeded' && visibleItems.length === 0 && <p className="empty-state">這個分類目前沒有商品。</p>}
      {status === 'succeeded' && visibleItems.length > 0 && (
        <div className="product-grid">
          {visibleItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductListPage
