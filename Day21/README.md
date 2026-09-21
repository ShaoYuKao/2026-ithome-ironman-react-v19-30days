# Day 21｜週複習與小專案：效能優化 + 自訂 Hook 函式庫

- 今日範例程式碼：[`Day21\examples\day21-hooks-library`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day21/examples/day21-hooks-library)

## 一、本週學習地圖回顧

在動手做函式庫之前，先快速複習一次第三週每天學了什麼、今天分別會不會用到：

| Day | 主題 | 今天的角色 |
| --- | --- | --- |
| Day15 | `useMemo`／`useCallback`／`React.memo`：快取計算結果與函式參照，避免不必要的重新渲染 | 本篇「效能優化 Hook 總複習」會重新整理一次核心觀念，函式庫本身沒有直接用到，但下一節會說明為什麼今天的四個自訂 Hook 都刻意設計成「回傳值形狀穩定」，跟 Day15 的精神一致 |
| Day16 | `useTransition`／`useDeferredValue`：Concurrent Rendering、緊急更新 vs 過渡更新 | 今天新學的 `useDebounce` 會拿來跟 `useDeferredValue` 對照，說明兩者「看起來都是讓頻繁變化的值不要拖慢畫面」，但解決的問題其實不同 |
| Day17 | `useImperativeHandle`／`useLayoutEffect`／`useId`：宣告式渲染模型覆蓋不到的例外情況 | 今天不會用到，但整理進「本週學習地圖」讓複習更完整 |
| Day18 | Actions 系列 Hook：`useActionState`／`useOptimistic`／`useFormStatus` | 今天不會用到，同樣列入複習範圍 |
| Day19 | `use()` 與 `Suspense`：讀取 Promise 的宣告式寫法 | 今天不會用到，但會在下一節簡短對照它與 `useFetch`（手動三態管理）兩種風格的差異 |
| Day20 | `useFetch(url)` 自訂 Hook：loading／error／success 三態、`AbortController` 真正取消請求 | **直接收錄進今天的函式庫**，並在 `CombinedSearchDemo` 裡跟新學的 `useDebounce` 搭配使用 |

再往前追溯，今天也會用到 Day13 學過的自訂 Hook 命名規則與 `useLocalStorage`／`useWindowSize` 兩個 Hook 本身。**今天不會有任何全新的「渲染邏輯」Hook**，重點是（1）用一句話複習完本週所有 Hook 的定位，（2）把之前寫過的自訂 Hook 整理成一個真正可以重複使用的函式庫，並新學一個非常實用的 `useDebounce`。

## 二、效能優化 Hook 總複習：遇到問題該想到哪一個？

本週學了不少 Hook，初學者常見的困惑是「這麼多個，我到底該用哪一個」。這裡用一張表整理成「先問自己遇到什麼問題，再決定用哪個 Hook」的判斷順序：

| 你遇到的情境 | 該想到的 Hook | 一句話回憶 |
| --- | --- | --- |
| 一段計算很花時間，但依賴的值沒有變 | `useMemo`（Day15） | 快取「計算結果」，依賴項不變就不重算 |
| 傳給子元件的函式，每次渲染都被重新建立，害 `React.memo` 失效 | `useCallback`（Day15） | 快取「函式的參照」，讓子元件的 Shallow Compare 判定為沒變 |
| 子元件的 props 沒變，卻還是跟著父層一起重新渲染 | `React.memo`（Day15） | 幫元件做一次「props 有沒有變」的守門員 |
| 打字即時篩選一份**已經在記憶體裡**的大量清單，希望畫面不要卡頓 | `useDeferredValue`（Day16） | 每一次改變都會處理，只是把處理時機延後、不擋住打字 |
| 一段狀態更新本身就很花時間，想顯示「處理中」的 Loading 效果 | `useTransition`（Day16） | 明確標記「這是可以晚一點的更新」，順便拿到 `isPending` |
| 打字即時觸發一個**成本很高的動作**（例如呼叫 API），不想每個按鍵都觸發一次 | `useDebounce`（今天新學） | 只保留「安靜下來之後的最後一個值」，中間的直接捨棄 |
| 需要「命令」子元件做一件事（例如手動 `focus()`），而不是描述畫面長怎樣 | `useImperativeHandle` + `forwardRef`（Day17） | 把命令式操作包裝成父層可以呼叫的方法 |
| 量測 DOM 尺寸後，必須在瀏覽器畫出來之前就修正版面 | `useLayoutEffect`（Day17） | 執行時機在「繪製之前」而非「之後」 |
| 表單送出中、成功、失敗，不想再手刻一堆 `useState` | `useActionState`／`useFormStatus`（Day18） | 把「送出邏輯」包成 Action，交給框架管理 pending／結果 |
| 想在真正結果出爐前，先樂觀顯示預期中的畫面 | `useOptimistic`（Day18） | 先顯示「應該會發生的結果」，之後被真正結果覆蓋或撤銷 |
| 想用宣告式的方式直接讀出一個 Promise 的值，而不是手動管理三態 | `use(promise)` + `Suspense`（Day19） | 資料還沒回來就讓 `Suspense` 顯示 fallback，不用自己寫 `isLoading` |
| 打 API、統一管理 loading／error／success 三態，並支援重試 | `useFetch(url)`（Day20，今天收錄進函式庫） | 手動三態管理的封裝版，比 `use()` 多一層「重試」與「取消上一次請求」的控制權 |

