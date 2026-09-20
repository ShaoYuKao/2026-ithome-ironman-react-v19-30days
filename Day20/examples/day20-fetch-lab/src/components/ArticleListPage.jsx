import { useState } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import { ARTICLE_CATEGORIES, buildArticlesUrl } from '../utils/articlesApi.js'
import ArticleCard from './ArticleCard.jsx'
import ArticleListSkeleton from './ArticleListSkeleton.jsx'
import ErrorRetryPanel from './ErrorRetryPanel.jsx'

/**
 * Demo 1：文章列表頁——今天練習的主要成果。
 *
 * 三個操作分別驗證今天學到的重點：
 * 1. 切換分類：category 改變 → buildArticlesUrl 組出不同的 url →
 *    useFetch 偵測到 url 改變，自動重新請求（並自動取消前一個分類還沒
 *    回來的請求）。
 * 2. 勾選「模擬 API 失敗」：一樣是透過改變 url（多了 ?simulateError=true）
 *    觸發重新請求，這次後端固定回傳 500，畫面顯示 ErrorRetryPanel。
 * 3. 按下「重試」：url 不變，呼叫 useFetch 回傳的 refetch()，重新發出
 *    同一個請求——如果「模擬 API 失敗」仍勾選，會穩定地再次失敗（預期
 *    行為，用來驗證重試真的有重新發出請求）；取消勾選後再按重試，就會
 *    成功顯示資料。
 */
function ArticleListPage({ selectedId, onSelectArticle }) {
  const [category, setCategory] = useState('all')
  const [simulateError, setSimulateError] = useState(false)

  const url = buildArticlesUrl({ category, simulateError })
  const { data, error, isLoading, refetch } = useFetch(url)

  return (
    <section className="demo-card">
      <h2>📰 文章列表</h2>
      <p className="demo-desc">
        透過 <code>useFetch(url)</code> 呼叫 <code>GET /api/articles</code>
        。資料還沒回來之前顯示骨架卡片；切換分類或勾選「模擬 API
        失敗」都會讓 <code>url</code> 改變，自動重新請求。
      </p>

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

      {!isLoading && error && <ErrorRetryPanel message={error} onRetry={refetch} />}

      {!isLoading && !error && data && data.articles.length === 0 && (
        <p className="empty-state">這個分類目前沒有文章。</p>
      )}

      {!isLoading && !error && data && data.articles.length > 0 && (
        <ul className="article-list">
          {data.articles.map((article) => (
            <li key={article.id}>
              <ArticleCard
                article={article}
                isSelected={article.id === selectedId}
                onSelect={() => onSelectArticle(article.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ArticleListPage
