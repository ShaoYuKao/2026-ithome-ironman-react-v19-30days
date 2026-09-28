/**
 * 共用的「錯誤訊息 + 重試按鈕」元件，對照 Day27 的 ErrorRetryPanel，
 * 商品列表頁、商品詳情頁都會用到。
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
