/**
 * 共用的「錯誤訊息 + 重試按鈕」元件。
 * ArticleListPage（列表）與 ArticleDetailPanel（詳情）都會用到，
 * 證明「同一套錯誤處理 UI」也可以像 useFetch 一樣被重複使用。
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
