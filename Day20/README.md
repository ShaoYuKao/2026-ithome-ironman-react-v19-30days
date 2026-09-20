# Day 20｜資料請求與非同步處理實戰

- 今日範例程式碼：[`Day20\examples\day20-fetch-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day20/examples/day20-fetch-lab)

## 一、`fetch` 的基本用法與兩個容易忽略的細節

`fetch` 是瀏覽器內建的網路請求 API，最基本的用法是這樣：

```js
fetch('/api/articles')
  .then((response) => response.json())
  .then((data) => console.log(data))
```

看起來很單純，但新手最常在這兩個地方踩雷：

### 1. `fetch` 對 4xx／5xx 狀態碼不會自動 reject

`fetch` 回傳的 Promise，只有在**網路層級真的失敗**時才會 reject（例如斷線、DNS 找不到、請求被 `AbortController` 取消）。只要伺服器有回應——就算是 `404 Not Found` 或 `500 Internal Server Error`——`fetch` 都視為「請求成功送達」，Promise 一樣會 resolve！

```js
const response = await fetch('/api/articles/999') // 假設這個 ID 不存在
console.log(response.ok) // false
console.log(response.status) // 404
// 但 fetch 本身完全不會 reject，也不會被 try/catch 抓到
```

所以每一次 `fetch` 之後，都必須自己檢查 `response.ok`（等同 `status` 介於 200～299），不是的話手動 `throw` 一個有意義的 `Error`：

```js
const response = await fetch(url)
if (!response.ok) {
  throw new Error(`請求失敗（HTTP ${response.status}）`)
}
const data = await response.json()
```

### 2. `response.json()` 本身也是非同步的

`response.json()` 會回傳另一個 Promise（負責把 HTTP Body 的文字內容解析成 JavaScript 物件），常見的錯誤是忘記 `await`／`.then()`，直接把還沒解析完成的 Promise 物件當成資料使用。正確寫法一定要多一個步驟：

```js
const response = await fetch(url)
const data = await response.json() // 這一步不能省略
```

## 二、Loading／Error／Success 三態管理：從 Day08 的手動寫法談起

Day08 學過，呼叫 API 這類副作用要放進 `useEffect`，而且要處理「元件卸載後就不該再 `setState`」的問題：

```jsx
function ArticleList() {
  const [articles, setArticles] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false // Day08 學過的旗標：卸載後忽略這次的結果

    setIsLoading(true)
    setError(null)

    fetch('/api/articles')
      .then((response) => {
        if (!response.ok) throw new Error('取得文章列表失敗')
        return response.json()
      })
      .then((data) => {
        if (!isCancelled) {
          setArticles(data.articles)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message)
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  if (isLoading) return <p>載入中...</p>
  if (error) return <p>發生錯誤：{error}</p>
  return <ul>{articles.map((article) => <li key={article.id}>{article.title}</li>)}</ul>
}
```

這段程式碼已經具備三態管理的雛形：`isLoading`、`error`、實際資料各自一個 state，三個 `if`／回傳分支各自負責一種畫面。今天要在這個基礎上，補齊兩件 Day08 當時刻意留白的事情：

1. **`isCancelled` 只能「假裝沒看到」結果，沒辦法讓網路請求真的停止**——請求還是會完整跑完，只是回來之後被忽略。
2. **沒有「重試」機制**——目前只有「掛載時打一次」與「依賴改變時重新打」，沒有「使用者主動要求重打一次同樣的請求」這個操作。

## 三、Race Condition 與 `AbortController`：真正取消請求

### 1. 什麼是資料請求情境下的 Race Condition（競態條件）？

假設文章詳情面板正在讀取「文章 A」，使用者還沒等內容出現，就手滑點到「文章 B」。這時候畫面上會**同時存在兩個尚未完成的請求**：文章 A 的請求、文章 B 的請求。如果文章 A 的伺服器剛好比較忙（回應比較慢），有可能發生：

```
使用者點文章 A => 送出請求 A（伺服器處理中…）
使用者立刻改點文章 B => 送出請求 B（伺服器處理中…）
請求 B 先回來 => 畫面顯示文章 B 的內容 ✅
請求 A 才姍姍來遲 => 如果沒有妥善處理，畫面會被「舊的」文章 A 內容蓋過去 ❌
```

這種「後送出的請求先完成、先送出的請求後完成，導致畫面被過期資料覆蓋」的現象，就是 Race Condition（競態條件）。Day08 的 `isCancelled` 旗標其實已經能避免這個問題——因為每一次 effect 重新執行，都會產生一份全新的、只屬於「這一次請求」的 `isCancelled` 變數，舊的那一次請求即使晚回來，也會發現自己的 `isCancelled` 早就被清除函式標記為 `true`，因而放棄更新畫面。

那 `AbortController` 補的是什麼？**效率與資源**：`isCancelled` 只是「假裝沒看到」結果，請求 A 該花的網路頻寬、伺服器運算資源，一點都沒少花；`AbortController` 則是讓瀏覽器真的把「已經用不到」的請求中止掉——在瀏覽器的 Network 面板可以直接看到那筆請求的狀態變成 `canceled`，伺服器也不需要浪費資源把回應內容送完。範例可以看到請求數量越多（例如很快地連續切換好幾篇文章），這個差異就越明顯。

### 2. 基本用法

```js
useEffect(() => {
  const controller = new AbortController()

  fetch(url, { signal: controller.signal }) // 把 signal 交給 fetch
    .then((response) => response.json())
    .then((data) => setData(data))
    .catch((error) => {
      if (error.name === 'AbortError') return // 自己取消的，不是真正的錯誤
      setError(error.message)
    })

  return () => {
    controller.abort() // 清除函式呼叫時，取消這次還沒完成的請求
  }
}, [url])
```

- `controller.signal` 傳給 `fetch` 的第二個參數，`fetch` 內部會持續監聽這個 `signal`。
- 呼叫 `controller.abort()` 之後，如果請求還在進行中，`fetch` 回傳的 Promise 會 reject，而且 `error.name` 會是 `'AbortError'`——這是「使用者/程式主動取消」的正常訊號，**不該**被當成真正的錯誤顯示給使用者看，所以 `catch` 裡第一件事永遠是判斷並提早 `return`。

### 3. `AbortController` 之後，還需要 `isActive` 旗標嗎？

需要，而且是「防禦性」的最後一道防線：`abort()` 只能取消「還在等待中」的請求。如果 `abort()` 被呼叫的當下，網路回應其實已經完整送達（只是還沒進到 `.then()` 裡），這次的中止對這個已經 resolve 的 Promise 是沒有作用的。本日範例的 `useFetch`（第四節）保留了一個 `isActive` 旗標，跟 `controller.abort()` 一起使用，兩者互補：`abort()` 負責「盡量真的取消網路層級的請求」，`isActive` 負責「就算取消得不夠即時，也絕對不讓過期的結果更新到畫面上」。

## 四、把邏輯抽成 `useFetch(url)` 自訂 Hook

延續 Day13 學到的自訂 Hook 慣例（`use` 開頭命名、內部呼叫其他 Hook、可以在多個元件間重複使用），把「三態管理 + `AbortController` + 重試」整包邏輯抽成 `src/hooks/useFetch.js`：

```js
export function useFetch(url) {
  const [retryToken, setRetryToken] = useState(0)
  const requestKey = url ? `${url}::${retryToken}` : null

  const [result, setResult] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    if (!requestKey) return

    const controller = new AbortController()
    let isActive = true

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.message || `請求失敗（HTTP ${response.status}）`)
        }
        return response.json()
      })
      .then((data) => {
        if (isActive) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        if (isActive) setResult({ key: requestKey, data: null, error: error.message })
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestKey, url])

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
```

呼叫端只需要一行就能拿到完整的三態與重試功能：

```jsx
const { data, error, isLoading, refetch } = useFetch('/api/articles')

