// Day23 範例後端：提供「文章列表」與「文章詳情」兩支端點，讓前端練習
// Nested Routes、動態路由參數 useParams、以及 useNavigate 的「上一篇／
// 下一篇」導頁功能。
//
// 刻意把兩支端點回傳的資料形狀設計成不一樣：
// 1. GET /api/articles：只回傳「摘要」欄位（不含 content 全文），
//    模擬真實世界常見的「列表 API 只給摘要、詳情 API 才給全文」設計，
//    藉此讓文章詳情頁一定要另外呼叫一次 API，而不是直接從列表資料裡挑。
// 2. GET /api/articles/:id：回傳單篇文章全文，並且額外附上 prevId／
//    nextId（依照文章陣列的前後順序計算），讓前端可以直接用來做
//    「上一篇／下一篇」的程式化導頁（useNavigate），不需要自己在前端
//    重新計算順序。
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4023

app.use(cors())

const articles = [
  {
    id: 1,
    title: 'React 19 的 use Hook 到底解決了什麼問題？',
    category: 'react',
    author: '小美',
    publishedAt: '2025-01-08',
    excerpt: '從 Promise 與 Context 的讀取痛點出發，認識 use() 帶來的新寫法。',
    content:
      'React 19 帶來的 use() 是一個能在元件或自訂 Hook 內部「讀取」Promise 或 Context 的新函式，它跟 useState、useEffect 這些傳統 Hook 最大的不同，是可以寫在條件式（if）或迴圈裡面呼叫，不受 Hooks 規則「只能寫在最上層」的限制。\n\n在 use() 出現之前，如果想要在元件裡等待一個非同步資料，通常需要搭配 useEffect 把資料存進 state，再判斷 loading／error／success 三種狀態分別渲染畫面，程式碼容易變得又長又重複。use() 搭配 Suspense 之後，可以把「等待中要顯示什麼」的邏輯，統一交給外層的 <Suspense> 元件處理，元件本身只需要專心處理拿到資料之後的畫面。\n\n值得注意的是，use() 讀取的 Promise 通常來自元件外層（例如伺服器端渲染、或是上層元件先發起的請求），而不是在元件內部臨時建立一個新的 Promise——如果每次渲染都建立新的 Promise，會導致 Suspense 不斷重新進入載入狀態，這是實際使用時最容易踩到的陷阱。',
  },
  {
    id: 2,
    title: 'useEffect 的依賴陣列，你真的用對了嗎？',
    category: 'react',
    author: '阿凱',
    publishedAt: '2025-01-15',
    excerpt: '依賴陣列不是「想加什麼就加什麼」，搞懂它跟 Cleanup 函式的關係。',
    content:
      'useEffect 的第二個參數（依賴陣列）決定了「這個副作用什麼時候該重新執行」。很多初學者會把依賴陣列當成「我想要在什麼時候執行」的許願清單，但正確的心智模型應該反過來：依賴陣列裡列出的，是這段程式碼「用到了哪些會隨渲染改變的變數」，React 會照實比對這些值，只要有任何一個改變，就重新執行一次這個 Effect。\n\n如果不小心漏列了某個實際上有用到的變數，程式碼在開發階段可能看起來一切正常，卻會在特定情境下讀到「過期」的值，這種 bug 往往很難重現、也很難察覺。反過來，如果為了讓 ESLint 不要顯示警告，把用不到的變數硬塞進依賴陣列，則可能造成 Effect 過度頻繁地重新執行。\n\n另外，只要 Effect 裡面訂閱了計時器、事件監聽或是外部連線，就必須回傳一個 Cleanup 函式，在下一次執行 Effect 之前、或是元件卸載時，把上一次訂閱的東西清乾淨，這樣才不會累積出重複訂閱、記憶體洩漏等問題。',
  },
  {
    id: 3,
    title: '從 useState 到 useReducer：什麼時候該換工具？',
    category: 'react',
    author: '小美',
    publishedAt: '2025-01-22',
    excerpt: '當一個元件裡的 state 更新邏輯開始互相牽扯，就是考慮 useReducer 的時機。',
    content:
      'useState 很適合處理彼此獨立、互不影響的簡單狀態，例如一個輸入框的文字、一個開關的布林值。但當一個元件裡有好幾個 state，而且它們的更新邏輯會互相牽扯——例如「新增一筆資料」同時要重設另一個欄位、增加總數、清空錯誤訊息——這時候如果每個 state 都各自用 setXxx 更新，很容易漏掉某個步驟，或是讓更新邏輯散落在元件各處。\n\nuseReducer 把「怎麼更新 state」的邏輯，集中寫成一個 pure function（reducer），元件裡只需要 dispatch 一個描述「發生了什麼事」的 action，實際上要怎麼變化 state，全部交給 reducer 統一處理。這種「描述事件、而不是直接命令怎麼做」的寫法，其實正是之後會學到的 Redux 核心概念的雛型。\n\n判斷要不要換成 useReducer，可以用一個簡單的原則：如果你發現自己在元件裡寫了三個以上互相關聯的 setState，或是同一個操作需要同時更新好幾個 state，那就是考慮 useReducer 的時機。',
  },
  {
    id: 4,
    title: 'Declarative Mode 與 Data Mode：React Router 該選哪一種？',
    category: 'router',
    author: '志明',
    publishedAt: '2025-02-02',
    excerpt: '兩種建立路由的方式，效果看起來很像，但資料載入能力差很多。',
    content:
      'Declarative Mode（<BrowserRouter> + <Routes> + <Route>）與 Data Mode（createBrowserRouter + RouterProvider）兩者在「純粹換頁」這件事情上，寫出來的使用體驗幾乎一樣：一樣可以用 <Link>、<NavLink> 導覽，一樣可以用 useNavigate 做程式化導頁。差異要放大來看才看得出來。\n\n最關鍵的差異在於資料載入的能力。Data Mode 因為路由是用一份 JavaScript 物件陣列描述，所以可以在每一筆路由上額外掛上 loader（進入頁面前先載入資料）與 action（處理表單送出），這些能力在 Declarative Mode 下完全沒有——因為 Declarative Mode 的路由是用 JSX 元件樹描述，沒有一個「資料層」可以掛載這些設定。\n\n如果專案一開始就預期之後會需要處理資料載入、表單送出，或是路由守衛（登入驗證）等進階需求，一開始就選擇 Data Mode，可以避免日後把整個路由架構打掉重練。',
  },
  {
    id: 5,
    title: '巢狀路由與 Outlet：如何設計共用的 Layout？',
    category: 'router',
    author: '志明',
    publishedAt: '2025-02-09',
    excerpt: '把 Layout 從「手動包每個頁面」升級成「巢狀路由自動組裝」。',
    content:
      '在還沒有巢狀路由之前，如果想讓好幾個頁面共用同一份導覽列，最直覺的做法是寫一個 Layout 元件，讓它接收 children，然後在每一筆路由設定裡，把對應的頁面元件手動包進 <Layout> 裡面。這樣寫完全可以動，但路由一多，每一筆都要重複包一次 Layout，而且如果想要「只有某一群頁面」共用另一層 Layout（例如今天範例的文章分類側欄），這種手動包裝的寫法會變得很難維護。\n\n巢狀路由把「畫面骨架」跟「路由設定」合而為一：只要把 Layout 元件放在父層路由的 element，把其他頁面放進它的 children 陣列，React Router 就會在畫出 Layout 的同時，自動把目前比對到的子路由渲染進 Layout 裡的 <Outlet /> 位置。\n\n更棒的是巢狀路由可以疊很多層：最外層可以放一個「全站都要有」的導覽列，裡面再疊一層只有某個功能模組（例如文章、後台管理）才需要的側欄或分頁籤，兩層各自獨立維護，互不干擾。',
  },
  {
    id: 6,
    title: 'useParams、useNavigate、useSearchParams 三兄弟比一比',
    category: 'router',
    author: '小雨',
    publishedAt: '2025-02-16',
    excerpt: '同樣是跟網址打交道，這三個 Hook 分別負責什麼工作？',
    content:
      '這三個 Hook 都跟「網址」有關，但職責分工很清楚。useParams 負責讀「路徑」裡的動態片段，例如路由設定 /articles/:articleId 比對到 /articles/7 時，useParams() 會回傳 { articleId: "7" }——它是唯讀的，沒有辦法用它來改變網址。\n\nuseNavigate 負責「主動換頁」，回傳一個函式，呼叫它就能像使用者點擊連結一樣，把瀏覽器導向另一個網址，甚至可以呼叫 navigate(-1) 回到上一頁。它通常用在「使用者做了某個操作之後，程式決定要換頁」的情境，例如表單送出成功、或是像今天範例的「上一篇／下一篇」按鈕。\n\nuseSearchParams 負責讀寫網址「問號後面」的查詢字串（search／query string），例如 ?category=react&q=hook。它回傳的是一個 [searchParams, setSearchParams] 的 tuple，寫法跟 useState 很像，但呼叫 setSearchParams 除了更新這個值，還會真的觸發一次瀏覽器導頁，把新的查詢字串寫進網址列。',
  },
  {
    id: 7,
    title: '淺談 JavaScript 的事件迴圈（Event Loop）',
    category: 'javascript',
    author: '阿凱',
    publishedAt: '2025-02-23',
    excerpt: '為什麼 setTimeout(fn, 0) 不會馬上執行？從 Call Stack 講起。',
    content:
      'JavaScript 是單執行緒（Single-threaded）的語言，同一時間只能做一件事，但瀏覽器裡卻可以同時處理使用者點擊、動畫、網路請求，看起來像是「同時」在進行——這背後的關鍵機制就是事件迴圈（Event Loop）。\n\n當程式執行到 setTimeout(fn, 0) 時，fn 並不會馬上被放進「目前正在執行」的 Call Stack，而是先被丟進一個計時器佇列，等待指定的時間到了之後，才會被搬進「任務佇列」等待執行。事件迴圈的工作，就是不斷檢查 Call Stack 是不是空的，只要空了，就從任務佇列裡拿出下一個任務放進去執行。\n\n這也是為什麼即使把 delay 設成 0，setTimeout 裡的程式碼還是會等到目前這一輪同步程式碼全部執行完畢之後才會執行——它排隊的位置，永遠在目前正在跑的程式碼後面。',
  },
  {
    id: 8,
    title: '從 var 到 let/const：認識 JavaScript 的變數作用域',
    category: 'javascript',
    author: '小雨',
    publishedAt: '2025-03-02',
    excerpt: 'Function Scope 與 Block Scope 的差異，以及暫時性死區是什麼。',
    content:
      'var 宣告的變數是 Function Scope（函式作用域）：只要在同一個函式裡，不管寫在哪一層的 if 或 for 迴圈裡面，宣告出來的變數都會被視為整個函式共用。這常常造成一種常見的錯誤：在迴圈裡用 var 宣告的變數，跑完迴圈之後，外面還是讀得到、甚至還可能被非預期地覆蓋。\n\nlet 與 const 改成 Block Scope（區塊作用域）：只要是用大括號 {} 包起來的區塊（if、for、單純的 {}），裡面宣告的變數，離開這個區塊之後就讀不到了，行為更符合大多數人的直覺。const 則是在 let 的基礎上，多了一條「不能重新賦值」的限制（但如果值是物件或陣列，內容本身還是可以被修改）。\n\n另外要留意「暫時性死區」（Temporal Dead Zone）：用 let/const 宣告的變數，在程式碼真正執行到宣告那一行之前，是完全不能被存取的，這跟 var 會被「提升」（Hoisting）成 undefined 的行為不一樣，提早存取 let/const 變數會直接拋出錯誤，而不是得到一個 undefined。',
  },
  {
    id: 9,
    title: '為什麼 Vite 的開發伺服器啟動速度這麼快？',
    category: 'vite',
    author: '小美',
    publishedAt: '2025-03-09',
    excerpt: '從 Bundle-based 到 Native ESM，理解 Vite 開發模式的核心概念。',
    content:
      '傳統的打包工具（Bundler，例如 Webpack）在開發模式下，也需要先把整個專案的模組相依關係全部分析、打包成一份或多份檔案，瀏覽器才能載入執行——專案越大，這個打包的時間就越長，每次改一行程式碼都要重新打包一次。\n\nVite 在開發模式下採取完全不同的策略：它不會事先把所有模組打包起來，而是利用瀏覽器原生支援的 ES Modules（也就是 import/export 語法），只在瀏覽器真正 import 某個模組時，才即時把那個檔案處理、回傳過去。這種「隨用隨編譯」（Native ESM）的做法，讓專案不管多大，開發伺服器的啟動速度都幾乎不受影響。\n\n至於正式打包（npm run build），Vite 底層則是改用 Rollup（或更新版本裡的 Rolldown）把所有模組打包、壓縮成適合生產環境使用的檔案，兼顧了開發階段的啟動速度，跟正式環境的載入效能。',
  },
  {
    id: 10,
    title: '認識 Vite 的 Proxy 設定：解決開發階段的跨來源問題',
    category: 'vite',
    author: '志明',
    publishedAt: '2025-03-16',
    excerpt: 'server.proxy 到底做了什麼事？為什麼前端可以直接呼叫相對路徑？',
    content:
      '開發階段常常會遇到「前端」跟「後端」跑在不同的 port 上（例如前端 http://localhost:5173、後端 http://localhost:4023），如果前端程式碼直接 fetch 後端的完整網址，瀏覽器會因為網域（或 port）不同，觸發跨來源請求（CORS）的安全限制，除非後端有正確設定回應標頭，否則請求會被瀏覽器擋下來。\n\nVite 的 server.proxy 設定，等於是在開發伺服器裡加開一道「內部轉發」的通道：只要前端呼叫的路徑符合 proxy 設定的規則（例如 /api 開頭），Vite 開發伺服器就會代替瀏覽器，把這個請求轉發到真正的後端網址，再把後端的回應原封不動地帶回來。對瀏覽器來說，這個請求從頭到尾都只跟 Vite 開發伺服器（同一個 port）溝通，自然不會有跨來源的問題。\n\n要留意的是，這個 proxy 設定只在開發模式（npm run dev，以及本篇範例也一併設定的 npm run preview）下有效；正式部署上線時，通常需要改成在正式的伺服器或 CDN 設定層級處理跨來源或反向代理，這部分會在 Day30 部署章節再進一步說明。',
  },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// GET /api/articles：只回傳摘要欄位（不含 content），供文章列表頁使用。
app.get('/api/articles', async (req, res) => {
  console.log('[day23-nested-routes-lab] GET /api/articles')

  await delay(300)

  const summaries = articles.map(({ id, title, category, author, publishedAt, excerpt }) => ({
    id,
    title,
    category,
    author,
    publishedAt,
    excerpt,
  }))

  res.json({ articles: summaries })
})

// GET /api/articles/:id：回傳單篇文章全文 + prevId／nextId（依陣列順序計算）。
app.get('/api/articles/:id', async (req, res) => {
  const articleId = Number(req.params.id)

  console.log(`[day23-nested-routes-lab] GET /api/articles/${req.params.id}`)

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

app.listen(PORT, () => {
  console.log(`[day23-nested-routes-lab] Express server ready at http://localhost:${PORT}`)
})
