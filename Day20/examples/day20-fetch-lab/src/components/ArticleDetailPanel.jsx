import { useFetch } from '../hooks/useFetch.js'
import { buildArticleDetailUrl, CATEGORY_LABELS } from '../utils/articlesApi.js'
import ErrorRetryPanel from './ErrorRetryPanel.jsx'

const FAKE_ARTICLE_ID = 999

/**
 * Demo 2：文章詳情面板——第二次重複使用 useFetch，證明它不是只能為
 * 文章列表量身打造，而是任何「打 API 換三態」的情境都能直接套用。
 *
 * 額外驗證兩件事：
 * 1. Race Condition：快速點選不同文章時，useFetch 內部的 AbortController
 *    會取消上一篇文章「還沒回來」的請求，畫面最終只會顯示「最後一次點選」
 *    的文章，不會被較慢的舊請求覆蓋、也不會閃爍過期的內容。
 * 2. 404 也是錯誤：點選「檢視不存在的文章」會請求一個真的不存在的 ID，
 *    後端回傳 404，一樣會被 useFetch 轉換成 error 狀態，顯示同一套
 *    ErrorRetryPanel——證明 useFetch 的錯誤處理不只針對「模擬的 500」，
 *    任何非 2xx 的 HTTP 狀態碼都適用同一套邏輯。
 */
function ArticleDetailPanel({ articleId, onSelectArticle }) {
  const url = articleId ? buildArticleDetailUrl(articleId) : null
  const { data, error, isLoading, refetch } = useFetch(url)

  if (!articleId) {
    return (
      <section className="demo-card article-detail article-detail--empty">
        <h2>📄 文章詳情</h2>
        <p className="demo-desc">從左側清單點選任一篇文章的「查看詳情」，這裡會即時載入完整內容。</p>
        <button type="button" className="btn" onClick={() => onSelectArticle(FAKE_ARTICLE_ID)}>
          🧪 檢視不存在的文章（示範 404 錯誤畫面）
        </button>
      </section>
    )
  }

  return (
    <section className="demo-card article-detail">
      <h2>📄 文章詳情</h2>

      {isLoading && (
        <div className="article-detail-skeleton" aria-busy="true" aria-live="polite">
          <div className="skeleton-block skeleton-block--badge" />
          <div className="skeleton-block skeleton-block--line skeleton-block--w80" />
          <div className="skeleton-block skeleton-block--paragraph" />
          <div className="skeleton-block skeleton-block--paragraph" />
        </div>
      )}

      {!isLoading && error && <ErrorRetryPanel message={error} onRetry={refetch} />}

      {!isLoading && !error && data && (
        <article>
          <span className={`badge badge--${data.category}`}>{CATEGORY_LABELS[data.category]}</span>
          <h3>{data.title}</h3>
          <p className="article-detail__meta">
            ✍️ {data.author}・{data.publishedAt}・🕒 {data.readMinutes} 分鐘閱讀
          </p>
          {data.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="article-detail__paragraph">
              {paragraph}
            </p>
          ))}
          <p className="article-detail__fetched-at">
            上次讀取時間：{new Date(data.fetchedAt).toLocaleTimeString('zh-TW', { hour12: false })}
          </p>
        </article>
      )}
    </section>
  )
}

export default ArticleDetailPanel
