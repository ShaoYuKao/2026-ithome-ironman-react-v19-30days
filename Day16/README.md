# Day 16｜`useTransition` 與 `useDeferredValue`

- 今日範例程式碼：[`Day16\examples\day16-transition-deferred-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day16/examples/day16-transition-deferred-lab)

## 一、為什麼需要這兩個 Hook：先搞懂 Concurrent Rendering（並行渲染）

### 1. Day15 的優化解決不了的問題

Day15 學過 `useMemo`／`useCallback`／`React.memo`，三者合體可以做到「**不相關**的更新（例如心跳計時器）不要觸發昂貴計算」。但如果今天這次更新**本身就是相關的**呢？

想像一個搜尋框：使用者在輸入框裡打字，每打一個字，就要立刻用這個關鍵字，重新篩選、重新排序一份很大的清單。這裡的「篩選＋排序」不是無關的計算，它**必須**因為 `keyword` 改變而重新執行——`useMemo` 在這裡完全幫不上忙，因為 `keyword`（依賴項）每次都真的變了。

但如果篩選＋排序這段計算要花 50 毫秒，會發生什麼事？在 React 18 之前，答案是：**使用者敲下按鍵，到畫面上看到那個字出現在輸入框裡，中間會被迫多等 50 毫秒**。原因跟 Day15 學過的「Render Phase => Commit Phase」有關：`setKeyword(newValue)` 觸發的重新渲染，是「一個不可分割的整體」——React 必須先完整跑完這次渲染（包含裡面所有計算），才會把結果 Commit 到畫面上，讓瀏覽器有機會重繪、讓使用者看到剛剛打的字。只要這次渲染裡夾帶了一段耗時的計算，**連輸入框本身要更新這件小事，都得一起排隊等待**。

### 2. 緊急更新 vs 過渡更新

React 18 引入的 **Concurrent Rendering（並行渲染）**，讓 React 有能力把一次渲染工作拆分成很多個小單位，並且在單位與單位之間「喘口氣」，檢查有沒有更緊急的工作插隊。搭配這個能力，React 開放讓開發者把一次狀態更新，明確標記成兩種優先權之一：

| 類型 | 特性 | 範例 |
| --- | --- | --- |
| **緊急更新（Urgent Update）** | 預設的更新方式；React 認為使用者期待「立刻」看到結果，會盡快完成、盡快 Commit | 在輸入框打字、按下按鈕的視覺回饋（例如按鈕變色） |
| **過渡更新（Transition Update）** | 開發者手動標記；React 允許它「晚一點」才完成，過程中可以被新進來的緊急更新插隊、甚至可以被更新的過渡更新直接取代、放棄重來 | 根據剛剛打的關鍵字，重新篩選一份大清單並顯示結果 |

今天的 `useTransition` 與 `useDeferredValue`，就是 React 提供給開發者「標記某個更新是過渡更新」的兩種不同介面——一個是「標記一段程式碼（一次 `setState` 呼叫）」，另一個是「標記一個值」。

> 💡 **重要觀念**：這兩個 Hook **不會讓昂貴計算本身跑得更快**，該花的 CPU 時間一秒都不會少。它們改變的是「排程」：讓瀏覽器有機會先完成緊急更新（讓輸入框立刻反應），再利用瀏覽器的空閒時間，去完成那些被標記為過渡更新的、比較不緊急的重新渲染。

## 二、`useDeferredValue`：延遲一個「值」的更新

### 1. 基本語法

```js
const deferredValue = useDeferredValue(value, initialValue?);
```

> 讓某個值的更新延後到更重要的畫面更新完成後才處理，用於延遲渲染非關鍵的 UI 部分（例如大量列表），以維持介面反應性。

用一句白話理解它在做什麼：**`useDeferredValue(value)` 會回傳同一個值的「延遲分身」**——平常這個分身跟原本的 `value` 長得一模一樣；但只要 React 正忙著處理更緊急的更新（例如你還在打字），它就會讓分身先「停留在舊的樣子」，等瀏覽器有餘裕了，才在背景把分身悄悄更新成最新的 `value`，並觸發一次不會卡住畫面的重新渲染。

你可以把它想像成「原始值」跟「延遲值」兩條看板：

| 看板 | 內容 |
| --- | --- |
| `keyword`（原始值） | 永遠等於使用者這一秒實際打出來的字，馬上更新 |
| `deferredKeyword`（延遲值） | 大多數時候跟 `keyword` 一樣；只有系統忙碌時才會「慢半拍」，稍後自動追上 |

只要記得：**這個 Hook 幫你多要一份「可以晚一點更新」的值，讓依賴它的畫面不用逼著跟輸入框同一時間更新**。

拆解使用方式：

```jsx
function ContactSearch({ contacts }) {
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)

  return (
    <>
      {/* value 綁定 keyword：輸入框永遠立即反應每一次按鍵 */}
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />

      {/* 清單用 deferredKeyword：這個值的更新「可以」晚一點才發生 */}
      <SearchResults contacts={contacts} keyword={deferredKeyword} />
    </>
  )
}
```

`keyword`、`deferredKeyword` 這兩個變數，多數時候值是相同的；只有在 `keyword` 剛改變、但 React 還在忙著處理更緊急的工作時，`deferredKeyword` 才會「暫時停留在舊值」，等到瀏覽器有餘裕，React 才會在背景用新的 `keyword` 重新渲染一次，這時 `deferredKeyword` 才會追上最新的 `keyword`。

### 2. `isStale`：判斷「畫面是不是還沒跟上」

一個常見的搭配寫法，是自己算出一個「是否過期」的旗標：

```jsx
const isStale = keyword !== deferredKeyword
```

`isStale` 為 `true`，代表「使用者已經打了新的關鍵字，但畫面上的搜尋結果，還是根據上一個關鍵字算出來的」——這時候通常會加一點視覺提示（例如把結果區域調淡、加一個「更新中」的小字），讓使用者知道「這不是壞掉了，只是還在補上而已」。

### 3. 為什麼「必須」搭配 `memo` 才能真正發揮效果

單獨使用 `useDeferredValue`，如果拿 `deferredKeyword` 的元件沒有用 `memo` 包住，`useDeferredValue` 帶來的效果會大打折扣：

```jsx
// ❌ SearchResults 沒有用 memo 包住：
// 即使 deferredKeyword 這個 prop 還沒改變，父層一重新渲染，
// SearchResults 依然會被迫重新執行一次（就算最後結果被丟棄也一樣）
function SearchResults({ contacts, keyword }) { /* ... */ }
```

```jsx
// ✅ 用 memo 包住之後，只要 deferredKeyword 還沒真正改變，
// React 就有機會直接跳過 SearchResults 的重新渲染，
// 這正是 Day15 學過的「React.memo 判斷 props 是否改變」在這裡的實際應用
const SearchResults = memo(function SearchResults({ contacts, keyword }) {
  /* ... */
})
```

這也是為什麼 `useDeferredValue` 常常被拿來跟 Day15 的 `React.memo` 放在一起討論——`useDeferredValue` 負責「延後某個值的更新時機」，`memo` 負責「讓元件在這個值還沒真的改變之前，有資格跳過重新渲染」，兩者搭配才是完整的優化。

### 4. 跟 Debounce／Throttle 的關鍵差異

初學者很容易把 `useDeferredValue` 誤會成「跟 `debounce`（防抖）差不多的東西」，但兩者的行為本質不同：

| 比較項目 | `useDeferredValue` | Debounce（防抖） |
| --- | --- | --- |
| 是否會「跳過」中間的輸入值 | 不會，最終一定會用「使用者實際打出來的最新值」渲染一次 | 會，如果使用者在等待時間內又打了新字，前一次排定的執行會被取消 |
| 延遲時間是否固定 | 不固定，取決於當下瀏覽器、裝置的忙碌程度（裝置越快、延遲越短，甚至可能感覺不出延遲） | 固定（例如「停止打字 300 毫秒後才執行」），跟裝置效能無關 |
| 適合的情境 | CPU 密集的**渲染**工作（例如篩選、排序大量資料後顯示） | 需要**減少呼叫次數**的情境（例如打字時不要每個按鍵都發送一次 API 請求） |
| 是否需要額外設定「時間」 | 不需要，交給 React 自行判斷排程 | 需要開發者自己決定一個等待毫秒數 |

簡單來說：**Debounce 是「減少執行次數」，`useDeferredValue` 是「調整同一次執行的優先權」**。如果情境是「打字時不要每次都打 API」，該用的是 Debounce；如果情境是「打字時不要因為畫面重新渲染太貴而卡頓」，才是 `useDeferredValue` 該出場的地方。

## 三、`useTransition`：把一次「狀態更新」標記為過渡

### 1. 基本語法

```js
const [isPending, startTransition] = useTransition();
```

> 將某次狀態更新標記為「非阻塞」的過渡更新（transition），使其可以被之後更緊急的更新（如使用者輸入）中斷，`isPending` 表示過渡是否仍在進行中。

查閱 [`react/packages/react/src/ReactHooks.js`](https://github.com/react/react/blob/main/packages/react/src/ReactHooks.js) 原始碼可以看到回傳型別的定義：

```js
export function useTransition(): [
  boolean,
  (callback: () => void, options?: StartTransitionOptions) => void,
] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useTransition();
}
```

回傳一個陣列：

- `isPending`：布林值，代表「這個過渡更新是否還在進行中」。
- `startTransition`：一個函式，接收一個「回呼函式（callback）」，回呼函式裡呼叫的每一個 `setState`，都會被標記成過渡更新。

### 2. 為什麼需要「拆成兩份 state」

跟 `useDeferredValue` 一樣，`useTransition` 也需要把「驅動輸入框畫面」跟「真正拿去做昂貴計算」的值分開，只是拆法不同——不是用一個 Hook 算出「延遲」的值，而是**手動維護兩個獨立的 state**：

```jsx
function ContactSearch({ contacts }) {
  const [keyword, setKeyword] = useState('')             // 驅動 <input> 畫面，一定要立即更新
  const [appliedKeyword, setAppliedKeyword] = useState('') // 真正拿去搜尋的關鍵字
  const [isPending, startTransition] = useTransition()

  function handleChange(event) {
    const value = event.target.value
    setKeyword(value) // 緊急更新：input 立刻顯示這個字
    startTransition(() => {
      setAppliedKeyword(value) // 過渡更新：可以晚一點，可以被下一次輸入打斷、取代
    })
  }

  return (
    <>
      <input value={keyword} onChange={handleChange} />
      {isPending && <p>🔄 搜尋中……</p>}
      <SearchResults contacts={contacts} keyword={appliedKeyword} />
    </>
  )
}
```

> ⚠️ **常見陷阱**：如果偷懶把 `setKeyword` 本身也包進 `startTransition`（也就是只用一份 state，靠 `startTransition` 更新它，再把它同時綁定給 `<input>` 的 `value`），會導致**輸入框本身的顯示也被延後**——因為 `keyword` 這個值變成了過渡更新的一部分，React 可能會暫時不更新它，使用者會感覺自己打的字「慢半拍」才出現，這正好跟原本想解決的問題背道而馳。`startTransition` 應該只包住「衍生出來的、可以晚一點處理」的更新，驅動使用者正在直接操作的那個 UI 元素（這裡是輸入框）的 state，永遠應該維持緊急更新。

### 3. `startTransition` 的使用限制

`startTransition`（不管是 `useTransition` 回傳的那一個，還是 `react` 套件直接匯出的獨立函式 `startTransition`）只能包住**同步**執行的 `setState` 呼叫：

```jsx
// ✅ 可以：回呼函式裡直接同步呼叫 setState
startTransition(() => {
  setAppliedKeyword(value)
})

