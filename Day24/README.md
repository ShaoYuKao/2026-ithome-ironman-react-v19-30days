# Day 24｜React Router：資料載入與保護路由

- 今日範例程式碼：[`Day24\examples\day24-protected-routes-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day24/examples/day24-protected-routes-lab)

## 一、從 Day23 到 Day24：這次要解決什麼問題？

Day22 學會了用 `createBrowserRouter` 的 Data Mode 陣列描述路由；Day23 進一步學會巢狀路由、`useParams`、`useNavigate`、`useSearchParams`，做出「文章列表 => 文章詳情頁」。但這兩天的範例都還有兩個沒解決的問題：

1. **元件自己在 `useEffect` 裡 fetch 資料**：無論是 Day22 的商品搜尋，還是 Day23 的文章列表／詳情，資料都是「元件掛載之後」才透過 `useEffect` 開始抓，畫面會先渲染一次「載入中」、資料回來後才重新渲染一次。這樣當然可以動，但 React Router 其實提供了更貼近路由本身的做法——把「這個網址需要什麼資料」直接寫進路由設定裡，這正是 Day23 留下的伏筆：

   > 💡 之後 Day24 會介紹 `loader`（Data APIs），可以把「進入頁面前先載入資料」這件事直接掛在路由設定上；今天範例仍然沿用 Day20 ～ Day22「元件內用 `useEffect` + `fetch`」的寫法，兩者可以對照比較，體會 `loader` 到底省下了哪些工。

2. **沒有「登入才能看」的頁面**：到目前為止，所有路由只要知道網址，任何人都能直接進入。真實世界的後台、會員專區，都需要「未登入就擋下來，導向登入頁」的機制——這正是今天要做的**路由守衛（Protected Route）**。

React Router 的 **Data APIs**（`loader` / `action` / `redirect()`）與**路由守衛**，就是今天要解決這兩個問題的工具，也會用來回答 Day22 留下的另一個伏筆：

> 之後 Day24 會介紹 `loader` 拋出 `Response` 觸發的 `errorElement`——那是「伺服器（或資料層）明確判斷這是一筆錯誤」的情境，跟今天單純「網址沒有對應路由」的前端 404 概念不同，先知道兩者的差異即可。

## 二、`loader`：進入頁面「之前」先把資料準備好

### 1. 概念：把「元件掛載後 fetch」搬到「進入路由前」

`loader` 是掛在路由設定上的一個函式：React Router 在**真正渲染這個路由的元件之前**，會先呼叫它的 `loader`，等資料回來後，才把元件連同資料一起渲染出來。用 Day23 的方式跟今天的方式對照一次：

```jsx
// ❌ Day20～Day23 的寫法：元件掛載後才開始 fetch，
// 畫面會經歷「loading 畫面 → 資料畫面」兩個階段
function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile(getToken()).then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) return <p>載入中…</p>
  return <h1>歡迎回來，{data.user.name}</h1>
}
```

```jsx
// ✅ Day24 的寫法：資料在「進入這個路由」的當下就先準備好，
// 元件渲染時已經有資料可用，不需要自己處理 loading 狀態
// router.jsx
{ path: 'dashboard', element: <DashboardPage />, loader: dashboardLoader }

// DashboardPage.jsx
function DashboardPage() {
  const { user, stats } = useLoaderData() // 一定「已經有資料」
  return <h1>歡迎回來，{user.name}</h1>
}
```

`loader` 讓「這個路由需要什麼資料」變成路由設定的一部分，跟「畫面長什麼樣子（`element`）」平行放在一起，職責更清楚，元件也不用再自己管理 loading 狀態。

### 2. `useLoaderData()`：在元件裡讀出 loader 準備好的資料

`loader` 的回傳值，就是 `useLoaderData()` 在對應元件裡讀到的值：

```jsx
// auth/dashboardLoader.js
export async function dashboardLoader() {
  // ...驗證登入、呼叫 API
  return { user, stats } // 回傳什麼，useLoaderData() 就讀到什麼
}
```

```jsx
// pages/DashboardPage.jsx
import { useLoaderData } from 'react-router'

