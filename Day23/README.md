# Day 23｜React Router 進階：巢狀路由與動態參數

- 今日範例程式碼：[`Day23\examples\day23-nested-routes-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day23/examples/day23-nested-routes-lab)

## 一、從 Day22 的痛點說起：為什麼需要巢狀路由？

Day22 已經能讓網址與畫面同步，但 `router.jsx` 裡的每一筆路由，都要自己手動把頁面包進 `Layout`：

```jsx
// Day22 router.jsx ——每一筆路由都要重複包一次 <Layout>
export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/window-size', element: <Layout><WindowSizePage /></Layout> },
  { path: '/local-storage', element: <Layout><LocalStoragePage /></Layout> },
  { path: '/debounce', element: <Layout><DebouncePage /></Layout> },
  { path: '/search', element: <Layout><SearchPage /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
])
```

而 `Layout` 元件本身，是用最單純的 `children` props 組合畫面：

```jsx
// Day22 components/Layout.jsx
function Layout({ children }) {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-content">{children}</main>
    </div>
  )
}
```

這樣寫完全可以動，Day22 也確實靠它做出了「導覽列 + 換頁」的效果。但只要多想一步，會發現兩個問題：

1. **每一筆路由都要手動重複包一次 `<Layout>`**：路由一多，這件事會變得又囉唆又容易漏掉（忘記包 `Layout` 的頁面，就會少了導覽列）。
2. **沒辦法只讓「一部分」頁面共用另一層畫面骨架**：假設想讓「文章」相關的頁面（列表、詳情）多一份「分類側欄」，但首頁跟 404 頁面不需要，用 `children` props 手動組合的寫法，沒有一個乾淨的方式表達「這一群路由多包一層、那一群路由不用」。

React Router 的**巢狀路由（Nested Routes）**，就是設計來解決這兩個問題的：把「畫面骨架」也用路由的方式表達，讓 React Router 自動幫忙組裝，而不是自己手動一筆一筆包。

## 二、`<Outlet />`：父層路由的「插槽」

巢狀路由的核心，是父層路由元件裡的 `<Outlet />`。先看[官方文件](https://reactrouter.com/api/components/Outlet)最精簡的說明：

> Renders the matching child route of a parent route or nothing if no child route matches.
> （渲染出父層路由目前比對到的子路由；如果沒有任何子路由比對成功，就什麼都不渲染。）

用一個最簡單的例子理解：

```jsx
import { Outlet } from 'react-router'

