# Day 27｜Redux Toolkit 實戰（二）：非同步處理

- 今日範例程式碼：[`Day27\examples\day27-redux-articles-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day27/examples/day27-redux-articles-lab)

## 一、從 Day26 到 Day27：同步的 Redux vs 非同步的 Redux

Day26 的 `cartSlice`，每一個 reducer 都是「同步」操作：加入商品、調整數量，都是對記憶體裡的陣列做運算，`dispatch` 之後 reducer 立刻算出新的 state，沒有「等待」的過程。這正是 Redux 的基本規則之一：**reducer 必須是同步、沒有副作用的純函式**，不能自己在裡面呼叫 `fetch`。

但今天的情境不一樣：文章資料不在前端，要跟後端 API 要。這中間多了「送出請求 => 等待回應 => 拿到結果或發生錯誤」的過程，不可能塞進一個同步的 reducer 裡完成。

回頭看 Day20 怎麼處理這個問題：`useFetch(url)` 自訂 Hook 把 `isLoading`／`data`／`error` 存成**元件自己的 state**，靠 `useEffect` 呼叫 `fetch`，等結果回來再 `setState`。這個做法在 Day20 完全夠用，但有一個限制：**資料是元件私有的**。如果首頁跟文章列表頁都各自呼叫一次 `useFetch('/api/articles')`，兩個元件會各自發送一次請求、各自保存一份幾乎一樣的資料，彼此互不相干。

今天要學的 `createAsyncThunk`，做的事情跟 `useFetch` 的精神完全一樣（一樣要處理 loading／成功／失敗三種狀態、一樣要能取消過期的請求），差別只在於**把這三個狀態放進 Redux store，而不是元件自己的 state**——這樣不管是首頁、文章列表頁還是文章詳情頁，讀到的都是同一份資料，只有第一個發起請求的頁面需要真的等待網路，其餘頁面直接從 store 拿現成的結果。

先整理一張對照表，之後每一節都會回頭指向這張表的某一列：

| Day20（`useFetch`，元件私有狀態） | Day27（`articlesSlice`，全域共用狀態） |
| --- | --- |
| `useState` 管理 `isLoading`／`data`／`error` | `createSlice` 的 `initialState` 管理 `status`／`items`／`error` |
| `useEffect` 裡呼叫 `fetch(url)` | `createAsyncThunk` 的 `payloadCreator` 裡呼叫 `fetch(url)` |
| `fetch` 送出前後沒有攔截機制，每個元件各自發送 | `condition` 選項可以在送出前攔截，判斷「這份資料是不是已經有了」 |
| `new AbortController()` + `controller.signal` | thunkAPI 內建的 `signal`，搭配 `dispatch(thunk(arg)).abort()` |
| `.then()`／`.catch()` 手動 `setState` | `extraReducers` 的 `builder.addCase` 自動接住 `pending`／`fulfilled`／`rejected` |
| 資料只存在呼叫它的那個元件 | 資料存在 store，任何元件用 `useSelector` 都能讀到同一份 |

今天不會重複 Day20 已經講過的「為什麼 `fetch` 對 4xx/5xx 不會自動 reject」「Loading Skeleton 怎麼設計」，如果對這些基礎還不熟悉，建議先讀一遍 Day20。

## 二、`createAsyncThunk`：把「發送請求 => 等待 => 結果」自動變成三種 action

### 1. 基本語法

```js
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles', // typePrefix：action type 的字首
  async (arg, thunkAPI) => {
    // payloadCreator：真正發送請求、回傳資料的地方
    const response = await fetch('/api/articles')
    return response.json()
  },
)
```

`createAsyncThunk` 接收兩個必要參數：

1. **`typePrefix`**：一個字串，會被拿去自動組出三個 action type。
2. **`payloadCreator`**：一個 `async` 函式，簽名是 `(arg, thunkAPI) => Promise`，裡面放「怎麼發送這個非同步請求」的邏輯。

呼叫 `createAsyncThunk(...)` 之後，回傳的 `fetchArticles` **本身就是一個 thunk action creator**：呼叫 `dispatch(fetchArticles(某個參數))`，Redux Toolkit 會自動依序 dispatch 出以下三種 action 之一（或兩個）：

| Action Type | 什麼時候 dispatch | payload 內容 |
| --- | --- | --- |
| `articles/fetchArticles/pending` | 呼叫的當下立刻 dispatch | 沒有 payload，`action.meta.arg` 是呼叫時傳入的參數 |
| `articles/fetchArticles/fulfilled` | `payloadCreator` 的 promise **resolve** 之後 | `action.payload` 是 `payloadCreator` 的回傳值 |
| `articles/fetchArticles/rejected` | `payloadCreator` 的 promise **reject**（或裡面 `throw`）之後 | 依情況是 `action.payload`（見第四節 `rejectWithValue`）或 `action.error` |

> 💡 這三個 action type 字串、還有這一整套「自動 dispatch」的行為，都是 `createAsyncThunk` 內部用 `action.type = ${typePrefix}/pending` 這種字串拼接方式自動產生的，不需要自己手動定義任何 action type 常數，這點跟 Day26 `createSlice` 的 `reducers` 自動產生 action creator 的精神是一致的。

### 2. `payloadCreator(arg, thunkAPI)` 的兩個參數

- **`arg`**：呼叫 `dispatch(fetchArticles(arg))` 時傳入的參數，**只能傳一個值**（如果需要多個資訊，包成一個物件傳入，這也是今天範例 `fetchArticles({ category, simulateError })` 的寫法）。
- **`thunkAPI`**：一個物件，裡面比較常用到的欄位有：
  - `dispatch`／`getState`：跟一般 thunk 一樣，可以在 payloadCreator 裡讀取目前的 state、或再 dispatch 其他 action。
  - `signal`：一個 `AbortSignal`，可以直接傳給 `fetch(url, { signal })`，是今天第六節「取消請求」的關鍵。
  - `rejectWithValue(value)`：主動把這次請求標記為「失敗」，並把 `value` 放進 `rejected` action 的 `action.payload`，是今天第四節的重點。
  - `fulfillWithValue(value)`：跟 `rejectWithValue` 相對，用來額外附加 `action.meta` 的資訊（今天的範例沒有用到，先知道有這個選項即可）。

### 3. `dispatch(thunk(arg))` 的回傳值：一個帶有 `abort()` 的 Promise

跟一般的 thunk 不一樣，`dispatch(fetchArticles(arg))` 回傳的不只是一個 Promise——它是一個 Promise，但額外附加了 `abort()` 方法與 `requestId`／`arg` 屬性：

```js
const promise = dispatch(fetchArticles({ category: 'tech', simulateError: false }))
// promise 本身可以 await，resolve 時拿到的是「原始的 action」（pending 已經處理完之後的 fulfilled 或 rejected action）
// promise.abort() 可以主動取消這次請求（第六節會實際使用）
```

這個特性今天會在第六節搭配 `useEffect` 的清除函式，實作跟 Day20 `AbortController.abort()` 對等的取消行為。

## 三、`extraReducers` 與 `builder.addCase`：接住 thunk 自動產生的 action

Day26 的 `createSlice` 只用到了 `reducers` 欄位，裡面每一個函式都會自動產生對應的 action creator（例如 `cartSlice.actions.addItem`）。但今天 `fetchArticles.pending`／`fulfilled`／`rejected` 這三個 action creator，**不是**在這個 slice 的 `reducers` 裡定義出來的——它們是 `createAsyncThunk` 自己產生的、「外來」的 action。

`createSlice` 提供了另一個欄位 `extraReducers`，專門用來讓一個 slice「監聽」其他地方定義的 action，用法是傳入一個函式 `(builder) => {...}`，再用 `builder.addCase(actionCreator, reducer)` 逐一列出：

```js
// src/store/articlesSlice.js
const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {}, // 今天沒有任何「同步」的 reducer，全部交給 extraReducers 處理
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.category = action.meta.arg.category
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.articles
        state.fetchedAt = action.payload.fetchedAt
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
  },
})
```

跟 `reducers` 裡的函式一樣，`builder.addCase` 傳入的 reducer 一樣可以用「看起來像 mutate」的寫法直接修改 `state`（Day26 第五節) 講過的 Immer 保護，在 `extraReducers` 裡同樣生效）。差別只在於：`reducers` 的 key（例如 `addItem`）會自動變成 action creator；`extraReducers` 則是反過來，**先有其他地方定義好的 action creator（`fetchArticles.pending` 等），再用 `addCase` 告訴這個 slice「看到這個 action 時該怎麼更新 state」**。

> 💡 如果好奇 `fetchArticles.pending` 這種「函式底下還有屬性」的寫法是怎麼做到的：`createAsyncThunk` 內部用 `createAction(typePrefix + '/pending')` 分別建立三個獨立的 action creator，再把它們掛成回傳值（也就是 `fetchArticles` 這個函式本身）的屬性（`fetchArticles.pending`、`fetchArticles.fulfilled`、`fetchArticles.rejected`）。`builder.addCase` 拿到的其實就是這三個一般的 action creator，跟 `reducers` 裡自動產生的 action creator，本質上是同一種東西，只是不需要透過 `slice.actions` 取出來、而是直接掛在 thunk 函式上。

## 四、`rejectWithValue`：把「可預期的錯誤」放進 `action.payload`

延續 Day20 第一節提過的重點：`fetch` 對 HTTP 4xx／5xx 狀態碼**不會自動 reject**，一定要自己檢查 `response.ok`。今天的 `payloadCreator` 一樣要做這件事，只是「回報錯誤」的方式，Redux Toolkit 提供了 `rejectWithValue`：

```js
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async ({ category, simulateError }, { rejectWithValue, signal }) => {
    const response = await fetch(buildArticlesUrl({ category, simulateError }), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
)
```

這裡刻意寫成 `return rejectWithValue(...)`（而不是 `throw new Error(...)`），差別在於 `rejected` action 之後怎麼被讀取：

| 寫法 | `rejected` action 的內容 |
| --- | --- |
| `return rejectWithValue(message)` | `action.payload === message`，`action.meta.rejectedWithValue === true` |
| `throw new Error(message)` | `action.payload` 是 `undefined`，錯誤被序列化放進 `action.error.message` |

`extraReducers` 裡讀取錯誤訊息時寫成 `action.payload ?? action.error.message`，就是同時涵蓋這兩種情況：優先用 `rejectWithValue` 傳回的、我們自己組好的訊息；如果是網路層級的例外（例如整個請求根本送不出去），才退回讀取 `action.error.message`。這跟 Day20 `useFetch.js` 裡「先檢查 `response.ok`，不是就自己 `throw` 一個有意義的 `Error`」是同一個檢查邏輯，只是今天多了 `rejectWithValue` 這個「專門用來回報可預期錯誤」的管道。

## 五、`condition`：避免重複請求，實現「多頁面共用同一份資料」

### 1. 問題：如果沒有 `condition` 會發生什麼事？

假設首頁跟文章列表頁都在 `useEffect` 裡 `dispatch(fetchArticles({ category: 'all', simulateError: false }))`：使用者從首頁點連結進入文章列表頁，文章列表頁的 `useEffect` 一樣會執行、一樣會 `dispatch`——即使首頁**已經**成功拿到一模一樣的資料，文章列表頁還是會傻傻地再打一次 API、再等一次 700ms 的延遲、再顯示一次 Loading Skeleton。這不是 bug，但很浪費。

### 2. `condition` 選項：送出前先問「真的需要打這次請求嗎？」

`createAsyncThunk` 的第三個參數可以傳入 `options`，其中的 `condition(arg, { getState, extra })` 會在 **`pending` action dispatch 之前**先被呼叫。只要這個函式回傳 `false`，Redux Toolkit 就會**整個跳過**這次 dispatch——不會有 `pending`，也不會有 `fulfilled`／`rejected`，`payloadCreator` 甚至不會被呼叫，等於這次 `dispatch(fetchArticles(...))` 從頭到尾沒有發生過。

```js
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async ({ category, simulateError }, { rejectWithValue, signal }) => {
    /* ...同第四節... */
  },
  {
    condition({ category, simulateError }, { getState }) {
      const { articles } = getState()
      // 如果「同一個分類」已經成功抓過、而且這次不是刻意勾選「模擬 API 失敗」，
      // 就直接跳過，不會真的發送請求。
      if (!simulateError && articles.category === category && articles.status === 'succeeded') {
        return false
      }
    },
  },
)
```

這正是「多個頁面共用同一份文章資料」的關鍵：首頁抓過一次 `category: 'all'` 之後，文章列表頁用同樣的分類再 `dispatch` 一次，會被這裡擋下來，兩個頁面讀到的是**同一份**已經存在 store 裡的資料，不需要為此在頁面元件裡多寫任何「要不要抓」的判斷邏輯——所有判斷都集中在 `articlesSlice.js` 這一個地方。

> 💡 `condition` 回傳 `false` 時，預設連 `rejected` action 都不會 dispatch（因為根本沒有「失敗」這回事，只是單純跳過）。如果想在跳過時仍然 dispatch 一個 `rejected` action（`action.meta.condition === true`）方便除錯，`createAsyncThunk` 還提供一個進階選項 `dispatchConditionRejection: true`，今天的範例沒有用到，先知道有這個選項即可。

### 3. 今天刻意保留的簡化：只快取「最近一次」的分類

`articlesSlice` 的 state 只用一個 `items` 陣列 + 一個 `category` 欄位記錄「目前這份資料是哪個分類」，**不是**替每個分類都存一份獨立的快取。這代表如果使用者切換「技術 → 生活 → 技術」，這裡不會記得「技術」已經抓過，會重新發送第三次請求。

這是刻意的簡化：真正做到「每個分類都各自快取」，需要把 `items` 改成用分類當 key 的物件（`{ tech: [...], life: [...] }`），並處理「資料要保留多久才算過期」這類問題，屬於更進階的「正規化（normalization）」設計，會讓初學者分心在資料結構上，而不是今天真正的重點——`createAsyncThunk` 本身的用法。今天只示範最基本、也最常見的情境：**同一個分類、短時間內、被不同頁面重複請求**時的去重，這已經足以體會 `condition` 的效果。

## 六、`abort()`：取消過期請求

### 1. 對照 Day20：同一個問題，不同的解法

Day20 第三節講過 Race Condition（競態條件）：快速切換文章時，如果先送出的請求比後送出的請求還晚回來，畫面可能會被「過期的資料」覆蓋。Day20 的解法是手動 `new AbortController()`，把 `controller.signal` 傳給 `fetch`，並在 `useEffect` 的清除函式呼叫 `controller.abort()`。

今天的 `fetchArticleById` 這個 thunk 一樣會遇到同樣的問題（快速從文章 A 切換到文章 B），但不需要自己 `new AbortController()`——`createAsyncThunk` 的 thunkAPI 已經內建了 `signal`，而 `dispatch(thunk(arg))` 回傳的 promise 本身就有 `abort()` 方法：

```js
// src/store/articlesSlice.js
export const fetchArticleById = createAsyncThunk(
  'articles/fetchArticleById',
  async (articleId, { rejectWithValue, signal }) => {
    const response = await fetch(buildArticleDetailUrl(articleId), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
)
```

```js
// src/pages/ArticleDetailPage.jsx
useEffect(() => {
  const promise = dispatch(fetchArticleById(numericId))
  return () => {
    promise.abort() // 換文章、或元件卸載時，取消還沒完成的舊請求
  }
}, [numericId, retryToken, dispatch])
```

呼叫 `promise.abort()` 之後，`thunkAPI.signal` 會被觸發，傳給 `fetch` 的請求就會真的中止（跟 Day20 的 `controller.abort()` 效果完全相同），接著這次呼叫會產生一個 `rejected` action，並帶有 `action.meta.aborted === true` 這個標記。

### 2. `extraReducers` 要記得判斷 `action.meta.aborted`

```js
.addCase(fetchArticleById.rejected, (state, action) => {
  if (action.meta.aborted) return // 是自己取消的，不是真正的錯誤，不更新 state
  state.currentArticleStatus = 'failed'
  state.currentArticleError = action.payload ?? action.error.message
})
```

如果漏掉這個判斷，快速切換文章時，「被取消的舊請求」也會被當成一次失敗，畫面可能會閃過一次不該出現的錯誤訊息——這跟 Day20 `useFetch.js` 在 `catch` 裡「一定要先判斷 `error.name === 'AbortError'` 再提早 `return`」是同一個道理，只是今天的判斷方式換成讀 `action.meta.aborted`。

> 💡 `abort()` 的取消時機跟 Day20 的 `AbortController` 有同樣的限制：如果 `payloadCreator` 的 promise **已經 resolve**（例如網路請求已經真的回來了，只是 reducer 還沒處理），`abort()` 就無法讓它「假裝沒發生過」。實際運作是 `createAsyncThunk` 內部用 `Promise.race` 讓「使用者呼叫 abort() 產生的 rejected」跟「`payloadCreator` 本身 resolve／reject」互相競爭，誰先發生就用誰的結果——這跟真正的網路層級 `AbortController` 一樣，都只能取消「還在進行中」的部分。

## 七、今日範例

### 1. 範例總覽

把 Day20 兩欄式（列表 + 詳情面板）的單頁畫面，拆成三個獨立的路由頁面，全部共用同一個 `articlesSlice`：

```
"/"              HomePage         首頁，顯示前 3 篇「熱門文章」，第一個發起 fetchArticles(all)
"/articles"      ArticlesPage     文章列表，可切換分類／模擬錯誤，示範 condition 去重與 abort 取消
"/articles/:id"  ArticleDetailPage 文章詳情，示範 fetchArticleById 的 abort 取消，並可用上一篇/下一篇快速切換
```

路由的部分沿用 Day22 教過的簡單寫法（`Layout` 用 `children` 組合、`router.jsx` 是一份扁平的路由陣列），刻意**不使用** Day23 教過的巢狀路由與 `<Outlet />`——今天的重點是 Redux，路由的部分越單純越好，把篇幅留給 `createAsyncThunk`。

### 2. 專案結構

```
day27-redux-articles-lab/
├── server/                      # Express API，跟 Day20 幾乎相同（port 改成 4027）
│   ├── package.json
│   └── index.js                 # GET /api/articles、GET /api/articles/:id
├── src/
│   ├── store/
│   │   ├── store.js             # configureStore，組合 articles slice
│   │   └── articlesSlice.js     # createAsyncThunk + extraReducers（今天的核心）
│   ├── utils/
│   │   └── articlesApi.js       # 組 API 網址、分類標籤（與 Day20 相同）
│   ├── components/
│   │   ├── Layout.jsx           # 沿用 Day22：children + 共用導覽列
│   │   ├── NavBar.jsx
│   │   ├── ArticleCard.jsx      # 文章卡片，改用 <Link> 導向 /articles/:id
│   │   ├── ArticleListSkeleton.jsx
│   │   └── ErrorRetryPanel.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ArticlesPage.jsx
│   │   ├── ArticleDetailPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── router.jsx               # createBrowserRouter，扁平路由（沿用 Day22）
│   ├── App.jsx                  # <RouterProvider router={router} />
│   ├── App.css
│   ├── main.jsx                 # <Provider store={store}> 包住 <App />
│   └── index.css
└── vite.config.js               # /api 代理到 http://localhost:4027
```

### 3. `articlesSlice.js`：完整程式碼

```js
// src/store/articlesSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { buildArticleDetailUrl, buildArticlesUrl } from '../utils/articlesApi.js'

const initialState = {
  // ---- 文章列表（對應 GET /api/articles?category=...） ----
  category: 'all',
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  fetchedAt: null,

  // ---- 文章詳情（對應 GET /api/articles/:id） ----
  currentArticleId: null,
  currentArticle: null,
  currentArticleStatus: 'idle',
  currentArticleError: null,
}

export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async ({ category, simulateError }, { rejectWithValue, signal }) => {
    const response = await fetch(buildArticlesUrl({ category, simulateError }), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
  {
    condition({ category, simulateError }, { getState }) {
      const { articles } = getState()
      if (!simulateError && articles.category === category && articles.status === 'succeeded') {
        return false
      }
    },
  },
)

export const fetchArticleById = createAsyncThunk(
  'articles/fetchArticleById',
  async (articleId, { rejectWithValue, signal }) => {
    const response = await fetch(buildArticleDetailUrl(articleId), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
)

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.category = action.meta.arg.category
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.articles
        state.fetchedAt = action.payload.fetchedAt
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchArticleById.pending, (state, action) => {
        state.currentArticleStatus = 'loading'
        state.currentArticleError = null
        state.currentArticleId = action.meta.arg
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.currentArticleStatus = 'succeeded'
        state.currentArticle = action.payload
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.currentArticleStatus = 'failed'
        state.currentArticleError = action.payload ?? action.error.message
      })
  },
})

export default articlesSlice.reducer

export const selectArticleItems = (state) => state.articles.items
export const selectArticlesCategory = (state) => state.articles.category
export const selectArticlesStatus = (state) => state.articles.status
export const selectArticlesError = (state) => state.articles.error
export const selectArticlesFetchedAt = (state) => state.articles.fetchedAt
export const selectCurrentArticleId = (state) => state.articles.currentArticleId
export const selectCurrentArticle = (state) => state.articles.currentArticle
export const selectCurrentArticleStatus = (state) => state.articles.currentArticleStatus
export const selectCurrentArticleError = (state) => state.articles.currentArticleError
```

### 4. `HomePage.jsx`：第一個發起請求的頁面

```jsx
// src/pages/HomePage.jsx
useEffect(() => {
  const promise = dispatch(fetchArticles({ category: 'all', simulateError: false }))
  // 就算參數固定不變，也養成「effect 觸發的 dispatch，一律在 cleanup 呼叫 abort()」的習慣：
  // 開發模式下 StrictMode 會讓這個 effect 執行兩次，靠 abort() 讓第一次沒必要的請求被取消掉。
  return () => {
    promise.abort()
  }
}, [dispatch])
```

首頁負責在使用者第一次進站時 `dispatch(fetchArticles({ category: 'all', ... }))`，把「全部分類」的文章存進 store；`featured` 只是把 `items` 陣列取前 3 筆，不需要另外呼叫 API。之後不管接下來去文章列表頁還是文章詳情頁，只要分類沒變，第五節的 `condition` 就會擋掉重複的請求。

### 5. `ArticlesPage.jsx`：切換分類／模擬錯誤／取消請求

```jsx
// src/pages/ArticlesPage.jsx
const [category, setCategory] = useState('all')
const [simulateError, setSimulateError] = useState(false)
const [retryToken, setRetryToken] = useState(0) // 沿用 Day20 的手法，只用來重新觸發 effect

useEffect(() => {
  const promise = dispatch(fetchArticles({ category, simulateError }))
  return () => {
    promise.abort()
  }
}, [category, simulateError, retryToken, dispatch])
```

這個頁面示範三件事：切換分類會 `dispatch` 新的請求（分類不同，`condition` 不會擋）；勾選「模擬 API 失敗」一樣會送出請求，但後端固定回傳 500；快速切換分類時，每次 `dispatch` 都會拿到新的 `promise`，靠 `useEffect` 的清除函式把「使用者已經不想看」的舊請求 `abort()` 掉，避免畫面被過期資料覆蓋。

### 6. `ArticleDetailPage.jsx`：文章詳情 + 上一篇/下一篇

```jsx
// src/pages/ArticleDetailPage.jsx
const { articleId } = useParams()
const numericId = Number(articleId)

useEffect(() => {
  const promise = dispatch(fetchArticleById(numericId))
  return () => {
    promise.abort()
  }
}, [numericId, retryToken, dispatch])

const isLoading = status === 'loading' || currentArticleId !== numericId
```

`isLoading` 除了看 `status` 之外，還要比對 `currentArticleId !== numericId`：因為從 `/articles/1` 換到 `/articles/2` 時（延續 Day23 學過的觀念），React Router 比對到的是同一筆路由設定，元件不會重新掛載，如果只看 `status`，畫面可能會在新請求開始前，短暫顯示上一篇文章的內容。

上一篇／下一篇的邏輯，直接從 store 目前的 `items` 陣列裡找位置：

```jsx
const currentIndex = items.findIndex((item) => item.id === numericId)
const prevArticle = currentIndex > 0 ? items[currentIndex - 1] : null
const nextArticle = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null
```

這裡的 `items` 是使用者上一次在首頁／文章列表頁看到的資料——如果直接用網址列輸入 `/articles/3` 進站、完全沒去過那兩個頁面，`items` 會是空的，上一篇／下一篇就無法使用，畫面會提示「先回文章列表逛逛」。這正是「共用同一份資料」的另一面：**共用的是同一份 store 裡的資料，不是每個頁面各自複製一份**，也是刻意保留、拿來當作教學重點的行為，而不是需要修掉的 bug。

### 7. 路由設定：`router.jsx` 與 `App.jsx`

```jsx
// src/router.jsx
import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ArticlesPage from './pages/ArticlesPage.jsx'
import ArticleDetailPage from './pages/ArticleDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/articles', element: <Layout><ArticlesPage /></Layout> },
  { path: '/articles/:articleId', element: <Layout><ArticleDetailPage /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
])
```

```jsx
// src/App.jsx
import { RouterProvider } from 'react-router/dom'
import './App.css'
import { router } from './router.jsx'