if (isLoading) return <ArticleListSkeleton />
if (error) return <ErrorRetryPanel message={error} onRetry={refetch} />
return <ArticleList articles={data.articles} />
```

### 1. 為什麼 `isLoading` 是「算出來的」，而不是自己另外開一個 state？

最直覺的寫法，可能是在 effect 一開始就同步呼叫 `setIsLoading(true)` 重設成「載入中」（很接近第二節 Day08 那段程式碼的寫法）。但這樣寫，每次 `url` 改變都會**多觸發一次「用不到的中間渲染」**：先渲染一次「重設為 loading」，effect 才真正開始 `fetch`。

實作邏輯是：把 `url` 與「重試次數」（`retryToken`）合成一組「這次請求的身分識別」`requestKey`；`result` 這個 state **只在請求真正有結果時才更新**（成功或失敗都算），並記錄這個結果屬於哪一個 `requestKey`。這樣一來：

- `requestKey` 剛剛改變（`url` 換了，或呼叫了 `refetch()`）、但 `result.key` 還是舊的 => 兩者對不上 => `isLoading` 是 `true`。
- 請求完成，`.then()`／`.catch()` 把 `result` 更新成 `{ key: requestKey, ... }` => 兩者一致 => `isLoading` 變回 `false`。

整段判斷都發生在**渲染時的計算**，不需要在 effect 裡額外呼叫 `setState` 去「宣告」現在是不是在載入中——這也是 React 官方文件一貫建議的「能用算的就不要用存的」原則的具體實踐。

### 2. `refetch()`：不改變 `url`，也能重新觸發同一個請求

`useEffect` 的依賴陣列是 `[requestKey, url]`，`requestKey` 只要改變就會重新執行 effect。`refetch()` 的實作只有一行：把 `retryToken` 加一。這個數值本身沒有任何意義，純粹是拿來讓 `requestKey` 產生變化，藉此觸發 `useEffect` 重新執行——這就是「使用者按下重試按鈕」的完整實作。

### 3. `url` 傳入 `null`／`''`／`false` 時會發生什麼事？

`requestKey` 會是 `null`，effect 一開始的 `if (!requestKey) return` 會讓這次完全不發送任何請求，`isLoading`／`data`／`error` 也都會回傳「空」的狀態。這是特別為 `ArticleDetailPanel`（第八節 Demo 2）設計的：使用者還沒點選任何一篇文章之前，不應該打任何 API。

## 五、Loading Skeleton（載入骨架）UI 設計

比起單純顯示一行「載入中...」文字，**骨架畫面（Skeleton）** 會先用幾個「長得像最終內容形狀」的灰色色塊佔位，讓使用者提前知道畫面大致的排版，也讓「骨架換成真正內容」那一刻的畫面跳動幅度降到最低：

```jsx
function ArticleListSkeleton({ count = 4 }) {
  return (
    <ul className="article-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="article-card article-card--skeleton">
          <div className="skeleton-block skeleton-block--badge" />
          <div className="skeleton-block skeleton-block--line skeleton-block--w80" />
          {/* ...更多色塊 */}
        </li>
      ))}
    </ul>
  )
}
```

兩個實作細節值得留意：

- **`aria-busy="true"` 與 `aria-live="polite"`**：告訴螢幕閱讀器這個區塊目前處於載入中的狀態，內容更新時會用「不打斷使用者目前操作」的方式播報，這是無障礙（Accessibility）設計的基本禮貌。
- **色塊數量抓一個大概值即可**（本日範例預設 4 張），不需要跟實際資料筆數一致——骨架的目的是「預告排版」，不是「精準預測」。

CSS 用 `linear-gradient` + `background-position` 動畫做出常見的「呼吸／掃光」效果（`@keyframes skeleton-pulse`），比純灰色的靜態方塊更能讓使用者感覺到「系統正在運作中」，而不是畫面卡住了。

## 六、錯誤畫面與重試（Retry）UI 設計

錯誤畫面統一交給一個共用元件 `ErrorRetryPanel` 負責，列表與詳情兩個 Demo 都直接重複使用：

```jsx
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
```

- **`role="alert"`**：告訴輔助技術「這是需要立即注意的重要訊息」，會被主動播報，不需要使用者自己去找。
- **`message` 直接來自 `useFetch` 回傳的 `error`**：不管是「模擬的 500 錯誤」還是「真正的 404 找不到」，只要是 `throw` 出來的 `Error`，最終都會顯示在這裡——這正是第一節「手動檢查 `response.ok`」的價值：不用另外寫一套「HTTP 狀態碼對應訊息」的判斷邏輯，錯誤訊息本身就已經是「可以直接顯示給使用者看」的文字。
- **`onRetry` 直接綁定 `useFetch` 回傳的 `refetch`**：按下按鈕呼叫 `refetch()`，`retryToken` 加一，`useFetch` 重新發出「跟上一次條件完全相同」的請求。如果失敗的原因還在（例如「模擬 API 失敗」核取方塊還勾著），重試後會**穩定地再次失敗**——這是刻意設計的可預期行為，用來驗證「重試」按鈕真的有重新發送請求，而不是卡住不動。

## 七、小結對照表：手動 `useFetch` vs Day19 的 `use()` + `Suspense`

| | 本日 `useFetch(url)`（手動三態） |  `use(promise)` + `Suspense` |
| --- | --- | --- |
| 元件內部程式碼 | 要解構 `{ data, error, isLoading, refetch }`，自己寫 `if (isLoading) / if (error)` 分支 | 只有一行 `const data = use(promise)`，讀起來像同步程式碼 |
| 「載入中」畫面怎麼決定 | 元件自己在對的位置渲染 `<Skeleton />` | 交給外層 `<Suspense fallback={...}>` 統一決定，可以包住多個元件一起顯示同一個 fallback |
| 「讀取失敗」畫面怎麼決定 | 元件自己渲染 `<ErrorRetryPanel />` | 交給外層最近的 Error Boundary 統一決定 |
| 取消過期請求 | 手動管理 `AbortController` + `isActive` 旗標 | 交由 Promise 快取機制與元件卸載自然處理，開發者較少直接接觸 `AbortController` |
| 重試機制 | 自己實作 `retryToken` 讓 `useEffect` 重新執行 | 呼叫使快取失效的函式（如 Day19 的 `invalidateUser`），改變傳入 `use()` 的 Promise |
| 適合的情境 | 需要精細控制 loading／error 顯示的**位置**與**文字**、或專案還沒升級到支援 `use()` 的 React 版本時 | 想讓多個元件的載入狀態自然同步、不想在每個元件裡重複寫三態判斷時 |

兩者並不是「誰取代誰」的關係，而是**同一個問題的兩種解法**：`useFetch` 這類手動封裝的模式，正是 [TanStack Query](https://tanstack.com/query)、[SWR](https://swr.vercel.app/) 這類「資料請求函式庫」在背後實際做的事情（只是它們還多做了快取、背景重新整理、視窗聚焦時自動刷新等進階功能）。實際專案要上線時，通常會考慮直接採用這類成熟的函式庫；但親手實作過一次 `useFetch`，遇到問題時才更容易看懂這些函式庫「內部到底在做什麼」，除錯也會更有方向。

## 八、今日範例

```
day20-fetch-lab/
├── server/
│   ├── index.js               # Express API：GET /api/articles（列表、分類篩選）、GET /api/articles/:id（詳情）
│   └── package.json           # 後端（Express + cors，port 4020）
├── src/
│   ├── hooks/
│   │   └── useFetch.js        # 今日主角：loading / error / success + AbortController + refetch
│   ├── components/
│   │   ├── ErrorRetryPanel.jsx     # 共用：錯誤訊息 + 重試按鈕
│   │   ├── ArticleListSkeleton.jsx # Demo 1：列表 loading 骨架
│   │   ├── ArticleCard.jsx         # Demo 1：單張文章卡片
│   │   ├── ArticleListPage.jsx     # Demo 1 容器：分類切換、模擬錯誤、串接 useFetch
│   │   ├── ArticleDetailPanel.jsx  # Demo 2：文章詳情（含 404 示範按鈕）
│   │   └── FetchLab.jsx            # 頁面骨架：左右兩欄，共用 selectedId 狀態
│   ├── utils/
│   │   └── articlesApi.js     # buildArticlesUrl／buildArticleDetailUrl／分類標籤
│   └── App.jsx
├── vite.config.js             # /api 開發代理，轉發到 http://localhost:4020
└── package.json                # 前端（Vite + React，port 5173）
```

`server/index.js` 提供的兩支端點，刻意設計了幾個重點：

- **固定延遲**：列表 700ms、詳情 500ms，讓 loading skeleton 有足夠時間被觀察到，不會一閃即逝。
- **列表只回傳摘要欄位**（不含 `content`），完整內容留給「詳情」API 才回傳——這是真實世界 API 常見的設計（列表輕量、詳情才載入完整內容），也是讓 `useFetch` 在兩個不同元件（列表、詳情）都各自被呼叫一次、確實驗證「可重複使用」的原因。
- **`?category=tech|life|design` 篩選**：9 篇文章分成技術／生活／設計三類，各 3 篇，切換分類會讓列表的 `url` 改變。
- **`?simulateError=true`**：兩支端點都支援，讓前端可以用一個核取方塊**穩定地**（而不是隨機地）重現「錯誤畫面 + 重試按鈕」的完整操作流程。
- **詳情 API 的 404**：請求一個不存在的文章 ID 會收到 `404`，證明 `useFetch` 的錯誤處理不只是為了「模擬的 500」而寫，任何非 2xx 的狀態碼都適用同一套邏輯。

`vite.config.js` 把所有 `/api` 開頭的請求代理到 Express 後端，前端程式碼可以統一呼叫相對路徑（例如 `fetch('/api/articles')`），不需要處理跨來源（CORS）問題：

```js
const apiProxy = {
  '/api': { target: 'http://localhost:4020', changeOrigin: true },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
```

### 1. Demo 1：文章列表（`ArticleListPage`）

實際透過瀏覽器操作驗證過的行為：

- **首次載入**：畫面先顯示 4 張骨架卡片，約 700 多毫秒後（實測伺服器回應約落在 900 毫秒出頭，含 Vite proxy 轉發與網路來回時間）換成真正的 9 篇文章列表。
- **切換分類為「技術」**：`url` 改變（多了 `?category=tech`），`useFetch` 偵測到 `requestKey` 改變、自動重新請求，畫面顯示骨架後換成 3 篇技術類文章，每張卡片的分類徽章都正確顯示「技術」。
- **切回「全部」**：`url` 再次改變，重新顯示完整的 9 篇文章。
- **勾選「🧪 模擬 API 失敗」**：`url` 多了 `?simulateError=true`，後端固定回傳 `500`，畫面顯示 `ErrorRetryPanel`，錯誤訊息為「⚠️ 伺服器暫時發生錯誤，請稍後再試（這是勾選「模擬 API 失敗」後的固定結果）」。
- **在仍勾選「模擬 API 失敗」時按下「🔁 重試」**：`url` 不變、只有 `retryToken` 改變，重新發出的請求依然命中 `?simulateError=true`，因此**依然顯示同一個錯誤**——這是預期行為，證明「重試」真的有重新發送請求，而不是單純卡住畫面不動。
- **取消勾選「模擬 API 失敗」**：`url` 恢復成不含 `simulateError` 的版本，`useFetch` 自動重新請求（不需要另外按重試），畫面成功恢復顯示 9 篇文章。

### 2. Demo 2：文章詳情（`ArticleDetailPanel`）——第二次重複使用 `useFetch`，並驗證 Race Condition

- **點選任一篇文章的「查看詳情 →」**：右側詳情面板顯示骨架，稍後換成該篇文章的完整內容（標題、作者、發布日期、閱讀時間、內文）。實測點擊「React 19 的 Actions」文章後，詳情面板正確顯示同一個標題。
- **快速切換文章（Race Condition 實測）**：連續快速點擊「文章 2」再點擊「文章 3」的「查看詳情」，兩個請求幾乎同時送出。實測最終畫面穩定顯示「文章 3」的內容（為什麼你的網站在手機上跑起來特別慢？），並沒有被稍晚才處理完成的「文章 2」請求（從 callback 到 async/await）覆蓋——這就是 `useFetch` 內部 `AbortController` 搭配 `requestKey` 比對，實際發揮作用的證明。
- **點選「🧪 檢視不存在的文章（示範 404 錯誤畫面）」**：請求一個真實但不存在的 ID（`999`），後端回應 `404`，畫面顯示「⚠️ 找不到 ID 為 999 的文章」；按下「重試」後，因為這篇文章本來就不存在，依然顯示相同的錯誤訊息（預期行為）。

### 3. `<StrictMode>` 下的 `AbortController` 實際效果

開發模式下 `<StrictMode>`（見 `main.jsx`）會讓每個元件的 effect「執行 => 清除 => 再執行一次」。實測監控瀏覽器的網路請求事件，可以清楚看到這個過程：

```
Request failed/aborted: http://localhost:5173/api/articles  net::ERR_ABORTED
Request finished:        http://localhost:5173/api/articles  200
```

第一次 effect 觸發的請求被 `controller.abort()` 真正中止（`net::ERR_ABORTED`），第二次 effect 觸發的請求才完整完成並更新畫面（`200`）。這正是今天認真處理 `AbortController` 才換來的效果——如果只像 Day08 一樣用旗標「忽略」結果，兩個請求都會完整跑完，只是其中一個的結果被忽略，等於每次掛載都讓瀏覽器多打一次用不到的 API。

## 九、常見陷阱整理

| 陷阱 | 說明 | 對策 |
| --- | --- | --- |
| 誤以為 `fetch` 對 4xx／5xx 會自動 reject | `fetch` 只有網路層級失敗才會 reject，伺服器回傳 404／500 依然視為「成功送達」，`try/catch` 完全抓不到 | 每次都手動檢查 `response.ok`，不是的話自己 `throw` 一個有意義的 `Error` |
| 只用 `isCancelled` 旗標、沒有呼叫 `AbortController.abort()` | 畫面雖然不會顯示錯誤資料，但過期的請求仍然會完整跑完，白白浪費頻寬與伺服器資源 | 搭配 `AbortController`：把 `controller.signal` 傳給 `fetch`，並在清除函式呼叫 `controller.abort()` |
| 在 `catch` 裡沒有先判斷 `error.name === 'AbortError'` | 會把「自己主動取消的請求」誤判成真正的錯誤，顯示不該出現的錯誤訊息給使用者看 | `catch` 的第一行永遠先檢查並提早 `return`，忽略 `AbortError` |
| 在 `useEffect` 一開始就同步呼叫 `setState` 重設 loading 狀態 | 會觸發 `oxlint` 的 `react/set-state-in-effect` 警告，也會多一次「重設狀態」的中間渲染 | 改用一個能唯一識別「這次請求」的 key（例如把 `url` 跟重試次數合成字串），跟「上一次有結果的 key」比對，用比較結果推導 `isLoading`，不需要額外呼叫 `setState` |
| `refetch()` 只是重新呼叫同一個函式，卻沒有讓任何依賴改變 | `useEffect` 的依賴陣列沒有變化就不會重新執行，按下「重試」毫無反應 | 準備一個「不影響請求內容，但改變就會觸發重新請求」的值（本日範例的 `retryToken`），讓它成為依賴陣列與請求識別碼的一部分 |
| Loading skeleton 的筆數跟實際資料筆數差異過大 | 骨架換成真實內容的瞬間，畫面高度大幅跳動，使用者會感覺閃爍或跳動明顯 | 依照這個列表「平常大概會有幾筆」抓一個接近的預設值即可，不需要跟真實筆數精準一致 |
| 只在開發模式測試，忽略 `<StrictMode>` 的雙重執行 | 沒有正確處理清除函式的程式碼，在 `<StrictMode>` 下容易「意外正常」或「意外異常」，容易誤判程式碼是否正確 | 在瀏覽器 Network 面板實際觀察請求數量與狀態（`canceled`／完成），確認清除函式確實有讓過期請求被取消 |

## 執行方式

今天的範例需要**同時啟動兩個服務**：Express 後端（提供 `/api/articles` 系列端點）與 Vite 前端。建議開兩個終端機視窗：

```bash
# 終端機 1：啟動後端 API（http://localhost:4020）
cd examples/day20-fetch-lab/server
npm install
npm start
# 或使用 npm run dev（node --watch，程式碼變更會自動重啟）
```

```bash
# 終端機 2：啟動前端 Vite 開發伺服器（http://localhost:5173）
cd examples/day20-fetch-lab
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。若畫面一直卡在骨架畫面不動、或看到「取得文章列表失敗」，請先確認終端機 1 的 Express 服務是否已經成功啟動（會印出 `[day20-fetch-lab] Express server ready at http://localhost:4020`）。

也可以執行 `npm run build` 將前端打包成正式版本，或執行 `npm run lint` 確認程式碼沒有 Hook 使用規則、或本日重點提到的 `set-state-in-effect` 相關警告——這兩個指令都只需要在前端（`examples/day20-fetch-lab`）目錄下執行，後端是一支單純的 Express 應用，不需要打包。