function DashboardPage() {
  const { user, stats } = useLoaderData()
  // user、stats 一定已經準備好，不用擔心是 undefined
}
```

## 三、`action` + `<Form>`：處理表單送出

### 1. 為什麼用 `<Form>`，而不是 `onSubmit` + `useState`

React Router 的 `<Form>` 元件，外觀跟寫法都很像原生的 `<form>`，但送出表單時**不會整頁重新整理**，而是把表單資料（`FormData`）交給這個路由設定的 `action` 函式處理：

```jsx
<Form method="post">
  <input name="username" />
  <input type="password" name="password" />
  <button type="submit">登入</button>
</Form>
```

跟「自己用 `useState` 管理每個欄位、`onSubmit` 裡手動組資料再呼叫 API」比起來，`<Form>` 少了幫每個欄位寫 `value` / `onChange` 的樣板程式碼，而且送出、等待、完成後導頁這一整套流程，React Router 都已經處理好了。

### 2. `action`：接住 `<Form>` 送出的資料

`action` 是路由設定上的另一個函式，`<Form>` 送出時就會呼叫它，並把整包表單資料透過 `request.formData()` 交給它：

```jsx
// auth/loginAction.js
export async function loginAction({ request }) {
  const formData = await request.formData()
  const username = String(formData.get('username') || '')
  const password = String(formData.get('password') || '')
  // ...呼叫登入 API、成功就 redirect()，失敗就回傳錯誤訊息
}
```

`formData.get('username')` 對應的就是 `<input name="username">`——這也是為什麼 `<Form>` 裡每個欄位都要記得寫 `name` 屬性，`action` 才讀得到值。

### 3. `useActionData()`：讀出 action 回傳的結果

如果 `action` 沒有 `redirect()`（例如登入失敗），它的回傳值可以透過 `useActionData()` 在元件裡讀到，很適合用來顯示表單驗證錯誤：

```jsx
// pages/LoginPage.jsx
import { useActionData } from 'react-router'

function LoginPage() {
  const actionData = useActionData()
  // ...
  return (
    <Form method="post">
      {/* ...欄位省略... */}
      {actionData?.error && <p className="form-error">{actionData.error}</p>}
    </Form>
  )
}
```

### 4. `useNavigation()`：知道「現在正在送出表單」

表單送出、`action` 執行、（如果有）`redirect()` 完成這段期間，`useNavigation().state` 會是 `'submitting'`；平常沒有任何導覽動作時是 `'idle'`。可以用來停用送出按鈕、避免使用者重複點擊：

```jsx
// pages/LoginPage.jsx
import { useNavigation } from 'react-router'

function LoginPage() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Form method="post">
      {/* ...欄位省略... */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '登入中…' : '登入'}
      </button>
    </Form>
  )
}
```

## 四、`redirect()`：讓 loader / action 直接換頁

`loader` 或 `action` 執行過程中，只要 `return redirect('/某個網址')`（或 `throw redirect(...)`），React Router 就會直接導向那個網址，不會渲染原本這個路由的元件：

```js
import { redirect } from 'react-router'

export async function loginAction({ request }) {
  // ...驗證帳號密碼
  if (登入成功) {
    return redirect('/dashboard')
  }
  return { error: '帳號或密碼錯誤' }
}
```

### `redirect()` 跟 `useNavigate()` 怎麼選？

| | `redirect()` | `useNavigate()` |
| --- | --- | --- |
| 使用位置 | `loader` / `action`（元件外） | 元件內部（是一個 Hook） |
| 適合情境 | 依「資料驗證結果」決定要不要換頁（例如：沒登入、表單送出成功） | 依「使用者操作」決定要不要換頁（例如：按下「上一篇」按鈕） |
| 呼叫方式 | `return redirect(path)` 或 `throw redirect(path)` | `navigate(path)` |

兩者都是「程式化導頁」，差別只在於**哪裡可以呼叫它**：`loader` / `action` 執行在元件樹外面，沒辦法呼叫任何 Hook（包含 `useNavigate()`），所以 React Router 才另外提供 `redirect()` 這個不依賴 Hook 的工具函式。

## 五、根路由 loader：讓整個 App 共用同一份登入狀態

### 1. 為什麼不能像過去一樣用 Context 管理登入狀態？

到目前為止，如果要在多個元件間共享狀態，很直覺的做法是用 Context（例如更早之前主題介紹過的自訂 Hook + Context 模式）。但登入狀態這件事，今天刻意選擇**不**用 Context，原因跟 `redirect()` 一樣：

**`loader` / `action` 執行在 React 元件樹「外面」**（呼叫它們的時機，是使用者導覽網址的當下，不是元件渲染的當下），沒辦法呼叫 `useContext`、`useState` 這些 Hook。如果登入狀態存在 Context 裡，`loginAction` 登入成功後，沒有任何辦法通知 Context 「使用者剛剛登入了」——Context 的 Provider 元件在這段期間根本沒有重新渲染的機會。

### 2. 解法：`rootLoader` + `useRouteLoaderData('root')`

今天的作法是幫最外層的路由（`id: 'root'`）掛一個 `loader`，直接讀 `localStorage` 裡的登入資訊：

```jsx
// router.jsx
import { getAuth } from './auth/authStorage.js'

