import { useEffect } from 'react'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchArticles,
  selectArticleItems,
  selectArticlesError,
  selectArticlesStatus,
} from '../store/articlesSlice.js'
import ErrorRetryPanel from '../components/ErrorRetryPanel.jsx'

// HomePage："/"，同時也是整個 App 最常見的進入點，所以由這裡負責第一次
// dispatch(fetchArticles(...))，把「全部分類」的文章資料存進 store。
//
// 之後不管使用者接下來去 ArticlesPage 還是 ArticleDetailPage，只要分類
// 沒變、資料已經抓成功，articlesSlice.js 裡的 condition 就會擋掉重複的請求——
// 這裡完全不需要為此多寫任何程式碼，好處在 slice 那一層就處理好了。
function HomePage() {
  const dispatch = useDispatch()
  const items = useSelector(selectArticleItems)
  const status = useSelector(selectArticlesStatus)
  const error = useSelector(selectArticlesError)

  useEffect(() => {
    const promise = dispatch(fetchArticles({ category: 'all', simulateError: false }))
    // 就算這裡的參數固定不變，也養成「effect 觸發的 dispatch，一律在
    // cleanup 呼叫 abort()」的習慣：開發模式下 StrictMode 會讓這個
    // effect 執行兩次，靠 abort() 讓第一次沒必要的請求被取消掉。
    return () => {
      promise.abort()
    }
  }, [dispatch])

  const featured = items.slice(0, 3)

  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Day 27 練習</p>
        <h1>Redux Toolkit 實戰（二）：非同步處理</h1>
        <p className="subtitle">
          把 Day20 的文章列表改用 <code>articlesSlice</code> + <code>createAsyncThunk</code> 管理，
          並在首頁、文章列表、文章詳情三個頁面之間共用同一份 Redux store 資料。
        </p>
      </header>

      <section className="card">
        <h2>📰 熱門文章</h2>
        <p className="card-desc">
          下面 3 篇文章直接從 Redux store 讀取——如果你等一下先去「文章列表」頁逛過，
          再回到首頁，這裡不會重新出現載入中的畫面，因為資料已經在 store 裡了。
        </p>

        {status === 'loading' && items.length === 0 && <p className="empty-state">文章載入中…</p>}

        {status === 'failed' && items.length === 0 && (
          <ErrorRetryPanel
            message={error}
            onRetry={() => dispatch(fetchArticles({ category: 'all', simulateError: false }))}
          />
        )}

        {featured.length > 0 && (
          <ul className="article-list">
            {featured.map((article) => (
              <li key={article.id} className="article-card article-card--compact">
                <h3>
                  <Link to={`/articles/${article.id}`}>{article.title}</Link>
                </h3>
                <p className="article-card__excerpt">{article.excerpt}</p>
              </li>
            ))}
          </ul>
        )}

        <Link to="/articles" className="secondary-btn">
          查看完整文章列表 →
        </Link>
      </section>
    </div>
  )
}

export default HomePage