function SomeParent() {
  return (
    <div>
      <h1>Parent Content</h1>
      <Outlet />
    </div>
  )
}
```

`<Outlet />` 可以想成是父層元件裡「留了一個洞」，告訴 React Router：「這裡要放子路由目前對應到的畫面」。如果拿掉「路由」這層包裝，其實跟 Day22 `Layout` 用 `children` 組合畫面的概念一模一樣——只是換了一種「由 React Router 決定要塞什麼進去」的機制，而不是自己手動把 JSX 傳進去。下面這張對照表，可以幫助建立這個心智模型：

|                    | Day22：`children` props                        | Day23：`<Outlet />`                                 |
|--------------------|------------------------------------------------|-----------------------------------------------------|
| 誰決定要顯示的內容 | 呼叫端手動傳入 `<Layout><HomePage /></Layout>` | React Router 根據目前網址，自動決定要渲染哪個子路由 |
| 路由設定寫法       | 每一筆路由各自獨立，互不隸屬                   | 用 `children` 陣列描述父子關係                      |
| 想多包一層 Layout  | 需要再手動包一層、或改寫每一筆路由             | 在 `children` 裡再巢狀一層即可                      |
| 畫面結果           | 一樣（導覽列／側欄 + 內容區）                  | 一樣（導覽列／側欄 + 內容區）                       |

## 三、用 `children` 建立巢狀路由設定

有了 `<Outlet />` 的概念，接著看路由設定要怎麼寫。官方文件 [Nested Routes](https://reactrouter.com/start/data/routing#nested-routes) 示範的巢狀寫法：

```ts
createBrowserRouter([
  {
    path: '/dashboard',
    Component: Dashboard,
    children: [
      { index: true, Component: Home },
      { path: 'settings', Component: Settings },
    ],
  },
])
```

三個重點：

### 1. `children`：巢狀路由的關鍵欄位

只要在一筆路由物件上加上 `children` 陣列，裡面的每一筆路由，網址都會自動「接在」父層路由的 `path` 後面。上面的例子會產生 `/dashboard` 與 `/dashboard/settings` 兩個網址，父層元件 `Dashboard` 裡的 `<Outlet />`，會依網址顯示 `Home` 或 `Settings` 其中一個。

### 2. Index Route（`index: true`）：父層路徑本身要顯示的內容

`{ index: true, Component: Home }` 這種寫法，代表「當網址剛好等於父層路徑本身（`/dashboard`）」時要渲染的內容，效果類似「預設子頁面」。索引路由有兩個限制：不能再有自己的 `children`，也不能同時設定 `path`（`index` 與 `path` 互斥）。

### 3. Layout Route：沒有 `path` 的路由，只負責疊畫面骨架、不佔用網址

如果一筆路由**只有 `element`（或 `Component`）、沒有 `path`**，它不會替網址新增任何片段，純粹只是「疊一層畫面骨架」：

```jsx
createBrowserRouter([
  {
    // 沒有 path，只有 element：純粹疊一層畫面骨架
    element: <MarketingLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
])
```

`Home`、`Contact` 兩個網址分別還是 `/`、`/contact`，並不會因為多疊了一層 `MarketingLayout` 而多出網址片段——這正是等一下範例 `RootLayout`、`ArticlesLayout` 兩層 Layout Route 的寫法依據。

> 💡 **小提醒**：`children` 巢狀可以疊很多層，每一層都可以自由選擇「要不要加 `path`」（要不要佔用網址片段）、「要不要放 `<Outlet />`」（要不要繼續疊下一層）。今天的範例會疊兩層：最外層 `RootLayout`（全站共用導覽列）、裡面再疊一層 `ArticlesLayout`（只有文章相關頁面共用的分類側欄）。

## 四、把 Day22 的 Layout 升級成 Outlet 版本

有了前面的概念，現在把 Day22 的 `Layout` 升級成今天範例的 `RootLayout`，兩者畫面結果幾乎一模一樣，寫法卻完全不同：

```jsx
// ❌ Day22：Layout 用 children props，每筆路由都要手動包一次
function Layout({ children }) {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-content">{children}</main>
    </div>
  )
}
```

```jsx
// ✅ Day23：RootLayout 用 <Outlet />，router.jsx 只需要「巢狀」一次
import { Outlet } from 'react-router'
import NavBar from './NavBar.jsx'

function RootLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
```

`router.jsx` 也從「每筆路由各自獨立」，改成「其他路由都是 `RootLayout` 的 `children`」：

```jsx
// router.jsx（完整版本，含今天示範的兩層巢狀）
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'articles',
        element: <ArticlesLayout />,
        children: [
          { index: true, element: <ArticlesListPage /> },
          { path: ':articleId', element: <ArticleDetailPage /> },
        ],
      },
      // 萬用路由：因為巢狀在 RootLayout 底下，404 頁面一樣看得到導覽列，
      // 不需要像 Day22 一樣每筆路由都手動包一次 <Layout>。
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
```

跟 Day22 相比，這裡多做了兩件事：

1. **只需要在最外層寫一次 `<RootLayout />`**：`HomePage`、整個 `/articles` 群組、`NotFoundPage`（連 404 頁面都算在內）全部都是它的 `children`，不需要每一筆路由重複包一次，導覽列自然而然會一直顯示。
2. **`/articles` 底下又疊了一層 `ArticlesLayout`**：只有「文章列表」（index route）與「文章詳情」（`:articleId` 動態路由）這兩個子路由，才會多一層 `ArticlesLayout`（今天範例是「分類側欄」），首頁跟 404 頁面完全不受影響——這正是 Day22 沒辦法優雅表達的「只讓一部分頁面共用另一層 Layout」。

## 五、動態路由參數：`useParams`

### 1. 基本用法

路由設定 `{ path: ':articleId', element: <ArticleDetailPage /> }` 裡，`:articleId` 就是**動態片段（dynamic segment）**：只要路徑用 `:` 開頭，這一段就會被當成參數，比對成功後透過 `useParams()` 讀出來。

```jsx
import { useParams } from 'react-router'