function App() {
  return <RouterProvider router={router} />
}
```

```jsx
// src/main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
```

`<Provider store={store}>` 包在最外層、`<RouterProvider>` 包在裡面，兩者互不干擾：任何一個路由對應的頁面元件，都能直接用 `useSelector`／`useDispatch` 讀寫同一個 store。

> 提醒一個容易搞混的地方：`/articles/999` 這個網址**會**被 `/articles/:articleId` 這筆路由比對到（路由層級是「合法網址」），畫面會正常進入 `ArticleDetailPage`，只是 `fetchArticleById(999)` 這支 API 呼叫本身會收到後端的 404 回應，顯示的是 `ErrorRetryPanel`；跟 `NotFoundPage`（路由完全比對不到任何頁面，例如打錯網址）是兩種不同層次的「找不到」，範例裡都各自準備了對應的畫面。

### 8. 後端 API：延續 Day20 的 Express 服務

`server/index.js` 提供的兩支端點，跟 Day20 幾乎一模一樣（同樣的 9 篇文章假資料、同樣的延遲時間、同樣支援 `?simulateError=true`），只把預設埠號改成 `4027`：

```js
// server/index.js
app.get('/api/articles', async (req, res) => {
  await delay(700)
  if (req.query.simulateError === 'true') {
    return res.status(500).json({ message: '伺服器暫時發生錯誤，請稍後再試（這是勾選「模擬 API 失敗」後的固定結果）' })
  }
  const { category } = req.query
  const filtered = category && category !== 'all' ? articles.filter((a) => a.category === category) : articles
  res.json({ articles: filtered.map(({ content: _content, ...summary }) => summary), fetchedAt: new Date().toISOString() })
})