// ❌ 不行：await 之後的程式碼，已經脫離了這次 startTransition 的同步執行範圍，
// 這裡的 setAppliedKeyword 不會被視為過渡更新
startTransition(async () => {
  const result = await fetchSomething()
  setAppliedKeyword(result) // 不會被標記成過渡更新
})
```

如果需要處理非同步操作（例如表單送出後等待伺服器回應），那是之後會學到的 `useActionState`／`useOptimistic` 要解決的問題，跟今天的 `useTransition` 定位不同——今天處理的是「同步、但計算量大」的更新排程，`useActionState`／`useOptimistic` 處理的是「非同步、需要等待結果」的狀態管理。

### 4. `isPending`：`useDeferredValue` 沒有、但 `useTransition` 天生就有的能力

`useDeferredValue` 只能靠自己比較 `value !== deferredValue` 來「推算」是否過期；`useTransition` 則是**內建**一個明確的 `isPending` 旗標，不需要自己額外計算，語意也更清楚：「現在有一個過渡更新還沒完成」。這讓 `useTransition` 特別適合用來顯示明確的 Loading／處理中效果。

## 四、兩者的比較：什麼時候用哪一個

| 比較項目 | `useDeferredValue` | `useTransition` |
| --- | --- | --- |
| 標記的對象 | 一個「值」 | 一段「程式碼（`setState` 呼叫）」 |
| 需要幾份 state | 通常 1 份（用 Hook 算出延遲） | 通常 2 份（自己手動拆成緊急／過渡兩份） |
| 是否內建 `isPending` | 沒有，需要自己算 `value !== deferredValue` | 有，直接回傳 |
| 使用時機 | 已經有一個「別人傳進來的值」（例如 props、Context），只想延後拿它去做昂貴渲染的時機 | 自己就是觸發更新的那一方，可以在事件處理函式裡决定「這次更新要不要標記成過渡」 |
| 常見情境 | 搜尋結果清單、根據某個 prop 值渲染的昂貴子元件 | 分頁／Tab 切換、送出後才顯示的大量資料、任何「自己觸發」的過渡更新 |

實務上兩者常常可以做到幾乎一樣的效果（今天的範例就會示範同一個搜尋情境，用兩種寫法各做一次），選擇哪一個，取決於「你比較容易拿到的是一個值，還是一段可以自己包起來的程式碼」。

## 五、今日範例

### 5.1 這個範例想驗證的核心問題

打開範例會看到一個聯絡人搜尋頁面，上方是分頁切換（無優化／`useDeferredValue`／`useTransition`），輸入框可以搜尋姓名、Email、城市、部門。整個範例想驗證的問題只有一個：**同樣是一段很花時間的搜尋計算，被觸發的方式（有沒有標記成過渡更新）會不會影響「打字」這個動作本身的手感？**

- **無優化**：會，輸入框本身會被拖著一起變慢，打字有明顯的延遲、卡頓感。
- **`useDeferredValue`／`useTransition`**：不會，輸入框永遠即時反應，變慢的只有「搜尋結果清單什麼時候更新」這件事。

### 5.2 刻意設計得「很花時間」的搜尋

```js
// src/utils/searchContacts.js
const SLOW_LOOP_ITERATIONS = 1200