function rootLoader() {
  const auth = getAuth()
  return { user: auth?.user ?? null }
}

export const router = createBrowserRouter([
  {
    id: 'root', // 有了 id，才能在任何子元件用 useRouteLoaderData('root') 讀到它
    path: '/',
    loader: rootLoader,
    element: <RootLayout />,
    children: [
      /* ... */
    ],
  },
])
```

任何巢狀在它底下的元件，都可以用 `useRouteLoaderData('root')` 讀到同一份登入狀態，不需要 Context，也不需要每個元件各自打一次 API：

```jsx
// components/NavBar.jsx
import { useRouteLoaderData } from 'react-router'

function NavBar() {
  const rootData = useRouteLoaderData('root')
  const user = rootData?.user ?? null
  // user 有值 -> 顯示使用者名稱 + 登出按鈕；null -> 顯示登入連結
}
```

### 3. Revalidation：為什麼 login / logout 之後畫面會自動同步？

這是這個設計能成立的關鍵：React Router 有一條規則——**只要有任何 `action` 執行完成，畫面上所有「作用中」的 `loader` 都會自動重新執行一次**（這個行為稱為 revalidation）。`loginAction`、`logoutAction` 執行完都會 `redirect()` 到新網址，而 `root` 這個路由不管網址是什麼都會被比對到，所以它的 `loader` 一定會跟著重新執行、重新讀一次 `localStorage`，`NavBar` 讀到的 `user` 自然就會同步更新——**完全不需要額外寫任何「通知」或「訂閱」的程式碼**。

## 六、路由守衛：用 `useEffect` + 條件渲染保護 `/dashboard`

今天練習的重點：`RequireAuth` 元件，把「未登入就導向登入頁」這件事包成一個可以重複使用的元件。

### 1. 為什麼不能在渲染過程中直接呼叫 `navigate()`

第一直覺可能會寫成這樣：

```jsx
// ❌ 錯誤示範：在元件本體（渲染過程）直接呼叫 navigate()
function RequireAuth({ children }) {
  const user = /* ...讀登入狀態... */
  const navigate = useNavigate()

  if (!user) {
    navigate('/login') // ❌ side effect 不能寫在渲染過程裡
  }

  return children
}
```

`navigate()` 會改變瀏覽器網址、觸發其他元件重新渲染，這屬於 **side effect（副作用）**。React 規定 side effect 只能寫在事件處理函式，或是 `useEffect` 裡執行，不能直接寫在元件本體（渲染過程）裡呼叫——這正是為什麼一定要包一層 `useEffect`。

### 2. `RequireAuth.jsx`：完整程式碼與逐行解說

```jsx
// components/RequireAuth.jsx
import { useEffect } from 'react'
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router'

function RequireAuth({ children }) {
  const rootData = useRouteLoaderData('root')
  const user = rootData?.user ?? null
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      // 把「原本想去的頁面」記錄在查詢字串 ?from=，
      // 登入成功後才能導回使用者原本想去的地方
      navigate(`/login?from=${encodeURIComponent(location.pathname)}`, { replace: true })
    }
  }, [user, navigate, location])

  // 條件渲染：還沒確認登入、或尚未登入時，
  // 先不要把受保護的畫面渲染出來（避免「一閃而過」的保護內容）
  if (!user) {
    return <p className="empty-state">尚未登入，正在導向登入頁…</p>
  }

  return children
}

