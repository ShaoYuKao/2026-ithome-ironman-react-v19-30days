import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchArticles,
  selectArticleItems,
  selectArticlesError,
  selectArticlesStatus,
} from '../store/articlesSlice.js'
import { ARTICLE_CATEGORIES } from '../utils/articlesApi.js'
import ArticleCard from '../components/ArticleCard.jsx'
import ArticleListSkeleton from '../components/ArticleListSkeleton.jsx'
import ErrorRetryPanel from '../components/ErrorRetryPanel.jsx'

// ArticlesPage："/articles"，對應 Day20 的 ArticleListPage，但資料來源
// 從「元件自己的 useFetch」換成「Redux store 的 articlesSlice」。
//
// 三個操作分別驗證今天學到的重點：
// 1. 切換分類：category 改變 → 重新 dispatch(fetchArticles(...))，
//    若這個分類還沒抓過（或不是最近一次成功的分類），articlesSlice 會真的送出請求。
// 2. 勾選「模擬 API 失敗」：一樣會改變 dispatch 的參數，這次 condition 允許
//    請求送出，後端固定回傳 500，畫面顯示 ErrorRetryPanel。
// 3. 快速切換分類：每次 dispatch 都會拿到一個帶有 abort() 的 promise，
//    exact 對照 Day20 的 AbortController；effect 的 cleanup 呼叫 promise.abort()，
//    取消「使用者已經不想看」的舊請求，避免畫面被過期資料覆蓋。
function ArticlesPage() {
  const [category, setCategory] = useState('all')
  const [simulateError, setSimulateError] = useState(false)
  // retryToken 沿用 Day20 useFetch.js 的手法：只用來讓下面的 effect 重新
  // 執行一次，數值本身沒有意義——這是「重試」按鈕的實作關鍵。
  const [retryToken, setRetryToken] = useState(0)

  const dispatch = useDispatch()
  const items = useSelector(selectArticleItems)
  const status = useSelector(selectArticlesStatus)
  const error = useSelector(selectArticlesError)

  useEffect(() => {
    const promise = dispatch(fetchArticles({ category, simulateError }))
    return () => {
      promise.abort()
    }
  }, [category, simulateError, retryToken, dispatch])

  function handleRetry() {
    setRetryToken((token) => token + 1)
  }

  const isLoading = status === 'loading'

  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Day 27</p>
        <h1>文章列表</h1>
        <p className="subtitle">
          透過 <code>dispatch(fetchArticles(...))</code> 呼叫 <code>GET /api/articles</code>
          。切換分類或勾選「模擬 API 失敗」都會重新 dispatch；如果分類跟上次成功的結果
          相同，articlesSlice 的 <code>condition</code> 會直接跳過，不會重複打 API。
        </p>
      </header>

      <section className="card">
        <div className="demo-actions">
          <label className="field-label">
            分類：
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {ARTICLE_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(event) => setSimulateError(event.target.checked)}
            />
            🧪 模擬 API 失敗（測試錯誤重試按鈕）
          </label>
        </div>

        {isLoading && <ArticleListSkeleton count={4} />}

        {!isLoading && error && <ErrorRetryPanel message={error} onRetry={handleRetry} />}

        {!isLoading && !error && items.length === 0 && <p className="empty-state">這個分類目前沒有文章。</p>}

        {!isLoading && !error && items.length > 0 && (
          <ul className="article-list">
            {items.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} to={`/articles/${article.id}`} />
              </li>
            ))}
          </ul>
        )}

        <Link to="/articles/999" className="form-hint">
          🧪 檢視不存在的文章（示範 404 錯誤畫面）
        </Link>
      </section>
    </div>
  )
}

export default ArticlesPage