function ArticleDetailPage() {
  const { articleId } = useParams()
  // 網址 /articles/7 -> articleId 會是字串 "7"
}
```

> ⚠️ **型別提醒**：`useParams()` 讀出來的值一律是**字串**，就算網址看起來全部都是數字（`/articles/7`），`articleId` 也是 `"7"` 而不是數字 `7`。如果要拿去跟資料庫裡的數字 id 比對，記得先用 `Number(articleId)` 轉型（今天範例的後端就是這樣處理 `req.params.id` 的）。

### 2. 重要觀念：參數改變 ≠ 元件重新掛載

這是本篇最容易被忽略、卻很重要的一個觀念：從 `/articles/1` 換到 `/articles/2`，React Router 比對到的是**同一筆路由設定**（都是 `path: ':articleId'`），只是 `articleId` 這個參數值不同——**元件並不會被卸載、重新掛載一次**，只是重新渲染、拿到新的 `useParams()` 回傳值。

這件事對「元件內有 `useEffect` 抓資料」的情境影響很大：

```jsx
// ❌ 錯誤示範：依賴陣列缺少 articleId
useEffect(() => {
  fetch(`/api/articles/${articleId}`).then(/* ... */)
}, []) // 只在「第一次掛載」時執行一次

// ✅ 正確：把 articleId 放進依賴陣列
useEffect(() => {
  fetch(`/api/articles/${articleId}`).then(/* ... */)
}, [articleId]) // articleId 改變時，重新執行一次
```

錯誤示範那份程式碼，在使用者第一次進入 `/articles/1` 時完全正常，但只要接著點擊「下一篇」換到 `/articles/2`，畫面會因為元件沒有重新掛載、`useEffect` 也沒有重新執行，繼續停留在文章 1 的內容——這是初學者很常見的 bug 來源：直覺以為「網址換了＝元件重新跑一次」，但 React Router 為了效能（沿用同一個元件實例、只更新 props／參數），實際上並不會這麼做。今天範例的 `ArticleDetailPage` 會完整示範這個修正。

## 六、程式化導頁：`useNavigate`

### 1. 為什麼有些情境要用 `useNavigate`，而不是 `<Link>`

Day22 提過，一般使用者點擊的換頁，建議優先用 `<Link>`／`<NavLink>`。`useNavigate` 則是用在「程式自己決定要換頁」的情境：使用者做了某個操作之後（而不是單純點了一個連結），程式才判斷該換到哪個網址。今天範例的「上一篇／下一篇」按鈕就是很好的例子：按鈕本身顯示的是「下一篇」，但實際要導向哪個網址（`nextId` 是多少），要等後端回傳資料之後才知道，沒辦法事先寫死在 `<Link to="...">` 上。

```jsx
import { useNavigate } from 'react-router'