export default RequireAuth
```

逐行拆解這個守衛在做的事：

1. **讀登入狀態**：跟 `NavBar` 一樣，透過 `useRouteLoaderData('root')` 讀同一份資料，兩邊的登入狀態永遠一致。
2. **`useEffect` 監控 `user`**：只要 `user` 是 `null`（未登入），就導向 `/login`，並用 `?from=` 帶上使用者原本想去的路徑；`{ replace: true }` 讓這次導頁不會留下一筆「被擋下來」的瀏覽紀錄，使用者按上一頁不會卡在受保護頁面。
3. **條件渲染擋住畫面**：`useEffect` 是在畫面渲染「之後」才執行，如果沒有這一段 `if (!user) return ...`，受保護的內容會先被渲染出來一瞬間，`useEffect` 才把使用者導走——這就是所謂的 **flash of protected content**（受保護內容一閃而過）。加上條件渲染，未登入時只會看到「正在導向登入頁…」的提示文字。
4. **依賴陣列要放 `[user, navigate, location]`**：這也是為什麼今天的 `.oxlintrc.json` 加了 `react-hooks/exhaustive-deps` 規則——確保 `useEffect` 用到的每個變數都乖乖放進依賴陣列，`user` 改變時才會重新檢查一次。

在 `router.jsx` 裡，只要把要保護的頁面包進 `<RequireAuth>` 即可：

```jsx
{
  path: 'dashboard',
  element: (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
  loader: dashboardLoader,
}
```

---

## 七、雙層防護：只有 `RequireAuth` 還不夠

### 1. `RequireAuth` 能擋住什麼、擋不住什麼

`RequireAuth` 檢查的是「**本機看起來有沒有登入**」——也就是 `localStorage` 裡有沒有存登入資訊。這對「使用者從來沒登入過」的情境完全足夠，而且反應速度很快（不用等任何 API）。

但如果使用者的登入資訊其實已經**過期或失效**呢？例如：

- 後端伺服器重新啟動，記憶體裡的 token 清單被清空了（今天範例故意用記憶體保存 token，方便重現這個情境）。
- Token 被後端主動撤銷（例如管理員強制登出某個帳號）。

這些情況下，`localStorage` 裡看起來「還有」登入資訊，`RequireAuth` 的檢查會誤判為「已登入」而放行——**前端自己保存的狀態，沒辦法代表後端真正的認可**。這正是為什麼今天的範例還準備了第二層防護。

### 2. `dashboardLoader`：跟後端「真的」驗證一次

```js
// auth/dashboardLoader.js
import { redirect } from 'react-router'
import { getToken, clearAuth } from './authStorage.js'
import { fetchProfile } from './authApi.js'

export async function dashboardLoader({ request }) {
  const token = getToken()

  if (!token) {
    const from = new URL(request.url).pathname
    throw redirect(`/login?from=${encodeURIComponent(from)}`)
  }

  try {
    return await fetchProfile(token) // 呼叫 GET /api/profile，帶著 Authorization header
  } catch (error) {
    if (error.status === 401) {
      // 後端說這個 token 不算數了：清掉本機資料，導回登入頁
      clearAuth()
      throw redirect('/login?from=/dashboard')
    }
    throw error // 不是 401（例如伺服器根本連不上）：交給 errorElement 處理，見第八節
  }
}
```

這個 `loader` 同時處理兩種情況：

1. **完全沒有 token**（從沒登入過）：直接 `redirect()`，`DashboardPage` 連渲染的機會都沒有。
2. **有 token，但後端判定它已失效**：呼叫 `/api/profile` 收到 `401` 才發現「前端以為有登入」其實是過期的假象，一樣清掉並導回登入頁。

**`RequireAuth` 檢查「本機看起來有沒有登入」，`dashboardLoader` 檢查「後端到底承不承認這個登入」——兩者都需要，才是真正安全的保護。** 這也呼應一個很重要的資安觀念：**前端的任何檢查都只能改善使用者體驗，資料真正的保護一定要靠後端驗證**，光靠 `RequireAuth` 這種純前端判斷，使用者只要手動竄改 `localStorage` 就能繞過去；但 `dashboardLoader` 呼叫的 `/api/profile` 是後端真正驗證 token 才會回傳資料，竄改前端狀態並不能讓後端多回傳任何東西。

### 3. 實際測試：讓第二層防護接住第一層漏掉的情況

今天的範例可以親手重現這個情境（也整理進第十一節的驗證清單）：

1. 登入後停留在 `/dashboard`，先確認畫面正常顯示。
2. 到終端機把 `server/` 的 Express 服務停掉、再重新啟動一次（記憶體裡的 token 清單會被清空，但瀏覽器的 `localStorage` 完全不受影響）。
3. 重新整理 `/dashboard` 頁面：`RequireAuth` 看 `localStorage` 還以為登入有效，會先放行；但 `dashboardLoader` 呼叫 `/api/profile` 這時會收到 `401`，於是自動導回登入頁——即使畫面上「看起來」還在登入狀態。

## 八、`errorElement`：接住「非預期的錯誤」

### 1. 跟 404 頁面有什麼不同

Day22 介紹的 `NotFoundPage`（`path: '*'`），處理的是「**使用者輸入了一個路由設定裡本來就沒有的網址**」；今天的 `errorElement`，處理的則是「**使用者進入的是合法的路由，但這個路由的 `loader` / `action` 執行時噴出了例外**」（不是刻意 `redirect()`，而是真的出錯了，例如後端伺服器整台打不通）。兩者是完全不同的情境，不應該用同一個畫面呈現。

### 2. `useRouteError()` + `isRouteErrorResponse()`

```jsx
// pages/ErrorBoundaryPage.jsx
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

function ErrorBoundaryPage() {
  const error = useRouteError()

  const { title, description } = isRouteErrorResponse(error)
    ? {
        // loader / action 主動 throw 出的 Response（例如刻意寫的 4xx/5xx）
        title: `${error.status} ${error.statusText}`,
        description: error.data || '伺服器回應了一筆錯誤。',
      }
    : {
        // 一般 JavaScript 例外（例如 fetch 連線失敗）
        title: '發生未預期的錯誤',
        description: error instanceof Error ? error.message : '請稍後再試一次。',
      }

  return (
    <div className="page-inner">
      <div className="not-found">
        <p className="not-found__code">⚠️</p>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
        <Link to="/" className="secondary-btn">回首頁</Link>
      </div>
    </div>
  )
}
```

`useRouteError()` 讀出剛剛是「誰」丟出了這個錯誤；`isRouteErrorResponse()` 用來分辨「這是 loader/action 主動丟出的 Response（狀態碼、狀態文字都是明確的）」還是「一般 JavaScript 例外（只有 `error.message`）」。

### 3. `errorElement` 掛在哪一層，會影響哪些畫面消失

```jsx
// router.jsx
{
  path: 'dashboard',
  element: (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
  loader: dashboardLoader,
  // 掛在 dashboard 這一層，而不是最外層的 root route：
  // dashboardLoader 丟出例外時，只有 <Outlet /> 這個插槽會換成
  // ErrorBoundaryPage，RootLayout（含 NavBar）仍會正常顯示。
  errorElement: <ErrorBoundaryPage />,
}
```

如果把 `errorElement` 掛在最外層的 `root` 路由，一旦 `/dashboard` 出錯，連同 `RootLayout` 的導覽列都會被 `ErrorBoundaryPage` 整個取代掉（因為「最近的錯誤邊界」往上尋找時，會連同它自己的 `element` 一起被換掉）。把 `errorElement` 貼近實際可能出錯的路由本身，才能讓錯誤影響的範圍越小越好——這件事今天已經實際用 Playwright 驗證過：把後端伺服器整個關掉後重新整理 `/dashboard`，NavBar 仍然正常顯示，只有內容區域換成錯誤畫面。

## 九、今日範例：登入 => Dashboard => 登出 Lab

### 1. 範例總覽

今天的範例是一個小型「登入保護」網站，把前面八節學到的概念全部串在一起：

```
路由結構：

"/"（RootLayout：導覽列 + Outlet，root loader 提供登入狀態）
├─ index => HomePage（首頁：依登入狀態顯示不同的行動呼籲）
├─ "login" => LoginPage（登入表單，action: loginAction）
├─ "dashboard" => RequireAuth 包住的 DashboardPage
│   （loader: dashboardLoader，errorElement: ErrorBoundaryPage）
├─ "logout" => 沒有畫面的資源路由（action: logoutAction）
└─ "*" => NotFoundPage（404）
```

- 導覽列（`NavBar`）由 `RootLayout` 提供，**所有頁面都看得到**，並會依登入狀態顯示「登入連結」或「使用者名稱 + 登出按鈕」。
- `/dashboard` 是今天唯一的受保護頁面：外層用 `RequireAuth`（`useEffect` + 條件渲染）擋第一層，`dashboardLoader` 再跟後端驗證一次擋第二層。
- 登入驗證改由 Node.js/Express 後端提供（`POST /api/login`、`GET /api/profile`、`POST /api/logout`），延續 Day20 ～ Day23「前端 fetch + Vite proxy」的做法。

### 2. 專案結構

```
day24-protected-routes-lab/
├── server/                        # Express 登入驗證 API（port 4024）
│   ├── index.js
│   └── package.json
├── src/
│   ├── auth/                       # 所有跟登入相關的非 UI 邏輯，獨立成檔
│   │   ├── authStorage.js          # localStorage 存取（getAuth/getToken/saveAuth/clearAuth）
│   │   ├── authApi.js              # 呼叫後端 API（loginRequest/fetchProfile/logoutRequest）
│   │   ├── loginAction.js          # "login" 路由的 action
│   │   ├── dashboardLoader.js      # "dashboard" 路由的 loader（雙層防護的第二層）
│   │   └── logoutAction.js         # "logout" 路由（資源路由）的 action
│   ├── components/
│   │   ├── NavBar.jsx              # 讀 root loader 資料，顯示登入狀態
│   │   ├── RootLayout.jsx          # 第一層 Layout：導覽列 + <Outlet />
│   │   └── RequireAuth.jsx         # useEffect + 條件渲染的路由守衛
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx           # <Form> + useActionData + useNavigation
│   │   ├── DashboardPage.jsx       # useLoaderData
│   │   ├── NotFoundPage.jsx        # path: '*' 對應的 404 頁面
│   │   └── ErrorBoundaryPage.jsx   # errorElement 對應的錯誤頁面
│   ├── router.jsx                  # 路由設定 + root loader
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
└── vite.config.js                  # /api 代理到 http://localhost:4024
```

> `loginAction.js`、`dashboardLoader.js` 沒有跟 `LoginPage.jsx`、`DashboardPage.jsx` 寫在同一個檔案裡，是刻意的決定：oxlint 的 `react/only-export-components` 規則會警告「一個檔案同時 export 元件與一般函式」（這樣會讓 Fast Refresh 失效），所以今天延續 `logoutAction.js` 原本就有的拆檔方式，把 loader / action 都獨立成檔，`router.jsx` 直接 import 使用。

### 3. 後端：三支 API

```js
// server/index.js
const USERS = [
  { username: 'demo', password: 'demo1234', name: '小明', role: '一般會員' },
  { username: 'admin', password: 'admin1234', name: '志明', role: '管理員' },
]

// token -> username 的對應表：刻意用「記憶體 Map」保存，而不是 JWT 或資料庫，
// 讓範例保持簡單，同時也帶來一個很好的練習情境——重啟伺服器，token 就全部失效。
const tokens = new Map()
```

| 端點 | 說明 |
| --- | --- |
| `POST /api/login` | 驗證帳號密碼，成功回傳 `{ token, user }`，失敗回傳 `401 { message }` |
| `GET /api/profile` | 受保護端點，需帶 `Authorization: Bearer <token>`；驗證通過回傳 `{ user, stats }`，否則 `401` |
| `POST /api/logout` | 把目前的 token 從伺服器記憶體中移除，之後這個 token 就完全失效 |

> ⚠️ 教學用的假使用者資料庫，帳號密碼都是明碼存放，僅供範例使用。真實專案務必對密碼做雜湊處理（例如 bcrypt），絕對不能明碼保存。

### 4. `router.jsx`：完整路由設定

```jsx
import { createBrowserRouter } from 'react-router'
import RootLayout from './components/RootLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ErrorBoundaryPage from './pages/ErrorBoundaryPage.jsx'
import { loginAction } from './auth/loginAction.js'
import { dashboardLoader } from './auth/dashboardLoader.js'
import { logoutAction } from './auth/logoutAction.js'
import { getAuth } from './auth/authStorage.js'

function rootLoader() {
  const auth = getAuth()
  return { user: auth?.user ?? null }
}

export const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    loader: rootLoader,
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage />, action: loginAction },
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
        loader: dashboardLoader,
        errorElement: <ErrorBoundaryPage />,
      },
      { path: 'logout', action: logoutAction },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