function computeRelevance(contact, keyword) {
  let score = contact.id
  for (let i = 0; i < SLOW_LOOP_ITERATIONS; i++) {
    score = Math.sqrt(score * 1.000001 + (i % 7))
  }
  return keyword && contact.name.startsWith(keyword) ? score + 1000 : score
}

export function searchContacts(contacts, keyword) {
  const start = performance.now()
  const trimmedKeyword = keyword.trim()
  const results = []

  for (const contact of contacts) {
    // 關鍵設計：不管這筆聯絡人最後符不符合關鍵字，都先無條件算一次分數——
    // 模擬真實世界全文搜尋「要先掃描、比對過每一筆資料」的成本模型，
    // 確保這段計算不會因為關鍵字篩選後剩下的筆數變少，成本就跟著變少。
    const relevance = computeRelevance(contact, trimmedKeyword)
    const isMatch = trimmedKeyword === '' || contact.name.includes(trimmedKeyword) /* ...其餘欄位 */
    if (isMatch) results.push({ ...contact, relevance })
  }

  results.sort((a, b) => b.relevance - a.relevance)
  const duration = performance.now() - start
  return { list: results, duration }
}
```

跟 Day15 的 `filterAndSortProducts` 一樣，這是一段「刻意寫得沒辦法被瀏覽器一瞬間跳過」的計算，在一般筆電上，搜尋 6,000 筆資料一次大約會花費 40～90 毫秒——這個等級的耗時，對「無優化」版本來說，就是每次打字都必須忍受的延遲。

### 5.3 三種寫法，同一份搜尋邏輯

**無優化**：最直覺的寫法，`onChange` 直接 `setKeyword`，同一次渲染裡同步呼叫 `searchContacts`：

```jsx
// src/components/SyncSearchBoard.jsx
function SyncSearchBoard({ contacts }) {
  const [keyword, setKeyword] = useState('')
  // 👇 沒有任何延遲或過渡標記：這一行會直接擋住這次渲染，
  // 也就擋住了輸入框顯示新按鍵這件事
  const { list, duration } = searchContacts(contacts, keyword)

  return (
    <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
    /* ...渲染 list... */
  )
}
```

**`useDeferredValue`**：

```jsx
// src/components/DeferredSearchBoard.jsx
function DeferredSearchBoard({ contacts }) {
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)
  const isStale = keyword !== deferredKeyword

  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      {isStale && <p>⏳ 結果正在背景重新計算中……</p>}
      <MemoContactResultsList contacts={contacts} keyword={deferredKeyword} />
    </>
  )
}
```

**`useTransition`**：

```jsx
// src/components/TransitionSearchBoard.jsx
function TransitionSearchBoard({ contacts }) {
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(event) {
    const value = event.target.value
    setKeyword(value)
    startTransition(() => setAppliedKeyword(value))
  }

  return (
    <>
      <input value={keyword} onChange={handleChange} />
      {isPending && <p>🔄 搜尋中……</p>}
      <MemoContactResultsList contacts={contacts} keyword={appliedKeyword} />
    </>
  )
}
```

`MemoContactResultsList`（`ContactResultsList.jsx`）是同一個、用 `memo` 包住的清單元件，被 `useDeferredValue` 與 `useTransition` 兩個版本共用——兩者的差異，完全不在「怎麼畫清單」，而在「父層用什麼機制，決定何時更新傳給它的 `keyword` 這個 prop」，這正是下一節比較表格想強調的重點。

### 5.4. 讓「總耗時」看得見：即時輸入延遲量測面板

只憑「手感」很難公平比較三個版本——有人覺得快、有人覺得看不出差異，而且瀏覽器自動化工具量測出來的數字，常常跟直覺對不上。所以範例裡加了一個共用的 `useTypingLatency.js`(`src/utils/useTypingLatency.js`) Hook，搭配 `LatencyMeter.jsx`(`src/components/LatencyMeter.jsx`) 面板，讓三個版本都能**即時顯示「這一鍵，使用者真正等了多久」**，不用再憑感覺猜。

量測原理只依賴一件事：驅動 `<input value={keyword} />` 畫面的那個 `keyword` state 什麼時候「真正被畫出來」：

```js
// src/utils/useTypingLatency.js
useLayoutEffect(() => {
  if (pendingSinceRef.current == null) return
  const keyEventTime = pendingSinceRef.current
  pendingSinceRef.current = null

  // Commit 已經完成，但「更新」跟「瀏覽器真正畫出下一幀」還有一段距離，
  // 用 requestAnimationFrame 抓到那個「真正被畫出來」的時間點。
  requestAnimationFrame(() => {
    const latency = performance.now() - keyEventTime
    setHistory((prev) => [...prev.slice(-(HISTORY_SIZE - 1)), latency])
  })
}, [displayValue])
```

三個 Board 元件都在 `onChange` 裡呼叫 `markKeyEvent(event)` 記下這次按鍵的 `event.timeStamp`，然後才呼叫各自的 `setKeyword`／`startTransition`。因為量測對象永遠是「同一份驅動輸入框畫面的 state」，三個版本的數字才具有可比較性——打開任何一個分頁，`LatencyMeter` 面板都會秀出「上一鍵實際延遲」與「最近 5 鍵加總」，直接對應第 5.5 節表格裡的「總耗時」。

### 5.5 用瀏覽器實際感受實測

打開 `npm run dev`，依序切到三個分頁，都用同樣的方式操作：**把游標移到輸入框，快速連續打字**（不要一個字一個字慢慢打）：

1. 切到「無優化」分頁快速打字：可以感覺到明顯的延遲，畫面上的字好像是「一批一批」才跳出來，而不是跟著手指的速度即時出現；同時留意 `LatencyMeter` 面板的數字持續維持在高檔。
2. 切到「`useDeferredValue`」分頁快速打字：輸入框本身完全跟手，`LatencyMeter` 的數字明顯低很多；清單結果會有短暫的「淡出、維持舊結果」效果，等你停下來一下下，結果才會補上。
3. 切到「`useTransition`」分頁快速打字：輸入框一樣完全跟手，`LatencyMeter` 的數字同樣明顯偏低；同時會看到「🔄 搜尋中……」的提示文字出現、消失，比 `useDeferredValue` 多了一個明確的處理中訊號。

**量測方式**：每個版本都重新整理頁面（避免同一個分頁測太多次，讓 `searchContacts` 被瀏覽器 V8 JIT 優化到不合理地快，反而失真），連續打 5 個字（如：`陳林黃張李`），讀出 `LatencyMeter` 顯示的「連續打 5 個字加總」總耗時。

幾個值得注意的重點：

- **無優化版本的數字非常穩定、而且持續偏高**，因為它沒有任何「拆分」機制：每一次按鍵，都得完整付一次 `searchContacts` 的成本，5 鍵幾乎是 5 倍疊加。
- **`useDeferredValue`／`useTransition` 平均明顯低很多，但每次測出來的數字波動較大**（甚至偶爾會跟無優化版本比較接近）。原因跟 `computeRelevance` 的寫法有關：它是「一整段不能中斷的同步迴圈」，`useTransition`／`useDeferredValue` 只能決定「這段計算什麼時候開始跑、能不能被更新的按鍵放棄重跑」，**不能讓瀏覽器在計算跑到一半時，插隊先把使用者剛剛按下的下一個字畫出來**——如果你按下下一個鍵的時間點，正好跟這段背景計算「已經開始執行」的區間重疊，那一鍵一樣得等它跑完，才輪得到畫面更新。這正是為什麼多次測量的結果會有落差：關鍵不是「這個 Hook 有沒有用」，而是「這次按鍵的時間點，有沒有恰好撞上一段還在執行中的背景計算」。

> 💡 開發模式下因為 `<StrictMode>` 會讓每個元件多執行一次渲染，實測數字可能比正式打包後的版本略高，但「趨勢」（無優化明顯慢很多、兩種優化都大幅改善）完全一致。

---

## 六、常見陷阱整理

| 陷阱 | 說明 | 對策 |
| --- | --- | --- |
| 把驅動 `<input>` 畫面的那份 state，也包進 `startTransition` 或用 `useDeferredValue` 包起來，直接綁定給 `value` | 輸入框本身的顯示也會被延後，使用者會感覺自己打的字「慢半拍」才出現，完全違背了想解決的問題 | 一定要拆成兩份：一份「驅動使用者正在操作的 UI」的 state，永遠用一般 `setState`（緊急更新）；另一份「衍生出來的、真正拿去做昂貴渲染」的值，才用 `useDeferredValue`／`startTransition` | 
| 使用 `useDeferredValue`，卻沒有把接收 `deferredValue` 的元件用 `memo` 包住 | React 沒辦法在「值還沒真的改變」的那次背景渲染裡跳過這個元件，昂貴計算依然會被重複執行，只是排程上稍微晚一點而已，優化效果大打折扣 | 拿 `deferredValue` 當 props 的元件，記得用 `memo` 包住（複習 Day15） |
| 在 `startTransition(async () => { ... })` 裡，把 `await` 之後的 `setState` 也當成過渡更新 | `await` 之後的程式碼已經脫離了 `startTransition` 同步執行的範圍，React 不會把它標記成過渡更新，`isPending` 的行為也可能不如預期 | `startTransition` 只包住同步的 `setState`；牽涉非同步請求的情境，改用 Day18 會學到的 `useActionState`／`useOptimistic` |
| 把 `useDeferredValue` 誤當成 `debounce` 使用，以為可以拿它來「減少 API 呼叫次數」 | `useDeferredValue` 最終一定會用使用者實際輸入的最新值渲染一次，不會像 `debounce` 一樣「跳過」中間值；如果目的是減少呼叫次數（例如打字時不要每個按鍵都打一次 API），這裡用錯了工具 | 需要「減少執行次數」用 `debounce`／`throttle`；需要「不要因為渲染太貴而卡住互動」才用 `useDeferredValue`／`useTransition` |
| 誤以為這兩個 Hook 能讓昂貴的計算本身變快，拿來當作效能優化的萬靈丹，而不去思考計算本身能不能變快（例如用 Day15 的 `useMemo` 快取、或改良演算法） | 兩者解決的是「排程」問題，不是「運算量」問題；如果計算量真的大到連背景渲染都持續卡住主執行緒，使用者依然會感覺到明顯延遲 | 兩者應該搭配 Day15 學過的 `useMemo` 一起使用（快取計算結果，避免重複執行同一次計算），從根本降低運算量，而不是只靠排程掩蓋問題 |
| 用「打字快到超過真人速度」的自動化工具（例如每鍵間隔 0 毫秒）量測「總耗時」，卻期待看到跟真人操作一樣戲劇化的差距 | 計算本身是一整段不可中斷的同步迴圈，超高速輸入會讓背景計算幾乎必然跟下一次按鍵重疊，把兩種優化能發揮的空間壓縮到很小，量出來的差距會明顯縮小、甚至看起來「差不多」 | 用貼近真人的打字節奏測量（例如每鍵間隔 100～150 毫秒），並重複多次取平均／中位數，而不是只看單一次、或刻意用最快速度測試 |

## 執行方式

```bash
cd examples/day16-transition-deferred-lab
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。也可以執行 `npm run build` 打包成正式版本（打包後 `<StrictMode>` 不會再讓渲染多執行一次，手感會更貼近實際使用者感受到的效能表現），或執行 `npm run lint` 確認程式碼沒有明顯的 Hook 使用錯誤。
