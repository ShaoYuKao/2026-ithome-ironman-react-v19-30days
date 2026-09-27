/**
 * 共用的「錯誤訊息 + 重試按鈕」元件，跟 Day20 相同：
 * ArticlesPage（列表）與 ArticleDetailPage（詳情）都會用到。
 */
function ErrorRetryPanel({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <p>⚠️ {message}</p>
      <button type="button" className="btn" onClick={onRetry}>
        🔁 重試
      </button>
    </div>
  )
}

export default ErrorRetryPanel