function ArticleDetailPage() {
  const navigate = useNavigate()

  return (
    <button onClick={() => navigate(`/articles/${article.nextId}`)}>
      下一篇 →
    </button>
  )
}
```

### 2. `navigate(-1)`：回到上一頁

`useNavigate` 回傳的函式，除了傳網址字串，也可以傳一個數字，效果等同瀏覽器的上一頁／下一頁：

```jsx
navigate(-1) // 回上一頁，等同瀏覽器「上一頁」按鈕
navigate(1) // 往前一頁
```

今天範例的「返回上一頁」按鈕就是用 `navigate(-1)`。這裡有一個實用的細節：如果使用者是從「已經篩選好分類／關鍵字」的文章列表點進某篇文章，`navigate(-1)` 會準確地回到「剛剛那個篩選狀態」的列表頁，而不是回到 `/articles` 的預設狀態——因為 `navigate(-1)` 本質上是操作瀏覽器的歷史紀錄，而篩選條件本來就已經寫進網址的查詢字串裡了（下一節 `useSearchParams` 會說明）。如果改成 `navigate('/articles')`，則會導向沒有任何篩選條件的預設列表頁，兩者行為並不相同，要依照實際情境選擇。

> ⚠️ **使用 `navigate(數字)` 的風險**：官方文件特別提醒，如果使用者是直接用網址列輸入進入某個頁面（瀏覽紀錄裡根本沒有「上一頁」），呼叫 `navigate(-1)` 可能會離開你的網站、回到瀏覽器先前瀏覽的其他網站，行為不一定符合預期。只有在確定使用者是透過站內連結進來（一定有上一筆瀏覽紀錄）時，才適合使用。

## 七、查詢字串：`useSearchParams`

### 1. 基本用法：像 useState，但寫進網址列

`useSearchParams` 回傳一個 `[searchParams, setSearchParams]` 的 tuple，用法跟 `useState` 很像，但多了一個特性：呼叫 `setSearchParams` 除了更新這個值，還會**真的觸發一次導頁**，把新的查詢字串寫進網址列。

```jsx
import { useSearchParams } from 'react-router'

function ArticlesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || ''
  // 網址 /articles?category=react -> category 會是 "react"
}
```

`searchParams` 是瀏覽器原生的 [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) 物件，用 `.get(key)` 讀值、`.set(key, value)` / `.delete(key)` 修改。

### 2. `{ replace: true }`：搜尋框不該塞爆瀏覽紀錄

如果搜尋框「每打一個字」都呼叫一次 `setSearchParams`，預設情況下每一次呼叫都會新增一筆瀏覽紀錄——打十個字，就會新增十筆歷史紀錄，使用者按一次「上一頁」只會消掉一個字，體驗非常糟糕。解法是加上 `{ replace: true }`，讓每一次更新都**覆蓋**目前這一筆歷史紀錄，而不是新增：

```jsx
function handleKeywordChange(event) {
  const value = event.target.value

  setSearchParams(
    (prev) => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set('q', value)
      } else {
        next.delete('q')
      }
      return next
    },
    { replace: true }, // 同一次輸入只覆蓋目前這筆紀錄，不會一直新增
  )
}
```

至於今天範例裡「點擊分類側欄」則沒有加 `replace`——因為切換分類是使用者一次明確的操作，讓它保留在瀏覽紀錄裡（可以用上一頁「復原」上一次的分類選擇），是合理的行為。**要不要加 `replace`，取決於這次更新是不是使用者會想用「上一頁」復原的一個獨立步驟。**

### 3. `<NavLink>` 的 active 狀態不會考慮查詢字串

`<NavLink>` 判斷「目前在哪一頁」，只看網址的**路徑**（`/articles`），不看**問號後面**的查詢字串（`?category=react`）。這也是為什麼今天範例的 `CategorySidebar`（依 `?category=` 顯示目前選取的分類）**沒有使用 `<NavLink>`**，而是自己用 `useSearchParams()` 讀出目前的查詢字串，手動判斷哪個分類該套用「選取中」的樣式：

```jsx
import { Link, useSearchParams } from 'react-router'
import { CATEGORIES } from '../categories.js'

