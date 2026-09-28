# Day 28｜週複習與小專案：多頁面電商購物車 App

- 今日範例程式碼(連結)：[`Day28\examples\day28-ecommerce-cart-app`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day28/examples/day28-ecommerce-cart-app)

## 一、本週學習地圖回顧

在動手整合之前，先快速複習一次第四週每天學了什麼、今天分別扮演什麼角色：

| Day | 主題 | 今天怎麼用到 |
| --- | --- | --- |
| Day22 | React Router 基礎：`createBrowserRouter`／`RouterProvider`、`<Link>`／`<NavLink>`、404 頁面 | `router.jsx` 沿用同樣的 `createBrowserRouter` 寫法；`NavBar` 用 `<NavLink>` 標示目前所在頁面；不存在的路徑一樣顯示 `NotFoundPage` |
| Day23 | 巢狀路由、`<Outlet>`、`useParams`、`useNavigate`、`useSearchParams` | `RootLayout` + `<Outlet>` 撐起整個 App；商品詳情頁用 `useParams` 取出 `:productId`；商品列表頁用 `useSearchParams` 把目前分類記錄在網址上 |
| Day24 | `loader`／`action`、根路由 loader、`RequireAuth` 路由守衛、`errorElement` | `RequireAuth` 幾乎原封不動保留同一套「`useEffect` + 條件渲染」寫法，只是把資料來源從 `useRouteLoaderData('root')` 換成 `useSelector(selectIsLoggedIn)` |
| Day25 | 狀態管理概念、Redux 三大原則、購物車 State／Action／Reducer／Selector 設計 | `cartSlice` 的資料形狀與四個 action，完全依照這天設計的規格；今天正式用上這天在第四節、第八節都預告過的三個 slice 組合 |
| Day26 | `configureStore`、`createSlice`、Immer、`useSelector`／`useDispatch` | `cartSlice.js` 幾乎原封不動搬過來，只多了一個可選的 `qty` 參數，讓商品詳情頁可以一次加入多件 |
| Day27 | `createAsyncThunk`、`extraReducers`、`condition` 去重、`abort()` 取消請求 | `productsSlice.js` 用同樣的模式處理「商品清單」這份非同步資料；`userSlice.js` 的 `login`／`logout` 也刻意寫成 thunk，而不是同步 reducer |

今天沒有任何全新的 API 或語法，重點是把過去六天分別學到的兩大主題——**路由（頁面之間怎麼切換）**與**全域狀態（資料怎麼跨頁面共用）**——組裝成一個完整能跑的多頁面 App，並釐清「路由該解決什麼問題、Redux 該解決什麼問題、兩者的邊界畫在哪裡」。

## 二、整體架構：頁面地圖與 Store 設計

### 1. 路由地圖

延續 Day23／Day24 的巢狀路由寫法：`RootLayout` 提供固定的 `NavBar`，其餘頁面全部是 `<Outlet />` 底下的子路由。

```
/                         RootLayout（NavBar + <Outlet />）
├── index                 HomePage         首頁：Hero + 精選商品
├── products              ProductListPage  商品列表（可用 ?category= 篩選）
├── products/:productId   ProductDetailPage 商品詳情（選數量、加入購物車）
├── cart                  CartPage         購物車（調整數量／移除／清空）
├── login                 LoginPage        登入
├── checkout              RequireAuth      結帳（受保護路由，未登入會被導向 /login）
│                         └─ CheckoutPage
└── *                      NotFoundPage     404
```

跟 Day24 的 `dashboard` 路由相比，這裡刻意**沒有**額外的根路由 `loader`。原因會在第六節詳細說明，先記住結論：**Redux store 本身就是路由樹之外的全域單例**，任何頁面都能直接用 `useSelector` 讀到登入狀態，不需要再靠 loader 把資料「準備好、往下傳」。

### 2. Store 設計

```js
configureStore({
  reducer: {
    cart: cartReducer,       // Day25 設計、Day26 實作，今天延伸支援多件加入
    products: productsReducer, // 延伸 Day27 的 createAsyncThunk 模式
    user: userReducer,        // 新增：login／logout 也是 createAsyncThunk
  },
})
```

這正是 Day25 第四節「對照表」與第八節「Day26 之後的預告」都提過的三個 slice 組合。三個 slice 完全獨立、互不知道彼此的存在，`NavBar` 卻能同時讀到 `cart.items`（顯示購物車徽章數量）與 `user.current`（顯示登入狀態）——這就是全域狀態管理「跨元件共享資料」的具體效果。