```

### 5. `authStorage.js` / `authApi.js`：不依賴 React 的共用邏輯

```js
// auth/authStorage.js —— 純 JavaScript，沒有 import 任何 React 的東西
const STORAGE_KEY = 'day24-auth'

export function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null // localStorage 內容如果被手動改壞，視同未登入
  }
}

export function getToken() {
  return getAuth()?.token ?? null
}

export function saveAuth({ token, user }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
```

`authApi.js` 則把 `fetch('/api/login')`、`fetch('/api/profile')`、`fetch('/api/logout')` 的細節統一包成三個函式（`loginRequest`、`fetchProfile`、`logoutRequest`），讓 `loginAction`、`dashboardLoader`、`logoutAction`、元件都可以直接呼叫，不用重複寫 `fetch` 邏輯與錯誤處理。

### 6. `loginAction.js` / `logoutAction.js`：登入與登出的 `action`

```js
// auth/loginAction.js（完整版本）
import { redirect } from 'react-router'
import { loginRequest } from './authApi.js'
import { saveAuth } from './authStorage.js'

export async function loginAction({ request }) {
  const formData = await request.formData()
  const username = String(formData.get('username') || '')
  const password = String(formData.get('password') || '')
  const from = String(formData.get('from') || '/dashboard')

  try {
    const { token, user } = await loginRequest(username, password)
    // 這裡直接呼叫 authStorage 寫 localStorage，而不是呼叫某個 Context 的
    // setState——因為 action 執行在 React 元件樹外面，沒有 Context 可以用。
    saveAuth({ token, user })
    return redirect(from)
  } catch (error) {
    return { error: error.message }
  }
}
```

```js
// auth/logoutAction.js（完整版本）—— 資源路由的 action，沒有對應的頁面元件
import { redirect } from 'react-router'
import { getToken, clearAuth } from './authStorage.js'
import { logoutRequest } from './authApi.js'

export async function logoutAction() {
  const token = getToken()

  if (token) {
    // 就算通知後端失敗（例如伺服器剛好重啟），也不影響前端清除登入狀態
    await logoutRequest(token).catch(() => {})
  }

  clearAuth()
  return redirect('/')
}
```

### 7. `LoginPage.jsx`：`<Form>` + `useActionData` + `useNavigation` + `useSearchParams`

```jsx
// pages/LoginPage.jsx
import { Form, useActionData, useNavigation, useSearchParams } from 'react-router'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const actionData = useActionData()
  const navigation = useNavigation()

  const from = searchParams.get('from') || '/dashboard'
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Form method="post" className="auth-form">
      {/* 隱藏欄位：把「使用者原本想去的頁面」一起送給 loginAction，
          登入成功後才能導回原本的目的地 */}
      <input type="hidden" name="from" value={from} />

      <label className="form-field">
        <span>帳號</span>
        <input type="text" name="username" required disabled={isSubmitting} />
      </label>
      <label className="form-field">
        <span>密碼</span>
        <input type="password" name="password" required disabled={isSubmitting} />
      </label>

      {actionData?.error && <p className="form-error">{actionData.error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '登入中…' : '登入'}
      </button>
    </Form>
  )
}
```

這裡把 Day23 學到的 `useSearchParams` 拿來讀 `RequireAuth` 導頁時附上的 `?from=`，塞進一個 `<input type="hidden">`：因為 `loginAction` 執行在元件外，沒辦法呼叫 `useSearchParams()`，把值放進表單欄位，是讓 loader / action 也能讀到「畫面上目前狀態」的常見手法。

### 8. `DashboardPage.jsx`：`useLoaderData`

```jsx
// pages/DashboardPage.jsx
import { useLoaderData } from 'react-router'

