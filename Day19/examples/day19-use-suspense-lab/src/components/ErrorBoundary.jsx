import { Component } from 'react'

/**
 * use(promise) 如果讀到「rejected」的 Promise，等同於在渲染期間丟出例外，
 * 會一路往上尋找「最近的 Error Boundary」來顯示錯誤畫面——這點跟一般同步
 * 程式拋出例外的處理方式完全一樣（詳見 README 第三節第 3 小節）。
 *
 * React 本身沒有內建 Error Boundary 元件，官方文件也是建議自己刻一個（或
 * 使用 react-error-boundary 套件），這裡用最基本的 class component 寫法
 * 實作，只依賴 getDerivedStateFromError；並額外提供一個 retry() 方法，讓
 * 使用端可以在「使用者主動要求重試」時，清空內部記住的錯誤狀態。
 *
 * 用法：<ErrorBoundary fallback={(error, retry) => (...)}>{children}</ErrorBoundary>
 */
class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    // 開發時方便在 Console 追蹤完整錯誤，正式環境通常會改成回報到監控服務。
    console.error('[ErrorBoundary] 攔截到子元件拋出的錯誤：', error)
  }

  retry = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (error) {
      return this.props.fallback(error, this.retry)
    }
    return this.props.children
  }
}

export default ErrorBoundary