app.get('/api/articles/:id', async (req, res) => {
  await delay(500)
  if (req.query.simulateError === 'true') {
    return res.status(500).json({ message: '伺服器暫時發生錯誤，請稍後再試（這是勾選「模擬 API 失敗」後的固定結果）' })
  }
  const article = articles.find((item) => item.id === Number(req.params.id))
  if (!article) return res.status(404).json({ message: `找不到 ID 為 ${req.params.id} 的文章` })
  res.json({ ...article, fetchedAt: new Date().toISOString() })
})
```

今天的重點是前端怎麼把呼叫這兩支 API 的邏輯，從 Day20 的 `useFetch(url)` 換成 `articlesSlice` 的 `createAsyncThunk`，後端本身沒有需要額外學習的新概念。

## 八、常見陷阱整理

| 陷阱 | 說明 | 正確理解 |
| --- | --- | --- |
| 想在 `reducers` 裡直接寫 `fetchArticles` 的邏輯 | reducer 必須是同步、無副作用的純函式，不能在裡面 `fetch` | 非同步的請求邏輯一律寫在 `createAsyncThunk` 的 `payloadCreator`，`reducers`／`extraReducers` 只負責「請求各階段該怎麼更新 state」 |
| 忘記 `extraReducers` 要用 `builder.addCase`，誤用 `reducers` 物件語法 | `fetchArticles.pending` 這類 action 不是這個 slice 自己定義的，不會出現在 `reducers` 裡 | 一律透過 `extraReducers: (builder) => builder.addCase(actionCreator, reducer)` 註冊 |
| 用 `throw new Error(...)` 取代 `rejectWithValue(...)` | 兩者都會觸發 `rejected` action，但錯誤訊息跑到 `action.error.message` 而不是 `action.payload`，容易讓 `extraReducers` 讀錯欄位 | 可預期的錯誤（例如 API 回傳 4xx/5xx）用 `rejectWithValue`；只有真正意外的例外才讓它自然 `throw` |
| `condition` 裡忘記排除「模擬錯誤」的情境 | 如果 `condition` 只看分類跟 `status`，勾選「模擬 API 失敗」時可能被誤判成「已經抓過」而被跳過，畫面看不到錯誤效果 | `condition` 的判斷式要把「這次是不是刻意要送出的特殊請求」也考慮進去，範例裡用 `!simulateError` 排除 |
| 快速切換文章／分類時，忘記在 `useEffect` 清除函式呼叫 `promise.abort()` | 過期的請求依然會完整跑完，晚回來的舊資料可能覆蓋掉新資料，畫面顯示錯誤的內容 | `dispatch(thunk(arg))` 回傳的 promise 一律在清除函式呼叫 `.abort()`，效果等同 Day20 的 `AbortController` |
| `extraReducers` 的 `rejected` 分支忘記判斷 `action.meta.aborted` | 使用者自己取消的請求，也會被當成一次「失敗」，畫面短暫閃過不該出現的錯誤訊息 | `rejected` 分支第一行永遠先判斷 `if (action.meta.aborted) return`，忽略被取消的請求 |
| 誤以為 `condition` 會自動幫每個分類都做快取 | 今天的 `articlesSlice` 只記得「最近一次」成功的分類，切換 A => B => A 依然會重新發送第三次請求 | 這是刻意保留的簡化，真正的多分類快取需要把 `items` 改成用分類當 key 的物件，是更進階的資料正規化設計 |
| 只在開發模式測試，被 `<StrictMode>` 的雙重執行搞混 | `<StrictMode>` 會讓每個 effect「執行 => 清除 => 再執行一次」，同一個 `dispatch` 可能在 Network 面板看到兩次幾乎一樣的請求，其中一次會被自動 `abort()` | 這是正常現象，只發生在開發模式；正式建置（`npm run build`）不會重複執行 effect |

## 九、如何在本機執行範例

今天的範例需要**同時啟動兩個服務**：Express 後端（提供 `/api/articles` 系列端點）與 Vite 前端。建議開兩個終端機視窗：

```bash
# 終端機 1：啟動後端 API（http://localhost:4027）
cd Day27/examples/day27-redux-articles-lab/server
npm install
npm start
```

```bash
# 終端機 2：啟動前端 Vite 開發伺服器（http://localhost:5173）
cd Day27/examples/day27-redux-articles-lab
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。若畫面一直卡在骨架畫面不動，請先確認終端機 1 的 Express 服務是否已經成功啟動（會印出 `[day27-redux-articles-lab] Express server ready at http://localhost:4027`）。

也可以在前端目錄下執行 `npm run build` 打包正式版本、或 `npm run lint` 用 oxlint 檢查程式碼風格；這兩個指令都只需要在 `examples/day27-redux-articles-lab`（前端）目錄下執行，後端是一支單純的 Express 應用，不需要打包。

## 十一、延伸閱讀

- [Redux Toolkit 官方文件：`createAsyncThunk` API](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Redux Toolkit 官方文件：Usage Guide - Async Logic and Data Fetching](https://redux-toolkit.js.org/usage/usage-guide#async-logic-and-data-fetching)
- [Redux Toolkit 官方文件：RTK Query](https://redux-toolkit.js.org/rtk-query/overview)（更進階的資料請求方案，內建快取、去重、自動重新驗證，是 `createAsyncThunk` 更完整的替代方案，適合下一階段學習）
- [MDN：`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)