> 💡 **`useDeferredValue` 跟 `useDebounce` 到底差在哪？** 這是本週最容易搞混的一組對照，今天會在「四、`useDebounce`」那一節用具體例子詳細說明，這裡先記住結論：**`useDeferredValue` 不會減少『處理次數』，只會延後處理的時機；`useDebounce` 會直接減少『處理次數』本身**。當「處理一次」的成本只是「重新算一次陣列排序」時，用 `useDeferredValue`；當「處理一次」的成本是「呼叫一次後端 API」時，`useDebounce` 才是對的工具。

## 三、自訂 Hook 函式庫總覽：從「散落各處」到「統一出口」

Day13 已經示範過怎麼把重複的邏輯抽成 `useLocalStorage`、`useWindowSize`；Day20 也抽出了 `useFetch`。但這幾個 Hook 分別活在不同天的範例專案裡，各自 `import` 的路徑都不一樣。今天要做的第一件事，就是把它們**搬到同一個資料夾**，加上今天新學的 `useDebounce`，整理成一個有清楚出口的小型函式庫：

```
src/hooks/
├── useLocalStorage.js   <= 沿用 Day13，一字未改
├── useWindowSize.js     <= 沿用 Day13，一字未改
├── useFetch.js          <= 沿用 Day20，一字未改
├── useDebounce.js       <= 今天新學
└── index.js             <= 函式庫的「統一出口」（Barrel File）
```

`index.js` 的內容非常單純，只負責把四個 Hook 重新匯出一次：

```js
// src/hooks/index.js
export { useLocalStorage } from './useLocalStorage.js'
export { useWindowSize } from './useWindowSize.js'
export { useFetch } from './useFetch.js'
export { useDebounce } from './useDebounce.js'
```

有了這個出口，任何元件都只需要寫一行 `import`，不需要記住每個 Hook 實際放在哪個檔案：

```jsx
import { useLocalStorage, useWindowSize, useFetch, useDebounce } from '../hooks/index.js'
```

這種「對外只暴露一個入口，內部檔案要怎麼拆分都不影響使用端」的做法，就是打包一個小型函式庫時很常見的慣例（許多套件的 `index.js` / `index.ts` 都是同樣的角色）。也因為出口統一了，**日後如果想把這個 `hooks` 資料夾直接複製到任何新專案裡使用，只需要複製整個資料夾，不需要調整內部任何一行程式碼**——這正是 Day13 一開始強調「自訂 Hook 帶來邏輯複用」的具體成果。

## 四、複習：`useLocalStorage`、`useWindowSize`、`useFetch` 原封不動搬過來

### 1. `useLocalStorage(key, initialValue)`

```js
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
```

回傳值刻意維持 `[value, setValue]`——跟 `useState` 一模一樣的形狀，呼叫端幾乎能直接把 `useState(initialValue)` 換成 `useLocalStorage(key, initialValue)`。今天的 `LocalStorageDemo` 元件示範了同一個 Hook 在同一個元件裡，同時管理「便利貼內容（物件）」與「造訪次數（數字）」兩份完全不同形狀的資料，驗證它是真的可以重複呼叫，不會互相干擾。

### 2. `useWindowSize()`

```js
export function useWindowSize() {
  const [size, setSize] = useState(getSize)

  useEffect(() => {
    function handleResize() {
      setSize(getSize())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
```