## 三、`productsSlice`：跨頁面共用的商品資料（延伸 Day27）

### 1. 跟 Day27 的 `articlesSlice` 相比，簡化了什麼

商品資料的用法跟 Day27 的文章資料非常像：首頁需要「精選幾件」、列表頁需要「全部」、詳情頁需要「單一一件」，三個頁面都該共用同一次 API 請求的結果。但今天刻意簡化了兩件事：

| Day27（`articlesSlice`） | Day28（`productsSlice`） | 為什麼可以簡化 |
| --- | --- | --- |
| 依分類呼叫 `GET /api/articles?category=xxx`，後端做篩選 | `GET /api/products` 一律回傳全部商品，分類篩選改用 `Array.filter` 在前端處理 | 商品資料量小（僅 10 筆），沒有分頁需求時，client-side 篩選更單純、也不用擔心「切換分類要不要重打 API」 |
| 文章「列表」與「詳情」是兩支不同 API（摘要 vs 完整內容） | 商品詳情直接從已載入的 `items` 陣列裡用 `id` 找出來，沒有第二支 API | 商品資料本來就是一次全部帶完整欄位回來，不像文章需要「列表用摘要、詳情才載入全文」來節省流量 |

> 💡 這是資料量大小決定設計取捨的實例：資料量小、不需要分頁時，「一次抓全部、前端自己篩」通常更簡單；資料量大或需要分頁時，才需要 Day27 那種「依條件呼叫後端」的做法。

### 2. `productsSlice.js` 完整程式碼

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { buildProductsUrl } from '../utils/productsApi.js'

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  fetchedAt: null,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ simulateError } = {}, { rejectWithValue, signal }) => {
    const response = await fetch(buildProductsUrl({ simulateError }), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
  {
    // condition：已經成功抓過、且這次不是刻意勾選「模擬 API 失敗」，就直接跳過。
    condition({ simulateError } = {}, { getState }) {
      const { products } = getState()
      if (!simulateError && products.status === 'succeeded') {
        return false
      }
    },
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.products
        state.fetchedAt = action.payload.fetchedAt
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
  },
})

export default productsSlice.reducer

export const selectProductItems = (state) => state.products.items
export const selectProductsStatus = (state) => state.products.status
export const selectProductsError = (state) => state.products.error
export const selectProductsFetchedAt = (state) => state.products.fetchedAt