function DashboardPage() {
  const { user, stats } = useLoaderData()

  return (
    <div className="page-inner">
      <h1>歡迎回來，{user.name}</h1>
      <div className="card-grid dashboard-stats">
        <div className="card"><h2>{user.role}</h2></div>
        <div className="card"><h2>{stats.tasks} 筆</h2><p>待辦事項</p></div>
        <div className="card"><h2>{stats.messages} 則</h2><p>未讀訊息</p></div>
      </div>
    </div>
  )
}
```

`user`、`stats` 都是 `dashboardLoader` 呼叫 `GET /api/profile` 拿到的資料，元件渲染時就已經準備好，不需要處理 loading 狀態。

### 9. `NavBar.jsx`：登入狀態顯示 + `<Form>` 登出

```jsx
// components/NavBar.jsx
import { Form, NavLink, useRouteLoaderData } from 'react-router'

function NavBar() {
  const rootData = useRouteLoaderData('root')
  const user = rootData?.user ?? null

  return (
    <nav className="nav-bar">
      {/* ...導覽連結省略... */}
      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-user">👤 {user.name}</span>
            <Form method="post" action="/logout">
              <button type="submit">登出</button>
            </Form>
          </>
        ) : (
          <NavLink to="/login">登入</NavLink>
        )}
      </div>
    </nav>
  )
}
```

`<Form method="post" action="/logout">` 會呼叫 `router.jsx` 裡 `"logout"` 路由的 `action`（`logoutAction`）——這正是前面路由結構圖裡標註的**資源路由（Resource Route）**：路由只定義了 `action`，沒有 `element`，因為它從來不需要被「畫面渲染」，只透過表單送出觸發。`logoutAction` 執行完會 `redirect('/')`，root loader 跟著 revalidate，`NavBar` 的 `user` 就自動變回 `null`。

### 10. 路由與頁面對照表

| 網址路徑 | 頁面元件 | loader / action | 說明 |
| --- | --- | --- | --- |
| `/` | `HomePage` | root: `rootLoader` | 首頁，依登入狀態顯示不同引導 |
| `/login` | `LoginPage` | `action: loginAction` | 登入表單；成功 `redirect(from)`，失敗回傳 `{ error }` |
| `/dashboard` | `RequireAuth` → `DashboardPage` | `loader: dashboardLoader`、`errorElement` | 受保護頁面：雙層防護 + 錯誤邊界 |
| `/logout` | （無畫面，資源路由） | `action: logoutAction` | 清除登入狀態並 `redirect('/')` |
| `*`（其他任何路徑） | `NotFoundPage` | 無 | 404 找不到頁面 |

## 十、如何在本機執行範例

範例包含前端（Vite）與後端（Express）兩個部分，**建議開兩個終端機視窗分別啟動**：

### 1. 啟動後端 API（`server/`）

```bash
cd Day24/examples/day24-protected-routes-lab/server
npm install
npm start
```

啟動成功會看到：

```
[day24-protected-routes-lab] Express server ready at http://localhost:4024
```

### 2. 啟動前端（Vite）

另開一個終端機：

```bash
cd Day24/examples/day24-protected-routes-lab
npm install
npm run dev
```

啟動後於瀏覽器開啟 Vite 顯示的網址（預設 `http://localhost:5173`）。

