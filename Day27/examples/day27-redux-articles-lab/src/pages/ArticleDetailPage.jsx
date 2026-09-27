import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchArticleById,
  selectArticleItems,
  selectCurrentArticle,
  selectCurrentArticleError,
  selectCurrentArticleId,
  selectCurrentArticleStatus,
} from '../store/articlesSlice.js'
import { CATEGORY_LABELS } from '../utils/articlesApi.js'
import ErrorRetryPanel from '../components/ErrorRetryPanel.jsx'

// ArticleDetailPage："/articles/:articleId"，對應 Day20 的 ArticleDetailPanel，
// 這次改成獨立的路由頁面，並用 fetchArticleById 讀取 Redux store。
//
// 重點延續 Day23 學過的觀念：從 "/articles/1" 換到 "/articles/2"，React Router
// 比對到的是同一筆路由設定，只是 articleId 參數改變，並不會把這個元件重新掛載，
// 所以一定要把 articleId 放進 effect 的依賴陣列，換文章時才會重新 dispatch。
//
// 今天新增的重點：dispatch(fetchArticleById(id)) 回傳的 promise 帶有
// abort() 方法，在 effect 的 cleanup 呼叫它，就能取消「使用者已經切到
// 下一篇」的舊請求——效果等同 Day20 手動建立的 AbortController，
// 但不需要自己 new 一個，thunkAPI.signal 已經接手處理。
function ArticleDetailPage() {
  const { articleId } = useParams()
  const numericId = Number(articleId)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // retryToken：跟 ArticlesPage 一樣的手法，讓「重試」按鈕可以重新觸發
  // 下面的 effect（連帶讓 cleanup 的 abort() 也套用在正確的請求上）。
  const [retryToken, setRetryToken] = useState(0)

  const items = useSelector(selectArticleItems)
  const currentArticleId = useSelector(selectCurrentArticleId)
  const article = useSelector(selectCurrentArticle)
  const status = useSelector(selectCurrentArticleStatus)
  const error = useSelector(selectCurrentArticleError)

  useEffect(() => {
    const promise = dispatch(fetchArticleById(numericId))
    return () => {
      promise.abort()
    }
  }, [numericId, retryToken, dispatch])

  // 只要「目前這次 URL 對應的 id」跟「store 記錄的 currentArticleId」對不上，
  // 就代表畫面還沒收到這一篇文章的結果，應該顯示 loading，而不是上一篇文章的內容。
  const isLoading = status === 'loading' || currentArticleId !== numericId

  // 上一篇／下一篇：直接在「目前 store 裡的文章列表」中找位置。這份 items
  // 是使用者上一次在首頁／文章列表頁看到的資料，如果還沒去過那兩個頁面，
  // items 會是空的，上一篇／下一篇就無法使用——這正是「共用同一份資料」
  // 的另一面：共用的是同一份，不是各自獨立複製一份。
  const currentIndex = items.findIndex((item) => item.id === numericId)
  const prevArticle = currentIndex > 0 ? items[currentIndex - 1] : null
  const nextArticle = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null

  function handleRetry() {
    setRetryToken((token) => token + 1)
  }

  return (
    <div className="page-inner">
      <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>
        ← 返回上一頁
      </button>

      <section className="card article-detail">
        {isLoading && (
          <div className="article-detail-skeleton" aria-busy="true" aria-live="polite">
            <div className="skeleton-block skeleton-block--badge" />
            <div className="skeleton-block skeleton-block--line skeleton-block--w80" />
            <div className="skeleton-block skeleton-block--paragraph" />
            <div className="skeleton-block skeleton-block--paragraph" />
          </div>
        )}

        {!isLoading && error && <ErrorRetryPanel message={error} onRetry={handleRetry} />}

        {!isLoading && !error && article && (
          <article>
            <span className={`badge badge--${article.category}`}>{CATEGORY_LABELS[article.category]}</span>
            <h1>{article.title}</h1>
            <p className="article-detail__meta">
              ✍️ {article.author}・{article.publishedAt}・🕒 {article.readMinutes} 分鐘閱讀
            </p>
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="article-detail__paragraph">
                {paragraph}
              </p>
            ))}
            <p className="article-detail__fetched-at">
              上次讀取時間：{new Date(article.fetchedAt).toLocaleTimeString('zh-TW', { hour12: false })}
            </p>
          </article>
        )}

        <div className="article-detail__nav">
          <button type="button" className="secondary-btn" disabled={!prevArticle} onClick={() => navigate(`/articles/${prevArticle.id}`)}>
            ← 上一篇
          </button>
          <button type="button" className="secondary-btn" disabled={!nextArticle} onClick={() => navigate(`/articles/${nextArticle.id}`)}>
            下一篇 →
          </button>
        </div>
        {currentIndex === -1 && (
          <p className="form-hint">
            上一篇／下一篇需要先讀取過文章列表才能使用，可以先回<Link to="/articles">文章列表</Link>逛逛。
          </p>
        )}
      </section>
    </div>
  )
}

export default ArticleDetailPage