// 商品詳情頁用：依 id 從目前的 items 裡找出單一商品（找不到回傳 undefined）。
export const selectProductById = (id) => (state) => state.products.items.find((item) => item.id === id)
```

跟 Day27 完全一致的部分：`condition` 去重、`rejectWithValue` 處理可預期錯誤、`extraReducers` 判斷 `action.meta.aborted` 忽略被取消的請求。這三個技巧今天沒有任何改變，直接沿用。

新增的 `selectProductById(id)`，是一個**回傳 selector 函式的函式**（Curried Selector）：`useSelector(selectProductById('p01'))` 才是真正拿去用的 selector，`selectProductById('p01')` 這一步只是先把 `id` 記起來、組出一個「已經知道要找哪個 id」的新函式。這個寫法在需要「帶參數」的 selector 時很常見。

## 四、`cartSlice`：原封不動搬過來，只加一個 `qty`（延伸 Day26／Day25）

Day26 的 `cartSlice` 完全依照 Day25 設計的規格實作，今天幾乎整份搬過來，唯一的擴充是 `addItem` 的 payload 多支援一個可選的 `qty` 欄位：

```js
addItem(state, action) {
  const { id, name, price, image, qty = 1 } = action.payload
  const existing = state.items.find((item) => item.id === id)
  if (existing) {
    existing.qty += qty
  } else {
    state.items.push({ id, name, price, image, qty })
  }
},
```

- Day26 的商品列表頁，每次點擊都是「加入 1 件」，`dispatch(addItem(product))` 沒有帶 `qty`，靠解構預設值 `qty = 1` 維持原本行為不變。
- 今天的商品詳情頁多了一個數量選擇器，`dispatch(addItem({ ...product, qty }))` 可以一次帶入使用者選好的數量。

`removeItem`／`changeQty`／`clearCart` 三個 action、以及 `selectCartItems`／`selectCartTotalCount`／`selectCartTotalPrice` 三個 selector，邏輯與命名都跟 Day26 完全相同，這裡不重複貼出（完整程式碼見 [`cartSlice.js`](examples/day28-ecommerce-cart-app/src/store/cartSlice.js)）。這也驗證了 Day25 說過的一句話：**設計良好的 slice，可以像元件一樣被搬到新的專案裡繼續使用，只需要在既有基礎上做小幅擴充**。

## 五、`userSlice`：把登入狀態放進 Redux

### 1. 為什麼 `login`／`logout` 要寫成 `createAsyncThunk`，而不是 `reducers`

今天新增的第三個 slice，管理「使用者是否已登入」這份全域狀態，用來保護 `/checkout` 結帳頁。`login`／`logout` 刻意都寫成 `createAsyncThunk`，而不是 `createSlice` 的 `reducers` 裡的同步 action，原因有兩個：

1. **`login` 本身就是非同步操作**：需要呼叫 `POST /api/login` 這支 API，等待伺服器驗證帳號密碼，做法跟 Day27 的 `fetchArticles` 完全一樣，一定要放進 `payloadCreator`。
2. **`saveAuth()`／`clearAuth()` 是 side effect**：延續 Day25 第五節「Pure Function Reducer 不能有 side effect」的原則，讀寫 `localStorage` 這種副作用，絕對不能寫在 `reducers`／`extraReducers` 裡——這兩行只能寫在 thunk 的 `payloadCreator` 裡（跟 `fetch` 一樣，`payloadCreator` 本來就不是 reducer，有 side effect 是合法且預期中的）。

### 2. `userSlice.js` 完整程式碼

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clearAuth, getAuth, saveAuth } from '../utils/authStorage.js'

// 模組載入當下就先讀一次 localStorage：如果使用者之前登入過、只是重新整理
// 瀏覽器（Redux store 本身會被整個重建，回到 initialState），這裡可以把
// 登入狀態還原回來，不需要重新登入一次。
const persisted = getAuth()

const initialState = {
  token: persisted?.token ?? null,
  current: persisted?.user ?? null, // { name, email } 或 null（未登入）
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk('user/login', async ({ email, password }, { rejectWithValue }) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    return rejectWithValue(body.message || `登入失敗（HTTP ${response.status}）`)
  }

  const data = await response.json()
  saveAuth({ token: data.token, user: data.user }) // side effect 放在 thunk 裡，不是 reducer
  return data
})

export const logout = createAsyncThunk('user/logout', async (_arg, { getState }) => {
  const { token } = getState().user
  if (token) {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
  clearAuth()
  return null
})
```

`logout` 特別值得注意的一個小細節：呼叫後端登出 API 失敗（例如伺服器剛好重啟過）也**故意用 `.catch(() => {})` 吞掉錯誤**，不讓整個 thunk 失敗——因為「登出」這個動作本身一定要成功，不能因為通知伺服器失敗，就讓使用者卡在退不出登入狀態的窘境。

`extraReducers` 的寫法跟 Day27 一致，用 `builder.addCase` 分別接住 `login.pending`／`login.fulfilled`／`login.rejected`／`logout.fulfilled` 四種 action（完整程式碼見 [`userSlice.js`](examples/day28-ecommerce-cart-app/src/store/userSlice.js)）。

### 3. `authStorage.js`：為什麼有了 Redux，還需要 localStorage？

理論上，登入狀態放進 Redux store 後，任何元件都能用 `useSelector` 讀到，不需要再操作 `localStorage`。但重新整理瀏覽器時，**Redux store 會被整個重建、回到 `initialState`**——為了不讓使用者「明明剛剛登入，一重新整理就變成沒登入」，`userSlice` 的 `initialState` 會在模組載入當下，先呼叫 `getAuth()` 讀一次 `localStorage`，把 token／使用者資料還原回來，效果跟 Day24 的根路由 `loader` 讀 `localStorage` 異曲同工，只是今天改成在 slice 模組載入時執行一次，而不是每次進入路由都執行。

## 六、`RequireAuth` 換一顆心臟：從 root loader 改成 Redux selector

Day24 的 `RequireAuth`，是用 `useEffect` + 條件渲染保護 `/dashboard`：還沒登入時，在 `useEffect` 裡呼叫 `navigate('/login', { replace: true })`，並在確認登入前，先回傳一段提示文字、不渲染受保護的內容。今天保護 `/checkout` 用的是**同一套寫法**，只是資料來源換了：