### 3. 實際操作看看

- 未登入狀態下，直接在網址列輸入 `http://localhost:5173/dashboard`，應該立刻被導向 `http://localhost:5173/login?from=%2Fdashboard`（`RequireAuth` 生效）。
- 在登入頁輸入錯誤密碼（例如帳號 `demo`、密碼隨便打），應該看到「帳號或密碼錯誤」的錯誤訊息，且停留在登入頁。
- 輸入正確帳密（`demo` / `demo1234`），登入成功後應該直接導回剛剛想去的 `/dashboard`（而不是每次都固定跳去某個頁面），並看到「歡迎回來，小明」與待辦事項／未讀訊息的統計卡片。
- 登入後導覽列會顯示「👤 小明」與「登出」按鈕；點擊「登出」應該導回首頁，導覽列變回顯示「登入」連結。
- 登出後再次嘗試進入 `/dashboard`，應該再次被導向登入頁——確認登出真的清除了登入狀態。
- 也可以用另一組帳密 `admin` / `admin1234` 登入，確認顯示的名稱、身分都會對應切換成「志明」、「管理員」。
- **驗證雙層防護**：登入後停留在 `/dashboard`，到終端機把後端服務按 `Ctrl+C` 停掉、再重新啟動一次（`npm start`），然後重新整理 `/dashboard`——因為伺服器記憶體裡的 token 清單被清空了，應該會自動被導回登入頁，即使瀏覽器一直沒有登出過。
- **驗證 `errorElement`**：登入後，這次把後端服務直接關掉、**不要**重新啟動，重新整理 `/dashboard`——應該會看到「發生未預期的錯誤」的錯誤頁面，但導覽列仍然正常顯示（不是白畫面，也沒有整個網站消失）。測試完記得再把後端啟動回來。
- 在網址列直接輸入一個不存在的路徑（例如 `http://localhost:5173/hello`），應該看到 404 頁面，且導覽列依然正常顯示。