`WindowSizeDemo` 元件裡的 `ViewportReadout` 與 `ResponsiveLayoutPreview` 是兩個完全獨立的元件，各自呼叫一次 `useWindowSize()`，卻共用同一套「訂閱 `resize`、卸載時取消訂閱」的邏輯——這是自訂 Hook「邏輯複用」最直觀的示範。

### 3. `useFetch(url)`

```js
export function useFetch(url) {
  // ……內部用 AbortController 真正取消上一個請求、
  // 用 requestKey 推導 isLoading，並提供 refetch() 讓呼叫端可以重試
  return { data, error, isLoading, refetch }
}
```

`useFetch` 跟前兩個 Hook 最大的不同，是它多了「請求」這個非同步、有可能失敗的動作，所以回傳值除了資料本身，還多了 `error`、`isLoading`、`refetch` 三樣東西，統一封裝了 Day20 學過的 loading／error／success 三態管理與 `AbortController` 取消機制。今天的 `CombinedSearchDemo` 會讓它跟新學的 `useDebounce` 搭配使用。

## 五、新學：`useDebounce(value, delayMs)`——Debounce（去抖動）

### 1. 為什麼需要它：一個「打字就打 API」的常見痛點

想像一個搜尋框，你希望「使用者打字的同時，就即時呼叫後端 API 搜尋」，如果直接在 `onChange` 裡就把每一次的輸入值當成 `useFetch` 的 `url` 依賴，會發生什麼事？

```jsx
// ❌ 沒有 Debounce：使用者打「鍵盤」兩個字，就會送出 2 次請求
// （打「鍵」送 1 次、打「盤」再送 1 次），如果是打一整句話，
// 每一個字都會各自送出一次請求，而使用者往往只關心「打完之後」的最終結果。
const { data } = useFetch(`/api/products?q=${keyword}`)
```

這不只是「浪費」而已：每一次使用者按鍵都送出的請求，回應到達的**先後順序不保證跟送出順序一致**（這正是 Day20 學過的 Race Condition），畫面很容易在快速輸入時，被過期的回應蓋掉最新的結果。真正需要的行為是：「等使用者停下來一小段時間，確定他打完了，才真正送出這一次搜尋」——這正是 **Debounce（去抖動）** 要解決的問題。

### 2. 範例：用一個會不斷「重設」的計時器

```js
// src/hooks/useDebounce.js
export function useDebounce(value, delayMs = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    // 清除函式：value 在 delayMs 毫秒內又變了，或元件卸載了，
    // 就取消「上一次」還沒執行的計時器——這正是 Debounce
    // 「只保留最後一次」效果的實作關鍵。
    return () => clearTimeout(timerId)
  }, [value, delayMs])

  return debouncedValue
}
```

搭配 Day08 學過的 cleanup 函式概念來理解會更清楚：**每一次 `value` 改變，都會先安排一個新的計時器，同時清除函式會把「上一次還沒執行完」的舊計時器取消掉**。只有當 `value` 連續超過 `delayMs` 毫秒都沒有再改變，最新安排的那個計時器才真正撐到執行、把 `debouncedValue` 更新成最新值。中間任何「安排了，但還沒撐到就被取消」的計時器，全部都不會執行到 `setDebouncedValue`。

### 3. `useDebounce` vs `useDeferredValue`：目的相似，手段完全不同

| | `useDeferredValue`（Day16） | `useDebounce`（今天） |
| --- | --- | --- |
| 中繼值會不會被處理 | 會，只是排程延後，最終仍會計算出對應每個中繼值的畫面 | 不會，只保留「安靜下來之後」的最後一個值，中繼值直接捨棄 |
| 省下的是什麼 | 「不擋住使用者輸入」的時間點安排 | 「處理次數」本身（例如 API 呼叫次數） |
| 適合用在 | 篩選一份**已經在記憶體裡**的清單（成本 = CPU 運算時間） | 觸發一個**成本很高的動作**，例如呼叫後端 API（成本 = 每一次呼叫本身） |
| 需要搭配 | 通常要搭配 `memo` 才能真正省下重新計算的成本 | 不需要額外搭配，`value` 減少改變次數本身就是效果 |

> 為什麼今天的 `CombinedSearchDemo` 選 `useDebounce` 而不是 `useDeferredValue`？因為情境是「呼叫後端 API 搜尋商品」——如果用 `useDeferredValue`，每一次按鍵**最終還是會**各自送出一次請求，只是排程上不擋住輸入框；只有 `useDebounce` 才能真正讓「安靜下來之前的中間狀態」完全不觸發請求。

