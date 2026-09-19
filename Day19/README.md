# Day 19｜React 19 新特性（二）：`use` 與 Suspense

- 今日範例程式碼：[`Day19\examples\day19-use-suspense-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day19/examples/day19-use-suspense-lab)

## 一、為什麼需要 `use`：從 Day08 的手動三態談起

Day08 學過，`useEffect` 是元件跟「外部系統」（例如打 API）互動的標準做法。如果把 Day08 提到、但當時刻意留給 Day20 練習的「呼叫後端 API 取得資料」場景，用 `useEffect` 手刻出最基本的版本，通常會長這樣：

```jsx
function UserCard({ userId }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // 新增：手動追蹤載入中
  const [error, setError] = useState(null)          // 新增：手動追蹤失敗訊息

  useEffect(() => {
    let isCancelled = false // 避免元件卸載後還去 setState（Day08 學過的清除概念）

    setIsLoading(true)
    setError(null)

    fetch(`/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('取得使用者資料失敗')
        return res.json()
      })
      .then((data) => {
        if (!isCancelled) {
          setUser(data)
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
  }, [userId])

  if (isLoading) return <p>載入中...</p>
  if (error) return <p>發生錯誤：{error}</p>
  return <p>{user.name}</p>
}
```

這段程式碼完全能動，但注意到：每一個「需要非同步讀取資料」的元件，幾乎都得重新寫一次幾乎一模一樣的骨架——`isLoading`／`error`／實際資料三個 state、`isCancelled` 旗標防止卸載後的 race condition、三段 `if` 分支各自 `return` 不同畫面。這正是 Day20（資料請求與非同步處理實戰）之所以要把它抽成一個共用的 `useFetch(url)` 自訂 Hook 的原因——但無論怎麼抽，**呼叫端**永遠得多寫 `isLoading`／`error` 兩個 state 來換取「畫面知道現在該顯示什麼」。

React 19 的 `use()` 從另一個角度解決同一個問題：與其讓每個元件自己追蹤「現在是不是還在等」，不如讓元件在渲染時，直接嘗試把 Promise 的值「讀出來」——如果還沒好，就讓元件先「暫停」在原地，把「現在該顯示什麼過渡畫面」這件事，交給外層一個共用的 `<Suspense>` 邊界統一負責。同一段邏輯改用 `use()` 之後：

```jsx
function UserCard({ userPromise }) {
  const user = use(userPromise) // 還沒 resolve 就會讓元件暫停，完全不需要 isLoading
  return <p>{user.name}</p>
}

// 使用端：
<Suspense fallback={<p>載入中...</p>}>
  <UserCard userPromise={getUserPromise(userId)} />
</Suspense>
```

`UserCard` 裡再也看不到任何 `isLoading`、`error`、`try/catch`——`use()` 讓元件的程式碼看起來就像「資料本來就已經在那裡」一樣簡單，載入中與讀取失敗兩種情境，分別交給 `<Suspense>` 與 Error Boundary（第三節會詳細說明）統一處理。這也是今天要學的兩個角色一定要放在一起講的原因：**`use()` 負責「讀」，`Suspense` 負責「讀的過程還沒結束時，畫面要長什麼樣子」**。

## 二、`use()`：更自由的資料讀取 Hook

### 1. 基本語法

```js
const value = use(promiseOrContext);
```

> 讀取 Promise 或 Context 的值。與其他 Hook 最大的不同：`use` **可以**在條件式、迴圈等非頂層的地方呼叫。若傳入尚未 resolve 的 Promise，元件會觸發 Suspense 並等待其完成。

> `use`：（React 19 新增）新型 API。除可讀取 Context，還能直接在渲染條件中讀取 Promises 等非同步資源。

用一句話理解：**`use()` 不是一個全新的機制，而是把「讀 Promise」與「讀 Context」這兩件事，包進同一個依照傳入型別自動分流的 Hook。**

### 2. `use(promise)`：讀取非同步資料

把一個 Promise 傳給 `use()`，依照這個 Promise 目前的狀態，元件會出現三種完全不同的結果：

| Promise 狀態 | `use()` 的行為 | 畫面上看到的結果 |
| --- | --- | --- |
| **Pending**（尚未 resolve） | 讓目前這個元件「暫停」（suspend），本次渲染不會產生任何畫面 | 由最近的外層 `<Suspense>` 顯示 `fallback` |
| **Fulfilled**（已成功 resolve） | 同步回傳解析後的值，就像讀一般變數一樣 | 元件正常渲染，顯示真正的資料 |
| **Rejected**（已失敗 reject） | 等同於在渲染期間丟出這個錯誤 | 由最近的 Error Boundary 接手顯示錯誤畫面（見第三節第 3 小節） |

### 3. Promise 必須被「快取」：一個所有初學者都會踩到的陷阱

上面提到「同一個 Promise 被讀到時可以直接命中 fulfilled／rejected 分支」這句話，隱含一個很重要的前提：**你每次渲染傳給 `use()` 的，必須是「同一個」Promise 實例**，而不是每次渲染都重新建立一個新的。如果不小心寫成這樣：

```jsx
function UserCard({ userId }) {
  // ❌ 錯誤示範：每次渲染都會呼叫一次 fetch，建立一個全新的 Promise
  const user = use(fetchUser(userId))
  return <p>{user.name}</p>
}
```

`fetchUser(userId)` 每次渲染都會被呼叫一次，也就是每次都產生一個全新的、還沒有 `status` 標記的 Promise。因為 React 一律把「還沒 resolve 的 Promise」當成需要暫停等待的訊號，即使上一個 Promise 早就 resolve 完成，這個新 Promise 依然會讓元件重新進入 pending => 暫停 => 顯示 fallback 的流程，畫面會不斷閃爍 fallback，永遠進不去真正的內容。

正確的做法，是把「建立 Promise」這件事，搬到元件外面一個依 `key`（例如使用者 id）快取的地方，讓同一個 `id` 永遠對應同一個 Promise 實例。本日範例的 `utils/api.js` 就是這個模式的完整實作：

```js
// src/utils/api.js
const userPromiseCache = new Map()

export function getUserPromise(id) {
  if (!userPromiseCache.has(id)) {
    userPromiseCache.set(id, fetchUser(id)) // 只有「第一次」遇到這個 id 才會真的呼叫 fetch
  }
  return userPromiseCache.get(id) // 之後每次都回傳「同一個」Promise
}

export function invalidateUser(id) {
  userPromiseCache.delete(id) // 手動清快取，下一次 getUserPromise 就會重新發出請求
}
```

元件呼叫的永遠是 `use(getUserPromise(id))`，而不是 `use(fetchUser(id))`——差別就在於 `getUserPromise` 保證了「同一個 `id`，每次渲染都拿到同一個 Promise 實例」。這跟官方文件範例採用的 `fetchData`／快取模式完全一致，也是 React Query、SWR 這類「Suspense-compatible」資料請求函式庫在背後真正解決的問題——本日範例為了聚焦在 `use()` 本身的行為，選擇自己刻一個最簡化版本，而不是引入額外套件。

### 4. `use(context)`：可以在條件式、迴圈中呼叫

Day11 學過 `useContext(Context)`：跟所有 Hook 一樣，必須遵守「Hook 規則」——只能寫在元件最頂層，不能放進 `if`、迴圈、巢狀函式裡。`use(context)` 讀到的資料跟 `useContext(context)` **完全相同**（都是最近的 `<Context.Provider>` 或 `<Context value={...}>` 提供的 `value`），但它是官方文件明確列出的例外：**`use()` 可以在條件式、迴圈等非頂層的地方呼叫**。

本日範例的 `ProductPriceRow.jsx` 就是刻意示範這件事：

```jsx
// src/components/ProductPriceRow.jsx
function ProductPrice({ amount, showFormatted }) {
  if (!showFormatted) {
    // 提早 return，下面的 use() 完全不會被執行到
    return <span className="price price--plain">{amount}（原始數字）</span>
  }

  const format = use(CurrencyContext) // 只有 showFormatted 為 true 才會呼叫
  const formatted = new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.currency,
    maximumFractionDigits: 0,
  }).format(amount)

  return <span className="price price--formatted">{formatted}</span>
}
```

同樣的邏輯放進 `.map()` 迴圈——`src/components/PriceFormattingLab.jsx` 讓使用者針對「每一列商品」各自勾選要不要格式化，於是同一個迴圈裡，有些次呼叫了 `use(CurrencyContext)`、有些次完全沒呼叫，呼叫與否因列而異、也因使用者操作而動態改變。如果把 `use(CurrencyContext)` 換成 `useContext(CurrencyContext)`，這種「提早 return 之後才呼叫」的寫法在 React 的 Hook 規則裡是明確禁止的（違反「每次渲染都要用相同順序呼叫 Hook」的假設）；`use()` 之所以能例外，是因為它讀取 Context 的方式（`readContext`）本來就不依賴呼叫順序，而是直接查詢目前這個 Fiber 在樹上的位置，往上找最近的 Provider。

> 💡 **實測驗證**：這個專案的 `.oxlintrc.json` 開啟了 `react/rules-of-hooks: error`，`npm run lint` 對這段「條件式呼叫 `use()`」與「迴圈中呼叫 `use()`」的程式碼**完全沒有任何警告或錯誤**——證實了 oxlint 的 Hook 規則檢查確實把 `use()` 視為特例，不會像 `useContext`／`useState` 那樣一律要求頂層呼叫。

順帶一提，範例裡的 `PriceFormattingLab.jsx` 提供 Context 值的寫法是 `<CurrencyContext value={...}>`，而不是 Day11 教過的 `<CurrencyContext.Provider value={...}>`：

```jsx
<CurrencyContext value={{ locale: 'zh-TW', currency: 'TWD' }}>
  <table className="price-table">{/* ... */}</table>
</CurrencyContext>
```

## 三、`Suspense`：非同步渲染的載入邊界

### 1. 基本語法

```jsx
<Suspense fallback={<Loading />}>
  <SomeComponentThatMightSuspend />
</Suspense>
```

`<Suspense>` 包住的子樹裡，只要有任何一個元件呼叫 `use(promise)` 讀到還在 pending 的 Promise（或稍後第四節會提到的 `React.lazy`），最近的外層 `<Suspense>` 就會**整個切換成顯示 `fallback`**，直到子樹裡所有暫停中的元件都恢復完成，才會換回顯示真正的子樹內容。`fallback` 可以是任何 JSX——一段文字、一個轉圈圈動畫，或是像本日範例一樣，做一個外觀跟真正內容相近的骨架（skeleton）畫面。

### 2. 運作機制：`Suspense` 怎麼跟 `use()` 搭配運作

`use()` 讀到 pending 的 Promise 時，其實是把這個 Promise 當成例外「丟出去」。React 的渲染流程本來就有一套統一的例外攔截機制，一路往上尋找「誰能處理這個例外」；`<Suspense>` 正是靠這套機制，攔下「被丟出來的 Promise」這種特殊情況。

用一句話理解：**`use()` 負責在「資料還沒準備好」時，用丟出 Promise 的方式喊一聲「我需要等一下」；`<Suspense>` 負責攔住這聲喊叫，先顯示 `fallback`，並在資料準備好之後自動重新渲染真正的內容。**

### 3. 讀取失敗時：交給 Error Boundary

先建立一個關鍵觀念：**同樣是 `use()` 讓元件「跳出」這次渲染，「還沒準備好」（pending）跟「已經失敗」（rejected）背後其實是兩種完全不同的機制**：

- Promise 還是 **pending**：`use()` 丟出的是 React 自己內部定義的一種特殊「暫停信號」，只有 `<Suspense>` 認得。`<Suspense>` 看到就知道：「喔，只是還沒好而已，不是錯誤，先顯示 fallback，資料準備好了再自動換回來。」
- Promise 已經 **rejected**：`use()` 丟出的，其實就是貨真價實的 JavaScript 錯誤——效果等同你自己在元件的渲染函式裡直接寫了一行 `throw error`。`<Suspense>` 完全看不懂、也不會理會這種「真正的錯誤」，只會讓它繼續往上找，直到遇到一個「看得懂錯誤」的角色接手，也就是 **Error Boundary**。

畫成一張圖，`use()` 讀到的結果會這樣分流：

```text
use(promise) 讀取結果
  │
  ├─ Pending  =>「暫停信號」=> 只有 <Suspense> 接得住 => 顯示 fallback（例如 Skeleton）
  │
  └─ Rejected =>「真正的錯誤」=> <Suspense> 完全不理會 => 一路往上
                                 => 由最近的 Error Boundary 接住 => 顯示錯誤畫面
```

換句話說：**`<Suspense>` 只負責「等待」，不負責「出錯」**——這是初學者最容易搞混的地方。實務上兩者幾乎都是「包在一起」使用，各自攔截不同的情況：

```jsx
<ErrorBoundary fallback={(error) => <p>⚠️ 發生錯誤：{error.message}</p>}>
  <Suspense fallback={<p>載入中...</p>}>
    <UserCard userPromise={getUserPromise(userId)} />
  </Suspense>
</ErrorBoundary>
```

同一段程式碼，依照 `userPromise` 的三種狀態，畫面會分別長這樣：

| `userPromise` 狀態 | 誰接手                                      | 畫面顯示                        |
|--------------------|---------------------------------------------|---------------------------------|
| Pending            | `<Suspense>`                                | 「載入中...」                   |
| Fulfilled          | 兩者都不用接手                              | `<UserCard>` 正常顯示使用者資料 |
| Rejected           | `<Suspense>` 攔不住，交給 `<ErrorBoundary>` | 「⚠️ 發生錯誤：...」          |

> 💡 **常見誤解**：以為只要把元件包在 `<Suspense>` 裡，錯誤就會自動變成 fallback 畫面。實際上並不會——`<Suspense>` 只認得「暫停」，不認得「錯誤」；如果沒有額外包一層 Error Boundary，`rejected` 的 Promise 會像一般 JavaScript 例外一樣繼續往上，最後找不到人接手，讓整個 App 崩潰白屏。

React 核心套件本身沒有內建 Error Boundary 元件（官方文件建議自己刻一個，或使用 `react-error-boundary` 套件），本日範例的 `ErrorBoundary.jsx` 用最基本的 class component 寫法實作：

```jsx
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
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
```

有兩個容易忽略、但實測後很重要的細節：

- **Error Boundary 不會因為子節點內容換了就自動恢復**：一旦 `getDerivedStateFromError` 記下了錯誤，即使你後來把 `children` 換成完全不同的元件（例如把 `userPromise` 從讀取「使用者 99」換成「使用者 3」），這個 Error Boundary 依然會停留在錯誤畫面，因為錯誤狀態存在 Error Boundary 自己的 `state` 裡，跟子節點是誰無關。本日範例的解法是在 `UserProfileLab.jsx` 上，把 `selectedId` 當成 Error Boundary 的 `key`：

  ```jsx
  <ErrorBoundary key={selectedId} fallback={(error, retry) => (/* ... */)}>
    <Suspense fallback={<UserCardSkeleton />}>
      <UserCard userPromise={getUserPromise(selectedId)} />
    </Suspense>
  </ErrorBoundary>
  ```

  `key` 改變會讓 React 把整個 `ErrorBoundary` 當成全新的元件重新掛載，內部 `state.error` 自然重新變回 `null`——這是**切換使用者時清除錯誤畫面**的機制。
- **「重試」跟「切換後自動清除」是兩個不同的需求，要分開處理**：使用者也可能想在「不切換使用者」的情況下，針對同一個（依然會失敗的）使用者 99 再試一次。這時候不能靠換 `key`（那樣連帶會把 `Suspense` 也重新掛載，行為上沒有分別），而是靠 `ErrorBoundary` 自己暴露的 `retry()` 方法，單純把 `state.error` 設回 `null`，讓 `children` 有機會重新渲染一次：

  ```jsx
  fallback={(error, retry) => (
    <div className="error-card" role="alert">
      <p>⚠️ {error.message}</p>
      <button onClick={() => { invalidateUser(selectedId); retry() }}>🔁 重試</button>
    </div>
  )}
  ```

  這裡同時呼叫了 `invalidateUser(selectedId)`（清掉快取，逼 `getUserPromise` 重新發出請求）與 `retry()`（清除錯誤狀態、重新渲染）——兩者缺一都不會有效果：只清快取不 `retry`，Error Boundary 還停在錯誤畫面上不會重新渲染 `children`；只 `retry` 不清快取，`getUserPromise(99)` 拿到的還是同一個已經 rejected 的舊 Promise，一樣會立刻再次失敗（但這裡因為使用者 99 本來就不存在，兩種情況畫面結果其實相同，只是背後原理不同，值得注意的是「有沒有真的重新發出請求」）。

一句話統整這兩個容易搞混的機制：

| 情境 | 該用什麼 | 為什麼 |
| --- | --- | --- |
| 切換到**不同**的資料（例如換一個使用者 id） | 改變 Error Boundary 的 `key` | React 會把整個 Error Boundary 當成全新元件重新掛載，`state.error` 自然重置為 `null` |
| 針對**同一筆**資料，使用者手動按下重試 | 呼叫 Error Boundary 暴露的 `retry()` | 只清除錯誤狀態、重新渲染 `children`，不會連帶重新掛載 `<Suspense>` 或其他子樹狀態 |

### 4. Suspense 邊界要放在哪裡：granularity 設計原則

`<Suspense>` 可以包在任何層級——包整個 App、包一個路由頁面、或是像本日範例一樣只包一張卡片。邊界放的位置，直接決定「一小塊資料還沒回來」時，畫面上有多大範圍會被 `fallback` 取代：

- **包得太大**（例如整個 App 只有一個 `<Suspense>`）：任何一個角落有資料還在載入，使用者就會看到整頁被 fallback 蓋掉，即使畫面上 90% 的內容其實早就準備好了。
- **包得太細**（每一小段文字都包一個 `<Suspense>`）：畫面會變成一堆各自獨立跳動的 loading 區塊，體驗反而破碎。

實務上的原則是：**依照「使用者認知上，這些內容是不是同一個整體」來畫邊界**。本日範例把「一張使用者卡片」整個包在同一個 `<Suspense>` 裡（見 `UserProfileLab.jsx`），而不是分別包住大頭貼、姓名、簡介——因為這些欄位來自同一支 API、同一次請求，本來就該一起出現、一起被 `fallback` 取代，讓骨架畫面呈現的是「一整張卡片還沒準備好」，而不是「卡片裡有些欄位好了、有些還在跳動」。

## 四、延伸：`Lazy Loading` 與 `React.lazy` + `Suspense`

`<Suspense>` 除了搭配 `use(promise)` 處理**資料**還沒準備好的情況，也是 React 官方處理**程式碼**（JS bundle）Lazy Loading（延遲載入）的標準做法——也就是「這段元件的程式碼，等真的要渲染到畫面上時才去下載，而不是一開始就整包載入」，是常見的前端效能優化手法（code splitting）。

```jsx
import { lazy, Suspense } from 'react'

// import() 動態匯入：這一行本身不會立刻下載 SettingsPanel.jsx，
// 而是等到真的要渲染 <SettingsPanel /> 的那一刻，瀏覽器才會去要這個檔案。
const SettingsPanel = lazy(() => import('./SettingsPanel.jsx'))

function App() {
  return (
    <Suspense fallback={<p>設定頁面載入中...</p>}>
      <SettingsPanel />
    </Suspense>
  )
}
```

本日範例聚焦在資料讀取，沒有另外做一個 `React.lazy` 的 Demo（避免範例過度分散），但了解這一層關係，有助於理解「為什麼 `<Suspense>` 感覺什麼都能接得住」——因為它接住的一律是「還沒 resolve 的 Promise」，不管背後代表的是一筆使用者資料，還是一段還沒下載完成的元件程式碼。

## 五、小結對照表

### `use` vs `useContext`

| | `useContext(Context)` | `use(Context)` |
| --- | --- | --- |
| 讀到的值 | 最近的 Provider 提供的 `value` | 完全相同 |
| 呼叫位置 | 只能在元件／自訂 Hook **頂層**呼叫，不能放進條件式、迴圈 | **可以**放進條件式、迴圈等非頂層的地方 |
| 適用情境 | 大多數情況；沒有「條件式讀取」需求時，語意更直覺、更容易被其他人一眼看懂 | 只有「這次渲染要不要讀某個 Context，視條件而定」這種需求時才需要換用 |

### `use(promise)` + `Suspense` vs Day08 手動三態

| | Day08 手動三態（`useEffect` + 多個 `useState`） | `use(promise)` + `Suspense` |
| --- | --- | --- |
| 元件內部程式碼 | 需要 `isLoading`／`error`／資料三個 state，外加 `isCancelled` 之類的旗標 | 只有一行 `const data = use(promise)`，讀起來像同步程式碼 |
| 「載入中」畫面怎麼決定 | 元件自己用 `if (isLoading) return ...` 判斷 | 交給外層 `<Suspense fallback={...}>` 統一決定 |
| 「讀取失敗」畫面怎麼決定 | 元件自己用 `if (error) return ...` 判斷 | 交給外層最近的 Error Boundary 統一決定 |
| 多個元件同時讀取資料時 | 每個元件各自管理一份 `isLoading`，容易不同步 | 只要包在同一個 `<Suspense>` 下，會一起顯示 `fallback`、一起換成內容，天生同步 |
| Promise 快取責任 | 不需要——`useEffect` 本來就是「事件觸發時才執行一次」 | **一定要**——同一個 key 必須重複使用同一個 Promise 實例，否則 fallback 會無限循環 |

---

## 六、今日範例

```
day19-use-suspense-lab/
├── server/
│   ├── index.js              # Express API：GET /api/users/:id（900ms 延遲、404 處理）
│   └── package.json          # 後端（Express + cors，port 4019）
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx      # 共用：Error Boundary（getDerivedStateFromError + retry()）
│   │   ├── UserCard.jsx           # Demo 1：use(userPromise) 讀取並顯示使用者卡片
│   │   ├── UserCardSkeleton.jsx   # Demo 1：Suspense fallback 骨架畫面
│   │   ├── UserProfileLab.jsx     # Demo 1 容器：使用者選單、重新整理、Error Boundary 接線
│   │   ├── ProductPriceRow.jsx    # Demo 2：條件式呼叫 use(CurrencyContext)
│   │   ├── PriceFormattingLab.jsx # Demo 2 容器：勾選格式化、提供 Context 值
│   │   └── UseSuspenseLab.jsx     # 分頁容器，切換 Demo 1／Demo 2
│   ├── utils/
│   │   ├── api.js                # getUserPromise／invalidateUser（Promise 快取）
│   │   └── CurrencyContext.js    # createContext({ locale: 'zh-TW', currency: 'TWD' })
│   └── App.jsx
├── vite.config.js             # /api 開發代理，轉發到 http://localhost:4019
└── package.json                # 前端（Vite + React，port 5173）
```

`vite.config.js` 把所有 `/api` 開頭的請求代理到 Express，前端程式碼可以統一呼叫相對路徑（例如 `fetch('/api/users/1')`），不需要處理 CORS：

```js
const apiProxy = {
  '/api': { target: 'http://localhost:4019', changeOrigin: true },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
```

### 1. Demo 1：使用者卡片（`use(promise)` + `Suspense`）

`server/index.js` 刻意設計了三個重點，對應下面要驗證的三種情境：每次請求固定延遲約 900ms（讓骨架畫面有足夠時間被觀察到）；回應內容附上 `fetchedAt` 時間戳記（讓「Promise 有沒有被快取」變成畫面上看得到的證據）；找不到的 ID（例如 99）回傳 HTTP 404。

實際透過瀏覽器操作（Playwright 自動化測試）驗證過的行為：

- **第一次選到某位使用者**：畫面立刻顯示骨架卡片（`UserCardSkeleton`），約 0.9 秒（伺服器延遲）後換成真正的資料卡片。實測直接呼叫 `GET /api/users/1`，伺服器回應耗時穩定落在 900ms 左右；瀏覽器端從點擊到卡片實際顯示完成（含 Vite proxy 轉發與畫面渲染），實測約 1～1.5 秒之間。
- **切換到另一位「還沒讀取過」的使用者**：因為 `getUserPromise` 對這個新的 id 是第一次呼叫，會建立一個全新的 Promise，畫面重新顯示骨架卡片，稍後換成新使用者的資料。
- **切回「已經讀取過」的使用者**：因為 `getUserPromise` 對同一個 id 回傳的是快取住的同一個 Promise（且早已 fulfilled），`use()` 直接同步讀到結果，**完全不會看到骨架畫面**，也不會發出新的網路請求——實測切回快取使用者時，「上次讀取時間」（`fetchedAt`）跟第一次讀到的時間完全相同，耗時從原本的 900 多毫秒降到 100 毫秒以內（單純的 React 重新渲染時間）。
- **按下「重新整理目前使用者」**：呼叫 `invalidateUser(selectedId)` 清掉這個使用者的快取後，即使 id 沒變，`getUserPromise` 也會建立全新的 Promise，重新觸發骨架畫面，「上次讀取時間」會更新成新的時間戳記。
- **選擇「不存在的使用者（99）」**：伺服器回應 404，`api.js` 的 `fetchUser` 把它轉換成一個 rejected 的 Promise，`use()` 讀到之後等同拋出例外，畫面顯示 Error Boundary 的錯誤卡片：「⚠️ 找不到 ID 為 99 的使用者」。
- **從使用者 99 切換到任一位正常使用者**：因為 `ErrorBoundary` 的 `key={selectedId}` 會讓它整個重新掛載，錯誤畫面自動清除，改為顯示（或先顯示骨架、再顯示）新使用者的資料。
- **在使用者 99 的錯誤畫面按下「重試」**：清快取＋呼叫 `retry()` 後，畫面會重新嘗試讀取，但因為使用者 99 本來就不存在，最終依然顯示相同的錯誤訊息——這是**預期行為**，用來驗證「重試」機制真的有重新發出請求，而不是卡在舊的錯誤畫面不動。

### 2. Demo 2：價格格式化（`use(context)` 條件式讀取）

`src/components/PriceFormattingLab.jsx` 顯示 4 列商品（藍牙耳機、機械式鍵盤、行動電源、無線滑鼠），預設第 1、3 列已勾選「格式化」，第 2、4 列顯示原始數字。每一列的「格式化」核取方塊各自獨立控制。

實測驗證：勾選第 2 列（機械式鍵盤，原始金額 `2490`）的「格式化」核取方塊後，畫面文字從 `2490（原始數字）` 變成 `$2,490`（透過 `Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' })` 加上千分位符號與貨幣符號）。

> ⚠️ **實測小提醒**：程式碼裡指定的貨幣是新台幣（`TWD`），但 `Intl.NumberFormat` 實際顯示的貨幣符號字元，是由執行環境（瀏覽器／作業系統）內建的 ICU 語言資料決定，不同瀏覽器版本可能顯示 `NT$2,490`，也可能像本次實測環境一樣顯示 `$2,490`——兩者都是正確的格式化結果，差別只在符號字元本身，並不是程式碼寫錯。實作時不應該假設一個固定的符號字元，只需要驗證「有沒有加上千分位、金額數字是否正確」即可。

取消勾選後，文字會立刻變回原始數字 `2490（原始數字）`。切換格式化狀態的過程中，`ProductPrice` 這個子元件在「有勾選」與「沒勾選」兩種情況下，是否呼叫 `use(CurrencyContext)` 完全不同——這正是第二節第 4 小節示範的「`use()` 可以條件式呼叫」的實際效果。

---

## 七、常見陷阱整理

| 陷阱 | 說明 | 對策 |
| --- | --- | --- |
| 每次渲染都建立新的 Promise 傳給 `use()` | 沒有 `status` 標記的全新 Promise 一律被當成 pending，會讓 Suspense fallback 不斷重新出現，畫面永遠進不去 | 把「建立 Promise」搬到元件外面，用 `Map` 依 `key` 快取，確保同一個 `key` 永遠回傳同一個 Promise 實例 |
| 自己在程式碼裡用 `try/catch` 包住 `use()` 呼叫 | `use()` 讀到 pending／rejected 的 Promise，都是靠「往外丟」來運作（分別交給 Suspense、Error Boundary）；自己的 `try/catch` 會把這個訊號攔截下來，導致 Suspense／Error Boundary 都感應不到 | 讓 `use()` 拋出的東西自然往外傳遞，不要在呼叫 `use()` 的元件內攔截例外 |
| `fetch` 包裝函式沒有把「HTTP 狀態碼不是 2xx」轉換成真正的 rejected Promise | `fetch` 本身只有在網路層級失敗（例如斷線）才會 reject，伺服器回傳 404／500 時 `fetch` 依然視為成功，若沒有手動檢查 `response.ok`，Error Boundary 永遠不會被觸發，反而會在讀取資料時出現難以理解的錯誤 | 在包裝函式裡明確檢查 `response.ok`，不是的話自己 `throw` 一個有意義的 `Error` |
| 誤以為 Error Boundary 會因為換了新的子節點內容而自動恢復 | 錯誤狀態儲存在 Error Boundary 自己的 state，跟子節點換成什麼完全無關，不會自動清除 | 需要「切換到新資料時自動清除錯誤」的情境，用 `key` 讓 Error Boundary 隨著資料切換整個重新掛載；需要「同一筆資料重試」則用元件自己暴露的 `retry()` 方法 |
| `<Suspense>` 邊界包得太大（例如整個頁面只有一個） | 頁面上任何一小塊資料還沒回來，都會讓一大片本來已經準備好的內容一起被 `fallback` 蓋掉 | 依照「使用者認知上是不是同一個整體」來畫邊界，同一次請求、同一張卡片的內容包在同一個 `<Suspense>`，不同來源的內容分開包 |
| 假設 `Intl.NumberFormat` 產生的貨幣符號字元固定不變 | 貨幣符號實際顯示的字元（例如 `NT$` 或 `$`）由執行環境的 ICU 語言資料決定，不同瀏覽器／作業系統可能不同 | 只驗證千分位、數值是否正確，不要在程式邏輯或測試斷言裡寫死一個固定符號字元 |

## 執行方式

今天的範例需要**同時啟動兩個服務**：Express 後端（提供 `/api/users/:id`）與 Vite 前端。建議開兩個終端機視窗：

```bash
# 終端機 1：啟動後端 API（http://localhost:4019）
cd examples/day19-use-suspense-lab/server
npm install
npm start
# 或使用 npm run dev（node --watch，程式碼變更會自動重啟）
```

```bash
# 終端機 2：啟動前端 Vite 開發伺服器（http://localhost:5173）
cd examples/day19-use-suspense-lab
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。若畫面一直卡在骨架畫面不動、或看到「取得使用者資料失敗」，請先確認終端機 1 的 Express 服務是否已經成功啟動（會印出 `[day19-use-suspense-lab] Express server ready at http://localhost:4019`）。

也可以執行 `npm run build` 將前端打包成正式版本，或執行 `npm run lint` 確認程式碼沒有明顯的 Hook 使用錯誤——這兩個指令都只需要在前端（`examples/day19-use-suspense-lab`）目錄下執行，後端是一支單純的 Express 應用，不需要打包。