| | Day24 | Day28 |
| --- | --- | --- |
| 登入狀態存在哪 | 根路由 `loader` 回傳的資料 | Redux `user` slice |
| 元件怎麼讀 | `useRouteLoaderData('root')` | `useSelector(selectIsLoggedIn)` |
| 為什麼不用另一種 | Day24 還沒有 Redux，登入狀態只能寄生在路由的 loader 資料裡 | Redux store 本身是路由樹之外的全域單例，不需要靠 loader 讓資料「往下傳」 |

```jsx
function RequireAuth({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?from=${encodeURIComponent(location.pathname)}`, { replace: true })
    }
  }, [isLoggedIn, navigate, location])

  if (!isLoggedIn) {
    return <p className="empty-state">尚未登入，正在導向登入頁…</p>
  }

  return children
}
```

跟 Day24 一模一樣的關鍵原則依然成立：**不能在渲染過程中直接呼叫 `navigate()`**，一定要包在 `useEffect` 裡才是合法的 side effect；還沒確認登入前也不能讓受保護的內容渲染出來，避免使用者看到一閃而過的畫面（flash of protected content）。這正是今天要體會的重點——**同一套路由守衛的「寫法」，可以套用在不同的「資料來源」上**，不管登入狀態放在 loader 還是 Redux，保護邏輯本身完全通用。

## 七、今日範例：`day28-ecommerce-cart-app`

### 1. 範例總覽

一個完整的多頁面電商購物車 Demo：可以瀏覽商品、依分類篩選、進入商品詳情頁選數量加入購物車、在購物車調整數量、登入後結帳，結帳完成後購物車會清空並顯示成功畫面。前端用 Vite + React 19 + React Router 8 + Redux Toolkit，後端用 Express 提供商品清單與登入 API。

### 2. 專案結構

```
day28-ecommerce-cart-app/
├── server/                      # Express 後端
│   ├── index.js                 # GET /api/products、POST /api/login、POST /api/logout
│   └── package.json
└── src/
    ├── store/
    │   ├── store.js             # configureStore({ reducer: { cart, products, user } })
    │   ├── cartSlice.js         # 延伸 Day26：addItem／removeItem／changeQty／clearCart
    │   ├── productsSlice.js    # 延伸 Day27：fetchProducts（createAsyncThunk + condition）
    │   └── userSlice.js        # 新增：login／logout（createAsyncThunk）
    ├── utils/
    │   ├── productsApi.js      # buildProductsUrl、CATEGORY_LABELS、PRODUCT_CATEGORIES
    │   └── authStorage.js      # getAuth／saveAuth／clearAuth（localStorage）
    ├── components/
    │   ├── RootLayout.jsx       # NavBar + <Outlet />
    │   ├── NavBar.jsx           # 導覽列：購物車徽章 + 登入狀態
    │   ├── RequireAuth.jsx      # 路由守衛（讀 Redux，保護 /checkout）
    │   ├── ProductCard.jsx      # 商品卡片（首頁／列表頁共用）
    │   ├── ProductListSkeleton.jsx # 載入中的骨架卡片
    │   └── ErrorRetryPanel.jsx  # 錯誤訊息 + 重試按鈕
    ├── pages/
    │   ├── HomePage.jsx         # 首頁：Hero + 精選商品
    │   ├── ProductListPage.jsx # 商品列表（分類篩選、模擬 API 失敗）
    │   ├── ProductDetailPage.jsx # 商品詳情（數量選擇、加入購物車）
    │   ├── CartPage.jsx         # 購物車（調整數量／移除／清空）
    │   ├── LoginPage.jsx        # 登入（受控表單 + Redux thunk）
    │   ├── CheckoutPage.jsx     # 結帳（受保護路由，送出後顯示成功畫面）
    │   └── NotFoundPage.jsx     # 404
    ├── router.jsx                # createBrowserRouter 路由設定
    ├── App.jsx                   # RouterProvider
    └── main.jsx                  # Provider（Redux）+ StrictMode