## 六、範例：把 `useDebounce` 與 `useFetch` 組合起來

`CombinedSearchDemo` 元件示範了兩個函式庫 Hook 如何「順理成章地」搭配使用，不需要額外寫任何節流邏輯：

```jsx
function CombinedSearchDemo() {
  const [rawKeyword, setRawKeyword] = useState('')
  // 1. 停止輸入滿 400ms，debouncedKeyword 才會跟上 rawKeyword。
  const debouncedKeyword = useDebounce(rawKeyword, 400)

  // 2. searchUrl 只有在 debouncedKeyword 真正改變時才會產生新的字串，
  //    useFetch 內部依賴 url 才會重新請求——順便利用 useFetch
  //    現有的依賴機制，完全不用額外寫節流邏輯。
  const searchUrl = `/api/products?q=${encodeURIComponent(debouncedKeyword)}`
  const { data, error, isLoading, refetch } = useFetch(searchUrl)

  // ……
}
```

這裡的關鍵設計，是讓 `useDebounce` 產生的 `debouncedKeyword`，去組成 `useFetch` 依賴的 `url` 字串。`useFetch` 內部本來就是「`url` 改變才重新請求」，現在只是把「什麼時候算改變」的判斷，從「使用者打了一個字」延後成「使用者停下來 400ms」——兩個各自獨立、各司其職的 Hook，組合起來就完成了一個更聰明的行為，這正是自訂 Hook「小積木、可以互相搭配」的價值。

範例畫面上會即時顯示三個數字，讓「省下請求次數」這件事看得見、而不只是憑感覺：

- **即時輸入值**：每個按鍵都更新。
- **實際觸發搜尋的關鍵字**：只有停止輸入 400ms 後才更新。
- **實際送出請求次數**：對照瀏覽器開發者工具的 Network 分頁，會發現遠比按鍵次數少很多。

後端（`server/index.js`）也刻意在 console 印出「每一次真正收到的請求」，讓你可以同時從前端畫面與後端 log 兩個角度，驗證同一件事。

## 七、Demo 頁面總覽

打開 `examples/day21-hooks-library` 的頁面，由上而下依序是：

1. **`useWindowSize`**：兩個獨立元件共用視窗尺寸偵測邏輯，調整瀏覽器視窗大小會即時看到數字變化。
2. **`useLocalStorage`**：一個會自動保存的便利貼，重新整理頁面內容依然存在。
3. **`useDebounce`**：單純的輸入框，比較「即時值」與「Debounce 後的值」，搭配按鍵次數／安定次數的計數器，直觀感受 Debounce 的行為。
4. **`useDebounce` + `useFetch`**：串接 Express 後端的商品搜尋框，展示兩個 Hook 組合後真正省下 API 呼叫次數的效果。

元件樹如下：

```
App
├── WindowSizeDemo
│   ├── ViewportReadout（useWindowSize）
│   └── ResponsiveLayoutPreview（useWindowSize）
├── LocalStorageDemo（useLocalStorage x2：便利貼內容、造訪次數）
├── DebounceDemo（useDebounce，不呼叫 API）
└── CombinedSearchDemo（useDebounce + useFetch，呼叫 Express 後端）
```

## 八、如何在本機執行範例

範例包含前端（Vite）與後端（Express）兩個各自獨立的 `package.json`，需要分別安裝依賴、分別啟動：

```bash
# 1. 啟動後端 API（終端機視窗一）
cd examples/day21-hooks-library/server
npm install
npm start
# Express server ready at http://localhost:4021

# 2. 啟動前端開發伺服器（終端機視窗二）
cd examples/day21-hooks-library
npm install
npm run dev
# 開啟瀏覽器 http://localhost:5173
```

前端的 `vite.config.js` 已經設定好 Proxy，把 `/api` 開頭的請求轉發到 `http://localhost:4021`，所以前端程式碼裡只需要呼叫相對路徑 `fetch('/api/...')`，不需要處理跨來源（CORS）問題，也不必把後端網址寫死在前端程式碼裡（沿用 Day20 的做法）。

## 參考資源

- [useDeferredValue – React](https://react.dev/reference/react/useDeferredValue)（對照今天 `useDebounce` 的差異說明）