function CategorySidebar() {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''

  return (
    <nav className="category-sidebar" aria-label="文章分類">
      <p className="category-sidebar__title">文章分類</p>
      <ul className="category-list">
        {CATEGORIES.map((category) => {
          const isActive = category.value === activeCategory
          return (
            <li key={category.value || 'all'}>
              <Link
                to={category.value ? `/articles?category=${category.value}` : '/articles'}
                className={`category-link${isActive ? ' category-link--active' : ''}`}
              >
                {category.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default CategorySidebar
```

## 八、今日範例：文章列表 => 文章詳情頁

### 1. 範例總覽

今天的範例是一個小型「文章（Articles）」網站，把前面七節學到的概念全部串在一起：

```
巢狀路由結構：

"/"（RootLayout：導覽列 + Outlet）
├─ index => HomePage（首頁介紹）
├─ "articles"（ArticlesLayout：分類側欄 + Outlet）
│   ├─ index => ArticlesListPage（文章列表：分類篩選 + 關鍵字搜尋）
│   └─ ":articleId" => ArticleDetailPage（文章詳情：上一篇／下一篇／返回）
└─ "*" => NotFoundPage（404）
```

- 導覽列（`NavBar`）由 `RootLayout` 提供，**所有頁面（含 404）都看得到**。
- 分類側欄（`CategorySidebar`）由 `ArticlesLayout` 提供，**只有文章列表跟文章詳情看得到**，首頁跟 404 頁面沒有。
- 文章資料改由 Node.js/Express 後端提供（`GET /api/articles`、`GET /api/articles/:id`），延續 Day20～Day22「前端 fetch + Vite proxy」的做法。

### 2. 專案結構

```
day23-nested-routes-lab/
├── server/                        # Express 文章 API（port 4023）
│   ├── index.js
│   └── package.json
├── src/
│   ├── categories.js               # 文章分類清單（共用常數，獨立成檔避免破壞 Fast Refresh）
│   ├── components/
│   │   ├── NavBar.jsx
│   │   ├── RootLayout.jsx          # 第一層 Layout：導覽列 + <Outlet />
│   │   ├── CategorySidebar.jsx     # 第二層 Layout 用到的分類側欄
│   │   └── ArticleCard.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ArticlesLayout.jsx      # 第二層 Layout：分類側欄 + <Outlet />
│   │   ├── ArticlesListPage.jsx    # index route："/articles"
│   │   └── ArticleDetailPage.jsx   # ":articleId" 動態路由
│   ├── router.jsx                  # 兩層巢狀的路由設定
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
└── vite.config.js                  # /api 代理到 http://localhost:4023
```

### 3. 後端：`GET /api/articles`、`GET /api/articles/:id`

刻意讓兩支端點回傳的資料形狀不一樣，模擬真實世界常見的 API 設計：

```js
// server/index.js：列表只回傳摘要欄位，不含 content 全文
app.get('/api/articles', async (req, res) => {
  await delay(300)
  const summaries = articles.map(({ id, title, category, author, publishedAt, excerpt }) => ({
    id, title, category, author, publishedAt, excerpt,
  }))
  res.json({ articles: summaries })
})

// 詳情 API 才回傳全文，並且附上 prevId／nextId（依陣列順序計算）
app.get('/api/articles/:id', async (req, res) => {
  const articleId = Number(req.params.id)
  await delay(300)

  const index = articles.findIndex((article) => article.id === articleId)
  if (index === -1) {
    res.status(404).json({ message: `找不到編號 ${req.params.id} 的文章` })
    return
  }

  const article = articles[index]
  const prevId = index > 0 ? articles[index - 1].id : null
  const nextId = index < articles.length - 1 ? articles[index + 1].id : null
  res.json({ ...article, prevId, nextId })
})
```

這樣設計有兩個好處：一是列表 API 的資料量比較小（不用把全部文章的全文都傳一次）；二是讓 `prevId`／`nextId` 由後端算好直接回傳，前端的「上一篇／下一篇」按鈕不需要自己維護一份文章順序。

> 💡 之後 Day24 會介紹 `loader`（Data APIs），可以把「進入頁面前先載入資料」這件事直接掛在路由設定上；今天範例仍然沿用 Day20 ～ Day22「元件內用 `useEffect` + `fetch`」的寫法，兩者可以對照比較，體會 `loader` 到底省下了哪些工。

### 4. `ArticlesLayout.jsx`：只影響「文章」這群頁面的第二層 Layout

```jsx
import { Outlet } from 'react-router'
import CategorySidebar from '../components/CategorySidebar.jsx'

function ArticlesLayout() {
  return (
    <div className="page-inner articles-layout">
      <CategorySidebar />
      <div className="articles-main">
        <Outlet />
      </div>
    </div>
  )
}

export default ArticlesLayout
```

### 5. `ArticlesListPage.jsx`：`useSearchParams` 做分類篩選 + 關鍵字搜尋

跟 Day21／Day22 的 `useDebounce` + `useFetch` 搜尋 demo 不同，這裡刻意**只呼叫一次 API**，拿到全部文章之後，篩選條件改變時全部在瀏覽器端用 `.filter()` 完成：

```jsx
useEffect(() => {
  let ignore = false
  fetch('/api/articles')
    .then((res) => res.json())
    .then((data) => { if (!ignore) setState({ status: 'success', articles: data.articles, error: '' }) })
    .catch((error) => { if (!ignore) setState({ status: 'error', articles: [], error: error.message }) })
  return () => { ignore = true }
}, []) // 只在第一次進入頁面時抓一次，篩選條件改變不需要重新打 API
```

> 💡 **為什麼這裡不需要像 Day21/Day22 一樣加 `useDebounce`？** Day21/22 的搜尋 demo，每次輸入都會真的發出一次網路請求，所以需要 Debounce 減少 API 呼叫次數。今天的篩選邏輯是對「已經在瀏覽器記憶體裡」的資料做 `.filter()`，不會產生任何網路請求，自然不需要 Debounce——這也是一個很好的練習：先想清楚「這個操作有沒有實際打 API」，再決定要不要加防抖動，而不是每次做搜尋框就直接照抄 Debounce 樣板。

篩選條件（`category`、`q`）從 `useSearchParams()` 讀出，並用來 `.filter()` 已經抓到的文章：

```jsx
const [searchParams, setSearchParams] = useSearchParams()
const category = searchParams.get('category') || ''
const keyword = searchParams.get('q') || ''

const filteredArticles = state.articles.filter((article) => {
  const matchCategory = !category || article.category === category
  const matchKeyword =
    !keyword ||
    article.title.toLowerCase().includes(keyword.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(keyword.toLowerCase())
  return matchCategory && matchKeyword
})
```

`handleKeywordChange`（帶 `{ replace: true }`）與 `handleClearFilters` 的完整寫法，請見第七節。

### 6. `ArticleDetailPage.jsx`：`useParams` + 參數改變重新抓資料 + `useNavigate`

```jsx
function ArticleDetailPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState({ articleId: null, article: null, error: null })

  useEffect(() => {
    let isActive = true

    fetch(`/api/articles/${articleId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || `找不到文章（狀態碼 ${res.status}）`)
        }
        return res.json()
      })
      .then((data) => { if (isActive) setResult({ articleId, article: data, error: null }) })
      .catch((error) => { if (isActive) setResult({ articleId, article: null, error: error.message }) })

    return () => { isActive = false }
  }, [articleId]) // ✅ 一定要加：articleId 改變時才會重新抓取對應的文章

  const isLoading = result.articleId !== articleId
  // ...
}
```

留意這裡**沒有**在 `useEffect` 一開始同步呼叫 `setState({ status: 'loading', ... })` 重設狀態——如果這樣寫，Day21 `useFetch.js` 提到的 oxlint `react/set-state-in-effect` 規則會發出警告：每次 `articleId` 改變都會多觸發一次「用不到的中間渲染」。這裡沿用 Day21 `useFetch.js` 的技巧：把每一次的結果都記錄它屬於「哪一個 `articleId`」（`result.articleId`），渲染時只要拿它跟目前的 `articleId` 比對，兩者不一致就代表「畫面現在看到的結果，還不是目前網址對應的文章」，直接推導出是否要顯示載入中，`effect` 內完全不需要另外呼叫 `setState` 去「宣告」現在是載入中。

「上一篇／下一篇」跟「返回上一頁」則是 `useNavigate` 的實際應用：

```jsx
<button disabled={article.prevId === null} onClick={() => navigate(`/articles/${article.prevId}`)}>
  ← 上一篇
</button>
<button disabled={article.nextId === null} onClick={() => navigate(`/articles/${article.nextId}`)}>
  下一篇 →
</button>
```

（`navigate(-1)` 的「返回上一頁」按鈕程式碼見第六節）

### 7. 路由與頁面對照表

| 網址路徑 | 頁面元件 | 巢狀層級 | 內容 |
| --- | --- | --- | --- |
| `/` | `HomePage` | RootLayout | 首頁：簡短介紹今天的路由概念 |
| `/articles` | `ArticlesListPage` | RootLayout => ArticlesLayout | 文章列表：分類篩選、關鍵字搜尋 |
| `/articles?category=react` | `ArticlesListPage` | 同上 | 只顯示 `react` 分類的文章（`useSearchParams`） |
| `/articles/:articleId` | `ArticleDetailPage` | RootLayout => ArticlesLayout | 文章詳情：上一篇／下一篇／返回（`useParams` + `useNavigate`） |
| `*`（其他任何路徑） | `NotFoundPage` | RootLayout | 404 找不到頁面 |

## 九、如何在本機執行範例

範例包含前端（Vite）與後端（Express）兩個部分，**建議開兩個終端機視窗分別啟動**：

### 1. 啟動後端 API（`server/`）

```bash
cd Day23/examples/day23-nested-routes-lab/server
npm install
npm start
```

啟動成功會看到：

```
[day23-nested-routes-lab] Express server ready at http://localhost:4023
```

### 2. 啟動前端（Vite）

另開一個終端機：

```bash
cd Day23/examples/day23-nested-routes-lab
npm install
npm run dev
```

啟動後於瀏覽器開啟 Vite 顯示的網址（預設 `http://localhost:5173`）。

### 3. 實際操作看看

- 首頁 `/` 只會看到導覽列，點擊「文章列表」進入 `/articles` 後，畫面會多出左側的分類側欄——確認「只有文章相關頁面才有側欄」這件事。
- 點擊側欄任一分類，網址會變成 `/articles?category=xxx`，文章清單會即時篩選，且側欄上目前選取的分類會反白。
- 在搜尋框輸入關鍵字，清單會即時篩選；打開瀏覽器網址列，確認 `?q=` 有跟著更新。
- 點擊任一篇文章進入詳情頁，確認分類側欄依然存在（巢狀 Layout 持續顯示）。
- 在文章詳情頁點擊「下一篇」，確認畫面內容正確換成下一篇文章（驗證 `articleId` 依賴陣列有正確生效，沒有停留在舊文章內容）。
- 點擊「返回上一頁」，確認會回到剛剛瀏覽文章列表時的篩選狀態（網址上的 `?category=`／`?q=` 有正確恢復）。
- 在網址列直接輸入一個不存在的文章編號（例如 `http://localhost:5173/articles/999`），應該顯示「找不到文章」訊息，而不是白畫面或例外錯誤。
- 在網址列直接輸入一個不存在的路徑（例如 `http://localhost:5173/hello`），應該看到 404 頁面，且導覽列依然正常顯示。