```

### 3. 後端 API：`server/index.js`

一支簡單的 Express 服務，沒有資料庫，重新啟動後登入 token 會全部清空（教學上的刻意簡化）：

| 方法 + 路徑 | 說明 |
| --- | --- |
| `GET /api/products` | 回傳全部 10 筆商品；帶 `?simulateError=true` 時固定回傳 500，用來重現錯誤畫面 |
| `POST /api/login` | 傳入 `{ email, password }`；驗證成功回傳 `{ token, user }`，失敗回傳 401 |
| `POST /api/logout` | 帶 `Authorization: Bearer <token>`，將該 token 從伺服器的記憶體清單移除 |

測試帳號（明碼儲存僅供範例使用，真實專案務必用 bcrypt 等方式雜湊密碼）：

| Email | 密碼 | 姓名 |
| --- | --- | --- |
| `demo@example.com` | `demo1234` | 小明 |
| `admin@example.com` | `admin1234` | 志明 |

商品資料共 10 筆、4 個分類，其中 p01（無線滑鼠）、p02（機械式鍵盤）刻意沿用 Day26 範例一樣的名稱與價格，方便對照：

| 分類 | 商品 |
| --- | --- |
| 電腦周邊 `peripheral` | 無線滑鼠、機械式鍵盤、USB-C 多合一擴充座、27 吋 4K 顯示器、筆電支架 |
| 音訊 `audio` | 藍牙耳機、降噪耳罩式耳機 |
| 穿戴裝置 `wearable` | 智慧手錶 |
| 生活配件 `accessory` | 行動電源、筆電包 |

### 4. 頁面走讀

- **`HomePage`**：掛載時 `dispatch(fetchProducts())`，展示前 4 筆商品當作「精選商品」。因為 `productsSlice` 的 `condition` 已經處理去重，不管使用者先進首頁還是先進商品列表頁，商品資料永遠只會真的抓取一次。
- **`ProductListPage`**：用 `useSearchParams` 把目前分類存在 `?category=` 查詢字串上，`Array.filter` 在前端篩選；額外提供「🧪 模擬 API 失敗」checkbox 與「重試」按鈕，做法跟 Day27 的 `ArticlesPage` 完全一致，方便手動測試錯誤畫面。
- **`ProductDetailPage`**：用 `useParams` 取出 `:productId`，透過 `selectProductById(productId)` 從已載入的 `items` 找出商品；若是直接貼網址進來（`items` 可能還是空的），一樣會 `dispatch(fetchProducts())` 當作保險。數量選擇器是一個受控的 `<input type="number">`，上下限由 `product.stock` 決定，按下「加入購物車」會 `dispatch(addItem({ ...product, qty }))` 並導向購物車頁。
- **`CartPage`**：`CartPanel` 的整頁版，邏輯完全相同（調整數量、移除、清空、計算小計與總計），多了一個「前往結帳」連結——需不需要先登入，交給 `/checkout` 外層的 `RequireAuth` 處理，這一頁完全不用關心登入狀態。
- **`LoginPage`**：沒有沿用 Day24 的 `<Form action={loginAction}>`，而是回到 Day09 教過的「受控表單 + `onSubmit` + `preventDefault`」寫法，因為今天的登入邏輯是 Redux thunk，不是路由 action。`useSearchParams` 讀出 `RequireAuth` 導過來時附加的 `?from=`，登入成功後用 `useEffect` 監看 `selectIsLoggedIn`，成功就 `navigate(from, { replace: true })`。
- **`CheckoutPage`**：受 `RequireAuth` 保護，能進到這一頁時 `user` slice 一定已經有登入資料，可以放心用 `selectCurrentUser` 預填收件人姓名與 Email。若購物車是空的，顯示空狀態並導回商品列表；送出表單後，用元件內的 `orderId` local state 切換成功畫面，同時 `dispatch(clearCart())`——刻意**不**額外建立 `/order-success` 路由，避免在還沒教過 `navigate(path, { state })` 的情況下畫蛇添足，下單完成的畫面直接用同一個路由、同一個元件的內部狀態切換即可。
- **`NotFoundPage`**：跟 Day22 ～ Day27 一致的 404 頁面，提供一個「回首頁」的連結。

### 5. `router.jsx` / `App.jsx` / `main.jsx`：組裝

```jsx
// router.jsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:productId', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
```

```jsx
// main.jsx：跟 Day26／Day27 一致，多包一層 <Provider store={store}>
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
```

`App.jsx` 跟 Day22 ～ Day24 完全一樣，只負責把 `router.jsx` 建立好的設定交給 `<RouterProvider>` 渲染；Redux 的 `<Provider>` 放在更外層的 `main.jsx`，兩個 Provider 互不影響、各自獨立。

## 八、常見陷阱整理

| 陷阱 | 說明 | 正確理解 |
| --- | --- | --- |
| 以為 `RequireAuth` 一定要靠根路由 `loader` 才能運作 | 沿用 Day24 的寫法時，誤以為沒有 `loader` 就讀不到登入狀態 | Redux store 是路由樹之外的全域單例，任何元件用 `useSelector` 都能直接讀到，不需要額外設計 loader 把資料往下傳 |
| 把 `login`／`logout` 寫成 `reducers` 裡的同步 action | 想省事直接在 `reducers` 裡呼叫 `fetch` 或操作 `localStorage` | `fetch` 與 `localStorage` 都是 side effect，違反 Pure Function Reducer 原則；非同步、有副作用的邏輯一律寫進 `createAsyncThunk` 的 `payloadCreator` |
| `addItem` 忘記處理 `qty` 的預設值 | 商品詳情頁改成「帶 `qty` 加入」後，忘記幫舊的商品列表頁補上預設值 | 用解構預設值 `qty = 1`，沒有帶 `qty` 時自動視為加入 1 件，新舊呼叫方式都相容 |
| 商品詳情頁直接貼網址進來卻空白 | 只在 `ProductListPage` dispatch 過 `fetchProducts()`，忘記使用者可能直接進入 `/products/:id` | `ProductDetailPage` 也要在掛載時 `dispatch(fetchProducts())` 當保險；`condition` 已確保重複呼叫不會真的重打 API |
| 結帳成功後忘記清空購物車 | 只顯示了成功畫面，卻沒有 `dispatch(clearCart())` | 送出訂單成功的同一時間點，一定要記得把購物車清空，否則使用者返回購物車還會看到已經下單的商品 |
| 在 `RequireAuth` 的渲染過程中直接呼叫 `navigate()` | 沒有包進 `useEffect`，React 會丟出「Cannot update a component while rendering a different component」 | 導頁一律是 side effect，必須放進 `useEffect`；渲染階段只能讀資料、回傳 JSX，不能觸發導頁 |
| 以為分類篩選也要像 Day27 一樣呼叫後端 | 把 Day27「依分類呼叫 API」的做法原封不動搬過來 | 資料量小的情境下，client-side `Array.filter` 更單純；是否要交給後端篩選，取決於資料量與是否需要分頁，不是固定公式 |

---

## 九、如何在本機執行範例

範例包含前端（Vite）與後端（Express）兩個各自獨立的 `package.json`，需要分別安裝依賴、分別啟動：

```bash
# 終端機 1：啟動後端 API（http://localhost:4028）
cd Day28/examples/day28-ecommerce-cart-app/server
npm install
npm start
```

```bash
# 終端機 2：啟動前端 Vite 開發伺服器（http://localhost:5173）
cd Day28/examples/day28-ecommerce-cart-app
npm install
npm run dev
```

前端的 `vite.config.js` 已設定 Proxy，把 `/api` 開頭的請求轉發到 `http://localhost:4028`，程式碼裡只需要呼叫相對路徑 `fetch('/api/...')`，不需要處理跨來源（CORS）問題。

