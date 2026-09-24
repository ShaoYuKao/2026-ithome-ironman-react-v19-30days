import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

// ErrorBoundaryPage：掛在 router.jsx 根路由的 errorElement，用來接住
// loader / action 裡「非預期丟出的錯誤」（例如後端整台伺服器打不通、
// 程式本身有 bug），跟 Day22 介紹的「網址對不到路由」404 是兩件不同的事：
// - NotFoundPage（path: '*'）：使用者輸入了一個「路由設定裡本來就沒有」的網址。
// - ErrorBoundaryPage（errorElement）：使用者進入的是「合法」的路由，
//   但這個路由的 loader / action 執行時噴出了例外（不是刻意 redirect）。
//
// useRouteError() 可以讀出剛剛是「誰」丟出了這個錯誤；isRouteErrorResponse()
// 則用來分辨「這是 loader/action 主動 throw 出的 Response（例如刻意寫的
// 4xx/5xx）」還是「一般 JavaScript 例外（例如 fetch 連線失敗）」。
function ErrorBoundaryPage() {
  const error = useRouteError()

  const { title, description } = isRouteErrorResponse(error)
    ? {
        title: `${error.status} ${error.statusText}`,
        description: error.data || '伺服器回應了一筆錯誤。',
      }
    : {
        title: '發生未預期的錯誤',
        description:
          error instanceof Error ? error.message : '請稍後再試一次，或確認後端服務是否正常執行。',
      }

  return (
    <div className="page-inner">
      <div className="not-found">
        <p className="not-found__code">⚠️</p>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
        <p className="subtitle">
          常見原因：<code>server/</code> 的 Express 服務沒有啟動，或是網路暫時中斷。
          確認後端已啟動（<code>npm start</code>）後，可以重新整理頁面再試一次。
        </p>
        <div className="button-row">
          <Link to="/" className="secondary-btn">
            回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundaryPage
