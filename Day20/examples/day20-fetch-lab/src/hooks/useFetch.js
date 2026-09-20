import { useEffect, useState } from 'react'

/**
 * 統一管理「打 API」的 loading／error／success 三態，並且：
 * - 一定用 AbortController 取消「已經不需要的」請求（url 換了、元件卸載）。
 * - 提供 refetch()，讓呼叫端可以在 url 不變的情況下，重新發出同一個請求
 *   （例如「重試」按鈕）。
 *
 * 對照 Day08 手動寫過的版本：這裡多做了兩件事——
 * 1. 用 AbortController 真的「取消」上一個還沒完成的請求（Day08 的
 *    isCancelled 旗標只是「不理會」結果，並沒有真的讓網路請求停止）。
 * 2. 用 response.ok 判斷 HTTP 狀態碼，把 4xx / 5xx 轉換成真正會被
 *    catch 到的 Error，而不是誤判為「成功」。
 *
 * 實作細節——為什麼 isLoading 是「算出來的」，而不是自己另外一個 state：
 * 最直覺的寫法，是在 effect 一開始就同步呼叫一次
 * `setState({ isLoading: true, ... })` 重設成「載入中」，React 官方文件
 * 與 oxlint 的 `react/set-state-in-effect` 規則都建議避免這種寫法——
 * 每次 url 改變都會多觸發一次「用不到的中間渲染」。這裡改用
 * `requestKey`（把 url 跟 retryToken 合成一組「這次請求的身分識別」）
 * 搭配 `result.key` 互相比對：只要兩者不一致，就代表「畫面現在看到的
 * 請求還沒有結果」，直接在渲染時推導出 isLoading，effect 內完全不需要
 * 額外呼叫 setState 去「宣告」現在是載入中。
 *
 * @param {string | null | false} url 要請求的網址；傳入 null / '' / false
 *   會讓這個 Hook 直接跳過請求（例如「使用者還沒選擇任何項目」的情境）。
 */
export function useFetch(url) {
  // 只用來「觸發重新請求」的計數器，數值本身沒有意義，改變它就會讓下面
  // 的 effect 重新執行一次——這是 refetch() 的實作關鍵。
  const [retryToken, setRetryToken] = useState(0)
  // 把 url 與 retryToken 合成一組「這次請求的身分識別」：url 改變、或呼叫
  // refetch() 讓 retryToken 改變，都會產生一組全新的 requestKey。
  const requestKey = url ? `${url}::${retryToken}` : null

  // result 只在「請求真正有結果」時才更新（成功或失敗），並記錄這個結果
  // 屬於哪一個 requestKey，讓下面可以推導目前是否仍在等待中。
  const [result, setResult] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    // requestKey 是 null：代表呼叫端目前不需要任何資料，不發出任何請求
    // （見本日範例的 ArticleDetailPanel：尚未選擇文章時）。
    if (!requestKey) return

    const controller = new AbortController()
    // AbortController 只能保證「還在等待中」的請求被取消；如果 abort()
    // 呼叫時網路回應其實已經完整抵達，abort 對已經 resolve 的 Promise
    // 沒有作用。isActive 這個旗標（延續 Day08 用過的 isCancelled 概念）
    // 就是用來擋住這種「取消已經來不及、但畫面已經不該再更新」的邊界情況。
    let isActive = true

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          // fetch 對 4xx / 5xx 一律視為「成功送達」，不會自動 reject，
          // 必須自己檢查 response.ok，並手動 throw 出有意義的錯誤，
          // 這個錯誤才會被下面的 .catch() 接住。
          const body = await response.json().catch(() => ({}))
          throw new Error(body.message || `請求失敗（HTTP ${response.status}）`)
        }
        return response.json()
      })
      .then((data) => {
        if (isActive) {
          setResult({ key: requestKey, data, error: null })
        }
      })
      .catch((error) => {
        // AbortError：代表這個請求是被我們自己取消的（url 換了、元件卸載
        // 了），不是真正的錯誤，不該顯示在畫面上。
        if (error.name === 'AbortError') return
        if (isActive) {
          setResult({ key: requestKey, data: null, error: error.message })
        }
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestKey, url])

  // 只要「目前這次請求的 key」跟「result 記錄的 key」對不上，就代表還在
  // 等待中（包含 url 剛換掉、或按下 refetch() 之後，結果都還沒回來）。
  const isLoading = Boolean(requestKey) && result.key !== requestKey

  function refetch() {
    setRetryToken((token) => token + 1)
  }

  return {
    data: !requestKey || isLoading ? null : result.data,
    error: !requestKey || isLoading ? null : result.error,
    isLoading,
    refetch,
  }
}