打開 `http://localhost:5173/` 後，可以照以下順序操作，體驗完整的購物流程：

1. 首頁瀏覽精選商品，點擊「🛍️ 開始逛商品」進入商品列表。
2. 用分類 chip 篩選商品（例如「音訊」），點擊任一商品進入詳情頁。
3. 在詳情頁調整購買數量，按下「🛒 加入購物車」，會自動導向購物車頁。
4. 在購物車調整數量或移除商品，確認總計金額正確更新。
5. 點擊「前往結帳」：未登入會被導向登入頁，並記得原本要去的 `/checkout`。
6. 用測試帳號 `demo@example.com` / `demo1234` 登入，登入成功會自動導回結帳頁。
7. 在結帳頁填寫收件資訊並送出，確認顯示訂單成功畫面、購物車徽章歸零。
8. 點擊導覽列的「登出」，確認畫面變回顯示「登入」連結。

也可以在前端目錄下執行 `npm run build` 打包正式版本、或 `npm run lint` 用 oxlint 檢查程式碼風格；後端是一支單純的 Express 應用，不需要打包。

## 十一、延伸閱讀

- [Redux Toolkit 官方文件：Usage Guide - Structuring Reducers](https://redux-toolkit.js.org/usage/usage-guide#structuring-reducers)（多個 slice 如何組合成一個 store）
- [React Router 官方文件：Protected Routes](https://reactrouter.com/start/data/route-object#authentication)
