# Day 17｜`useImperativeHandle`、`useLayoutEffect`、`useId`

- 今日範例程式碼：[`Day17\examples\day17-imperative-layout-id-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day17/examples/day17-imperative-layout-id-lab)

## 一、為什麼這三個 Hook 常被放在一起講

Day15、Day16 學的 `useMemo`／`useCallback`／`useTransition`／`useDeferredValue`，全部都還停留在「**React 幫你決定畫面長怎樣、什麼時候畫**」這個宣告式的世界觀裡——你只要描述「資料是什麼」，React 就負責把它變成畫面。但實務上會遇到三種宣告式渲染單獨解決不了的情境：

1. **有時候，你需要「命令」子元件做一件事，而不是「描述」它應該長什麼樣子。** 例如：使用者按下「編輯」按鈕，你想讓某個輸入框立刻取得焦點；這不是一個「畫面狀態」，而是一個「一次性的動作」。如果為了做這件事，特地設計一個 `shouldFocus` state 去驅動它，會讓程式碼變得不必要地複雜。
2. **有時候，畫面需要先「量出實際的大小/位置」，才能決定最終要怎麼畫，而且這個過程不能讓使用者看到中間過程。** 例如一個提示框，必須先知道「下方空間夠不夠」才能決定往上或往下顯示——這種「量測後再決定」的邏輯，天生就沒辦法在第一次渲染就得到正確答案，必須等真正的 DOM 尺寸出來後再修正，而且這個修正最好搶在瀏覽器畫出來之前完成。
3. **有時候，你需要一個穩定、唯一、但又不能跟「渲染次數」「陣列 index」綁死的 ID。** 常見於 `<label htmlFor>` 對應 `<input id>`、`aria-describedby` 這類無障礙屬性——這些 id 只要在同一個頁面裡撞名，就會造成真正可觀察到的錯誤行為，不只是語意不乾淨而已。

`useImperativeHandle`、`useLayoutEffect`、`useId` 分別是 React 針對這三種「例外情況」提供的正式解法。它們共同的性格是：**平常用得到的機會不多，但一旦真的遇到對應情境，幾乎沒有更好的宣告式替代方案**。

## 二、`useImperativeHandle`：把命令式操作包裝成方法呼叫

### 1. 先搞懂為什麼需要 `forwardRef`

複習 Day10 學過的 `useRef`：`<input ref={inputRef} />` 這種寫法，只對**原生 DOM 標籤**（`input`、`div`、`button`……）有效，因為 React 會把 `ref` 特殊處理，直接指向瀏覽器建立出來的真實 DOM 節點。

但如果 `CustomInput` 是你自己寫的**函式元件**呢？

```jsx
// ❌ 這樣寫行不通：函式元件預設不會接收到 ref 這個「屬性」
function CustomInput(props) {
  return <input {...props} />
}

function Parent() {
  const ref = useRef(null)
  return <CustomInput ref={ref} /> // ref.current 會是 null，且開發模式下 React 可能發出警告
}
```

原因是：`ref` 跟一般的 `props`（如 `value`、`onChange`）待遇不同，React 不會把它當成普通 prop 傳進函式元件內部——它需要一個「轉發（forward）」的管道，這正是 `forwardRef` 存在的原因：

```jsx
import { forwardRef } from 'react'

const CustomInput = forwardRef(function CustomInput(props, ref) {
  return <input {...props} ref={ref} />
})
```

`forwardRef` 在做的事：把你原本只有 `(props)` 一個參數的函式元件，包成一個「多一個 `ref` 出入口」的版本，讓 React 知道要把父層傳進來的 `ref` 交給誰。實際使用時，你只需要記住這個簡單對照：

- **沒有 `forwardRef`**：函式元件只拿得到 `props`，父層傳的 `ref` 不會被轉發進來。
- **有 `forwardRef`**：函式元件會多拿到第二個參數 `ref`，這個 `ref` 就是父層 `<CustomInput ref={...} />` 傳進來的同一個 `ref` 物件。

開發模式下，如果忘記在 `forwardRef` 的 render 函式裡宣告 `ref` 參數，或是把已經用 `memo(...)` 包過的元件又整個丟進 `forwardRef`，React 會在瀏覽器主控台印出提醒訊息——看到類似警告時，回頭檢查是不是漏寫了 `ref` 參數、或包裝順序反了即可，不需要去追 React 內部怎麼實作。

有了 `forwardRef`，`ref` 才能一路「穿透」到 `CustomInput` 內部，讓它決定要把這個 `ref` 接到哪個真正的 DOM 節點（或完全不接原生節點，改接一個自訂物件——這正是下一節 `useImperativeHandle` 要做的事）。

> 💡 **補充**：React 19 的官方更新紀錄提到新增了「`ref` as a prop」——函式元件現在也可以像一般 prop 一樣直接宣告並讀取 `ref`，不再強制要求 `forwardRef`。

### 2. `useImperativeHandle` 基本語法

```js
useImperativeHandle(ref, () => createHandle, deps?);
```

> 自訂父元件透過 `ref` 取得子元件時所暴露的 instance 內容，可隱藏內部實作細節、只暴露必要方法，較少使用。

`useImperativeHandle` 的用法邏輯跟其他 Hook 一致（第三個參數一樣是依賴陣列），只是專門用來客製化「父層透過 `ref` 拿到的東西該長什麼樣子」，接受三個參數：

| 參數 | 說明 |
| --- | --- |
| `ref` | 從 `forwardRef` 的第二個參數拿到的那個 `ref`（父層透過 `<CustomInput ref={...} />` 傳進來的） |
| `create` | 一個「工廠函式」，回傳一個物件——這個物件就是父層之後透過 `ref.current` 拿到的東西，你想暴露什麼方法，就在這個物件裡定義什麼方法 |
| `deps` | 依賴陣列，用法跟 `useEffect`／`useMemo` 一致：只有依賴改變時，才會重新呼叫 `create` 產生新的 handle 物件 |

**`useImperativeHandle` 讓你「偷換」父層透過 `ref` 拿到的東西**——父層原本以為 `ref.current` 會是真正的 DOM 節點，但只要子元件內部呼叫了 `useImperativeHandle`，父層實際拿到的，會是 `create()` 回傳的那個「客製化物件」。

### 3. 動手拆解

```jsx
/// src/components/CustomInput.jsx
const CustomInput = forwardRef(function CustomInput(
  { label, hint, error, type = 'text', ...inputProps },
  ref,
) {
  // 內部仍然用 useRef 拿到真正的 DOM 節點，這是 useImperativeHandle
  // 唯一能操作 DOM 的管道——它只是換了一層「對外暴露什麼」的包裝。
  const inputRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        inputRef.current?.focus()
      },
      clear() {
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      },
      getValue() {
        return inputRef.current?.value ?? ''
      },
      shake() {
        const node = inputRef.current
        if (!node) return
        node.classList.remove('shake')
        void node.offsetWidth // 強制觸發 reflow，讓同一個 class 能連續重播動畫
        node.classList.add('shake')
      },
    }),
    [], // 每個方法都只讀取「當下最新」的 inputRef.current，不需要因為任何 state／props 改變就重建
  )

  return (
    <div className="field">
      <label htmlFor={inputId} className="field-label">{label}</label>
      <input {...inputProps} id={inputId} ref={inputRef} type={type} />
      {/* ...hint／error 訊息省略... */}
    </div>
  )
})
```

重點拆解：

- **父層完全不知道 `CustomInput` 內部長什麼樣子**——它可能是單純的 `<input>`，也可能包了好幾層 `<div>`；父層只知道自己拿到的 `ref.current` 有 `focus()`／`clear()`／`getValue()`／`shake()` 四個方法可以呼叫，這正是「隱藏內部實作細節、只暴露必要方法」的具體展現。
- **`shake()` 沒有透過任何 React state**，純粹是直接操作 DOM 的 `classList`——這是刻意的設計：抖動（Debounce）動畫本身是一次性的命令式行為，沒有「shake 或不 shake」這種需要長期維護的畫面狀態，用 state 驅動反而是過度設計。
- 依賴陣列給 `[]`：因為物件裡每個方法都只透過 `inputRef.current` 讀取「當下最新」的 DOM 節點，不依賴任何外部變數，所以不需要在渲染間重新建立這個 handle 物件。

### 4. 使用情境

範例把 `CustomInput` 包成一個「會員註冊表單」：姓名、Email、密碼各是一個獨立的 `CustomInput` 實例，各自有一個獨立的 `ref`。按下「註冊」但驗證沒過時，直接呼叫**第一個有錯誤的欄位**的 `shake()`、`focus()`：

```jsx
// src/components/RegistrationForm.jsx
const nameRef = useRef(null)
const emailRef = useRef(null)
const passwordRef = useRef(null)
const fieldRefs = { name: nameRef, email: emailRef, password: passwordRef }

function handleSubmit(event) {
  event.preventDefault()
  const nextErrors = validate(values)
  const firstInvalidField = FIELD_ORDER.find((field) => nextErrors[field])

  if (firstInvalidField) {
    flushSync(() => {
      setErrors(nextErrors)
    })
    // 核心示範：直接呼叫子元件暴露出來的命令式方法，
    // 完全不需要額外設計「哪個欄位要抖動」「聚焦到誰」的 state。
    fieldRefs[firstInvalidField].current?.shake()
    fieldRefs[firstInvalidField].current?.focus()
    return
  }

  setErrors(nextErrors)
  setSubmittedCount((count) => count + 1)
  handleReset() // 內部呼叫每個欄位的 clear()
}
```

> 註：在 React 裡，`flushSync` 是一個用來強制 React 同步更新 DOM 的高階 API。

> ⚠️ **實際踩到的坑：`flushSync` 為什麼在這裡是必要的**
>
> 在範例中，第一版程式碼**沒有** `flushSync`，直接依序呼叫 `setErrors(nextErrors)` => `shake()` => `focus()`。結果用驗證時發現：`shake` 的 CSS class 確實被加上去了，但畫面上**完全沒有播放抖動（Debounce）動畫**。
>
> 原因是 React 的批次更新（batching）：`setErrors(nextErrors)` 只是「排定」了一次狀態更新，真正的重新渲染跟 DOM commit，要等這個事件處理函式**整個執行完**才會發生。所以實際順序是：(1) `setErrors` 排定更新 => (2) `shake()` 立刻把 `shake` class 加到「當下」的 DOM 節點上 => (3) `handleSubmit` 結束 => (4) React 才真正重新渲染 `CustomInput`（這次 `error` prop 從無到有了），並把 `className` 設成 JSX 算出來的 `'field-input field-input--error'`——這個字串**完全不知道有 `shake` 這個 class**，所以這次重新渲染會直接把 `shake()` 剛剛加上去的 class **整個覆蓋掉**。
>
> 解法是用 `flushSync` 包住 `setErrors`，強制 React「立刻」完成這次更新的渲染與 commit，而不是拖到事件處理函式結束後才批次處理。這樣一來，等到 `shake()` 執行的時候，DOM 已經是最終畫面（`className` 已經包含 `field-input--error`），`shake()` 加上去的 class 就不會再被稍後才發生的渲染蓋掉。這是一個**混用「React 控制的宣告式 className」與「手動的命令式 classList 操作」時，一定要注意的真實陷阱**，也是本範例在開發、驗證階段實際踩到、修正過的 bug。

### 5. 常見誤區：`useImperativeHandle` 不是用來「取代」state 的

`useImperativeHandle` 很適合「一次性、命令式」的動作（focus、捲動、播放、抖動（Debounce）），但**不適合**拿來管理「畫面長期需要根據它渲染」的狀態。舉例：如果把 `CustomInput` 目前的值也做成 `getValue()` 方法讓父層「主動去問」，而不是用 `value` + `onChange` 的受控（controlled）模式，會讓父層沒辦法「同步」反應這個值的變化（例如即時顯示字數、即時驗證），只能等某個時機點主動呼叫 `getValue()` 才拿得到最新值。今天的範例裡，`getValue()` 只是額外附加的示範方法，實際的驗證邏輯仍然透過 `value`／`onChange` 這組標準的受控模式進行，這是刻意的設計取捨。

## 三、`useLayoutEffect`：繪製前搶先修正

### 1. 跟 `useEffect` 唯一但關鍵的差異：執行時機

> `useEffect`：讓元件與外部系統同步，在瀏覽器完成繪製「之後」非同步執行。
> `useLayoutEffect`：與 `useEffect` 用法相同，但會在瀏覽器「繪製畫面之前」同步執行，適合需要量測版面配置（layout）後立即調整的情境。

`useLayoutEffect(setup, deps?)` 的寫法跟 Day08 學過的 `useEffect` 一模一樣：一樣傳入一個 `setup` 回呼函式，裡面可以再回傳一個「清除（cleanup）」函式；第二個參數一樣是依賴陣列，規則也完全相同。換句話說，**怎麼寫**這件事上兩者沒有任何差異——你可以直接把既有的 `useEffect` 程式碼搬過來，只改個名字就好（如果忘記傳入 `setup` 回呼函式，開發模式下一樣會出現提醒）。真正、也是唯一的差異，在於 React **什麼時候執行**這段程式碼：

把整個流程攤開來看：

```
(1) React 計算出新的畫面（Render Phase）
(2) React 把變更套用到真正的 DOM 上（Commit：DOM Mutation）
(3) useLayoutEffect 裡的程式碼「同步」執行 ←—— 這裡完成之前，瀏覽器不會畫出任何東西
(4) 瀏覽器真正把畫面繪製（Paint）出來，使用者這時候才「看得到」
(5) useEffect 裡的程式碼才非同步執行（這時候使用者已經看到 (4) 的畫面了）
```

`useLayoutEffect` 卡在第 (3) 步，`useEffect` 排在第 (5) 步之後——這一步之差，正是今天要驗證的重點：**如果你的 Effect 需要「量測 DOM、然後立刻調整畫面」，用 `useLayoutEffect` 才能讓使用者完全看不到中間那個「還沒調整完」的畫面；用 `useEffect`，使用者會先看到錯的樣子，一瞬間後才看到修正後的樣子。**

### 2. 什麼時候該用：量測 layout 後要「立刻」調整

典型情境：聊天室、留言串收到新訊息時，要把捲動位置「校正」到最下面，讓使用者看到剛送達的訊息——這種「量測後再決定」的邏輯，天生沒辦法只靠第一次渲染算出正確答案（渲染當下，新訊息的 DOM 可能都還沒真正掛上去，量不出真正需要捲動的高度）。所以一定要透過 Effect，等 DOM 真正掛載、更新之後才能量測、修正。

如果用 `useEffect` 做這件事：使用者會先看到清單「卡在舊的捲動位置（看不到新訊息）」，接著在下一個瞬間看到「已經捲到最新訊息」，畫面上會有感覺得到的跳動（jump）。如果用 `useLayoutEffect`：修正發生在瀏覽器繪製之前，使用者只會看到「已經捲到最新訊息」的最終結果，完全不會經歷那個卡住的中間狀態。

### 3. 動手拆解

範例把「偵測新訊息抵達、量測並捲動到最下面」寫成一個共用的自訂 Hook，刻意把「要用 `useEffect` 還是 `useLayoutEffect`」當成參數傳進來，讓兩個版本共用同一段邏輯，只有執行時機不同：

```js
// src/utils/useAutoScrollToBottom.js
export function useAutoScrollToBottom(
  effectHook,
  { messages, containerRef, simulateSlowMeasurement = false, waitForPaint = false },
) {
  const [atBottom, setAtBottom] = useState(true) // 樂觀假設一開始就在底部
  const [lastDurationMs, setLastDurationMs] = useState(null)
  const [history, setHistory] = useState([])
  const prevCountRef = useRef(messages.length)
  const pendingSinceRef = useRef(null)

  // 訊息陣列變長（新訊息抵達）時，在渲染階段同步把 atBottom 重置成 false，
  // 讓 Effect 接下來能重新走一次「stale（卡住）→ corrected（已捲到底）」的過程。
  if (messages.length !== prevCountRef.current) {
    const arrived = messages.length > prevCountRef.current
    prevCountRef.current = messages.length
    if (arrived) {
      if (atBottom !== false) setAtBottom(false)
      if (lastDurationMs !== null) setLastDurationMs(null)
      pendingSinceRef.current = performance.now()
      setHistory([{ atBottom: false, atMs: 0 }])
    }
  }

  effectHook(() => {
    const container = containerRef.current
    if (!container || pendingSinceRef.current == null) return
    const startedAt = pendingSinceRef.current

    function runCorrection() {
      const start = performance.now()
      if (simulateSlowMeasurement) {
        // 刻意用一段同步的忙碌迴圈，模擬「量測、計算捲動位置」需要花一點時間
        // 的真實情境，把正常情況下只有 1 個影格（約 16ms）、人眼很難察覺的
        // 差異，放大成任何人都能一眼看出來的效果。
        const busyUntil = start + 150
        while (performance.now() < busyUntil) { /* 刻意佔用主執行緒 */ }
      }
      container.scrollTop = container.scrollHeight
      setAtBottom(true)
      setLastDurationMs(Math.round(performance.now() - start))
      setHistory((prev) => [...prev, { atBottom: true, atMs: Math.round(performance.now() - startedAt) }])
      pendingSinceRef.current = null
    }

    if (!waitForPaint) {
      runCorrection() // useLayoutEffect：同步立刻修正，不能、也不需要再等
      return
    }

    // useEffect：用「連續兩次 requestAnimationFrame」確保瀏覽器至少真的畫過
    // 一次「卡住」的畫面，才開始執行忙碌迴圈與捲動修正（原因見下方說明）。
    const rafIds = { first: 0, second: 0 }
    rafIds.first = requestAnimationFrame(() => {
      rafIds.second = requestAnimationFrame(runCorrection)
    })
    return () => {
      cancelAnimationFrame(rafIds.first)
      cancelAnimationFrame(rafIds.second)
    }
  }, [messages, simulateSlowMeasurement, waitForPaint])

  return { atBottom, lastDurationMs, history }
}
```

`ChatWindow.jsx` 各建立一個實例，分別傳入 `useEffect`、`useLayoutEffect`：

```jsx
// ChatScrollDemo.jsx
<ChatWindow title="useEffect 版本（繪製後才修正）" effectHook={useEffect} isSynchronous={false} />
<ChatWindow title="useLayoutEffect 版本（繪製前就修正）" effectHook={useLayoutEffect} isSynchronous />
```

幾個值得注意的設計細節：

- **`waitForPaint`（連續兩次 `requestAnimationFrame`）**：一開始的版本沒有這段，直接在 `useEffect` 裡同步執行忙碌迴圈，結果實測發現「卡住的畫面」有時候完全不會被畫出來——因為 `useEffect` 只是「通常」會在瀏覽器繪製之後才執行，並不是鐵律；一旦這次要更新的內容比較多（例如一次新增 3 則訊息），瀏覽器有可能還來不及畫出中間狀態，`useEffect` 就已經開始執行忙碌迴圈把畫面卡住，導致「卡住的畫面」從頭到尾都沒有被使用者看到過，示範就失真了。用兩次 `requestAnimationFrame`（單次不夠：`requestAnimationFrame` 的回呼是在「這一輪繪製之前」執行，同一輪的繪製仍然只會畫出已修正的結果；巢狀兩層才能確保回呼是在下一輪、也就是「上一輪繪製已經完成」之後才執行）明確等到瀏覽器至少真正畫過一次「卡住」的畫面，才開始忙碌迴圈與捲動修正，讓範例每次都能穩定重現。這是「確保至少發生過一次繪製」的常見手法，跟 `useLayoutEffect` 本身的行為無關——這也是為什麼 `useLayoutEffect` 版本完全不需要（也不能）套用同樣的手法：它本來就保證搶在繪製之前同步執行，用 `requestAnimationFrame` 延後，反而會讓瀏覽器先畫出「卡住」的畫面，等於讓它的行為變得跟 `useEffect` 一樣。
- **`history` 時間軸紀錄**：每次捲動狀態被（重新）決定，都記下「距離新訊息抵達過了多少毫秒、判定結果是什麼」。這份紀錄本身用 React state 儲存，是為了把「useEffect 版本會不會先出現卡住的舊畫面」這件事，從「肉眼盯著畫面看有沒有跳一下」，變成畫面上就能直接讀到的文字證據——這個設計後面會在實作那一節說明用途。

### 4. 為什麼要小心使用：會阻塞繪製

`useLayoutEffect` 的程式碼是**同步**執行，而且執行完之前瀏覽器不會畫出任何東西——這代表如果 `useLayoutEffect` 裡的計算很花時間，會讓整個頁面在那段時間內「卡住」，使用者連捲動、點擊都感覺不到反應。今天範例裡故意加上的 300 毫秒忙碌迴圈，就是刻意放大這個效果：勾選「放大顯示差異」之後，按下 `useLayoutEffect` 版本的「模擬收到 3 則新訊息」，會明顯感覺到按下去之後，畫面「卡住」了一下才有反應——這正是 `useLayoutEffect` 的代價。多數情況下，`useEffect` 才是預設該選的那一個；只有在「使用者會實際看到中間錯誤畫面」造成明顯跳動的情境，才值得用 `useLayoutEffect` 換取「不阻塞使用者互動」以外的正確性。

### 5. SSR（伺服器端渲染）注意事項

`useLayoutEffect` 依賴真實的瀏覽器 DOM 才能量測版面，在伺服器端渲染（沒有瀏覽器、沒有真正的 DOM 尺寸）時完全無法執行對應的邏輯。React 在伺服器端渲染時遇到 `useLayoutEffect` 會發出警告，提醒開發者這段程式碼在伺服器端不會有任何效果。今天的範例是純前端的 Vite 應用（沒有伺服器端渲染），不會遇到這個警告，但如果你之後在 Next.js 之類有 SSR 的框架裡用到 `useLayoutEffect`，記得這一點限制。

## 四、`useId`：無障礙且不會撞名的唯一 ID

### 1. 基本語法

```js
const id = useId();
```

> 產生一個在同一次渲染中、伺服端與客戶端皆一致且唯一的 ID 字串，常用於 `aria-*`、`htmlFor` 等無障礙屬性，**不應**用來當作 list 的 `key`。

> 查閱 [`react/packages/react/src/ReactHooks.js`](https://github.com/react/react/blob/main/packages/react/src/ReactHooks.js) 原始碼：
> 
> ```js
> export function useId(): string {
>   const dispatcher = resolveDispatcher();
>   return dispatcher.useId();
> }
> ```

`useId()` 是今天三個 Hook 裡用法最簡單的一個，不需要傳入任何參數，每次呼叫都會回傳一個字串，保證在**同一個元件實例**裡，每次渲染都拿到相同的值，而且在整個應用程式裡跟其他元件實例產生的 id 不會撞名。

### 2. 為什麼不能用陣列 index 或 `Math.random()` 代替

初學者常見的兩種「土法煉鋼」寫法，各自有問題：

| 土法煉鋼寫法 | 問題 |
| --- | --- |
| 用 `Math.random()` 或自己遞增一個計數器產生 id | **無法在伺服端渲染與客戶端 hydration 之間保持一致**——伺服器產生一組隨機值，瀏覽器重新執行一次又是另一組隨機值，會導致 hydration 時「伺服器渲染出的 HTML」跟「客戶端這次渲染出的結果」對不上，React 會報 hydration mismatch 警告，`aria-describedby` 這類屬性也可能指向不存在的 id |
| 用陣列 index 當 id | 如果同一個元件在同一個頁面被重複使用兩次以上（例如同一個表單元件被拿去做「帳單地址」跟「收件地址」兩份），用固定索引或固定字串當 id，兩份表單會產生**完全相同**的 id，瀏覽器只認第一個符合的元素 |

`useId()` 解決的正是「同一份元件邏輯，會不會被同一個頁面重複使用超過一次」這個問題——它讓 id 的產生跟「這是哪一個元件實例」綁定，而不是跟「畫面上第幾個」「這次執行到第幾行」這種容易撞名的資訊綁定。

### 3. 動手拆解：`AddressFields.jsx` vs `BadAddressFields.jsx`

✅ 正確作法：用 `useId()` 產生「這一個元件實例」專屬的 id 前綴，再組出多個彼此相關的子 id：

```jsx
// src/components/AddressFields.jsx
function AddressFields({ legend, values, onChange }) {
  const id = useId()
  const streetId = `${id}-street`
  const streetHintId = `${id}-street-hint`
  const zipId = `${id}-zip`

  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>
      <label htmlFor={streetId}>街道地址</label>
      <input id={streetId} aria-describedby={streetHintId} /* ... */ />
      <p id={streetHintId}>請包含門牌號碼</p>
      <label htmlFor={zipId}>郵遞區號</label>
      <input id={zipId} /* ... */ />
    </fieldset>
  )
}
```

❌ 錯誤示範：把 id 寫死成固定字串——單獨看、只使用一次時完全看不出問題：

```jsx
// src/components/BadAddressFields.jsx
function BadAddressFields({ legend, values, onChange }) {
  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>
      <label htmlFor="address-street">街道地址</label>
      <input id="address-street" /* ... */ />
      <label htmlFor="address-zip">郵遞區號</label>
      <input id="address-zip" /* ... */ />
    </fieldset>
  )
}
```

範例裡，同一個元件（`AddressFields` 或 `BadAddressFields`）分別被渲染成「帳單地址」「收件地址」兩份。用 `useId()` 的版本，兩份各自拿到不同的前綴，完全不會撞名；寫死固定字串的版本，兩份都產生一模一樣的 `address-street`、`address-zip`——瀏覽器的 `label` `htmlFor` 對應，只認「畫面上第一個符合該 id 的元素」，所以點擊「收件地址」的 label，焦點卻會錯誤地跳到「帳單地址」的輸入框上。這不是理論上的最佳實踐建議，而是能親手重現的真實 bug。

### 4. 為什麼「不應該」拿 `useId` 當 list 的 `key`

原因是：`useId()` 產生的值，跟「這個元件實例」綁定，而 React 用來判斷 list 該不該重新排序/新增/刪除的 `key`，需要的是「跟資料本身綁定」的穩定識別碼（例如資料庫的 `id` 欄位）。如果拿 `useId()` 產生的值當 `key`，這個值只會在元件「掛載」時產生一次，跟清單資料的新增、刪除、排序完全無關，沒辦法正確反映「這一筆資料到底是不是同一筆」，會讓 React 的 diff 演算法做出錯誤的判斷（例如把本來該保留 state 的項目誤判成新項目）。

## 五、三者小結對照表

| Hook | 解決的問題 | 典型使用時機 | 是否常用 |
| --- | --- | --- | --- |
| `useImperativeHandle`（搭配 `forwardRef`） | 父層需要「命令式」呼叫子元件內部方法 | 手動觸發 `focus()`、捲動、播放/暫停、觸發一次性動畫 | 較少，多數情境宣告式渲染就足夠 |
| `useLayoutEffect` | Effect 需要在瀏覽器繪製「之前」同步完成，避免使用者看到閃爍 | 量測 DOM 尺寸/位置後立即調整版面（聊天室捲動位置校正、tooltip 翻轉等） | 較少，多數 Effect 用 `useEffect` 即可 |
| `useId` | 需要一個跨伺服端／客戶端一致、且不會因重複使用而撞名的唯一 ID | `label htmlFor`、`aria-describedby`、`aria-labelledby` 等無障礙屬性 | 中等，任何會被重複使用的表單類元件都建議用 |

三者的共同心法：**先確認自己真的落在「宣告式渲染解決不了」的那個例外情況裡，再考慮使用它們**——濫用 `useImperativeHandle` 會讓元件之間重新出現緊密耦合（跟 props/state 的鬆耦合設計背道而馳）；濫用 `useLayoutEffect` 會讓應用變慢；`useId` 反而是三者中「多用不太會出錯，只有不用才會踩雷」的例外。

## 六、今日範例

打開範例，會看到一個分頁式的實驗室頁面，依序切換三個 Demo：

### 1. Demo 1：`forwardRef` + `useImperativeHandle`——會員註冊表單

對應 `src/components/RegistrationForm.jsx` + `src/components/CustomInput.jsx`。

「用 `forwardRef` + `useImperativeHandle` 做一個可被父元件呼叫 `focus()` / `clear()` 方法的自訂輸入框元件」。

操作方式：

- 什麼都不填直接按「註冊」：第一個有錯誤的欄位（姓名）會**自動抖動並取得焦點**——這個效果完全由 `RegistrationForm` 直接呼叫 `nameRef.current.shake()` / `.focus()` 觸發，`CustomInput` 本身完全不知道「什麼時候該抖動」這個判斷邏輯。
- 填完全部欄位按「註冊」：會看到成功訊息，並且三個欄位都被清空——清空是透過呼叫每個欄位的 `clear()` 方法完成，不是重新渲染整個表單。
- 按「聚焦到姓名欄位」按鈕：直接呼叫 `nameRef.current.focus()`，驗證「父層命令式呼叫子元件方法」這件事本身是可行的。

> 這個 Demo 也記錄了一個實際除錯過程中發現的真實陷阱：`shake()` 加上的 class 一度會被緊接著發生的 React 重新渲染覆蓋掉，最後用 `flushSync` 解決。

### 2. Demo 2：`useLayoutEffect` vs `useEffect`——聊天室新訊息捲動

對應 `src/components/ChatScrollDemo.jsx` + `src/components/ChatWindow.jsx` + `src/utils/useAutoScrollToBottom.js`。

畫面上並排兩個聊天室，一開始都已經捲到最下面。按下「模擬收到 3 則新訊息」後，清單會一次新增 3 則訊息——這個 Demo 的重點不是「最後結果」（兩邊最後都會捲到最新訊息），而是「使用者眼睛在過程中，看不看得到清單卡在舊捲動位置、看不到新訊息的那個暫時畫面」。

勾選「放大顯示差異（模擬 300ms 較慢的版面量測）」後分別按下兩邊的按鈕：

- **useEffect 版本**：按下去之後，清單會先卡在舊的捲動位置（紅色邊框，看不到新訊息），維持約 300 毫秒後才「跳」成已捲到最新訊息（綠色邊框）——因為 `useEffect` 排在瀏覽器繪製「之後」，這段卡住的中間狀態真的會被畫出來、被使用者看到。
- **useLayoutEffect 版本**：按下去之後，畫面會先「卡住」300 毫秒（因為修正邏輯是同步執行，會阻塞繪製），接著直接顯示綠色邊框、已捲到最新訊息的畫面，**完全不會看到**紅色的卡住狀態——因為修正發生在瀏覽器有機會畫出任何東西之前。

跟原本考慮過的「提示框翻轉定位」比起來，捲動位置是「一大段空間位移」（清單內容整個跳動、捲動軸位置改變），比「一小塊色塊變色」明顯得多，就算不刻意放大也不容易錯過。

為了不只靠肉眼判斷（肉眼在自動化環境或錄影重播時很難精確捕捉一瞬間的變化），每個聊天室下方都會顯示一份**判定時間軸**（`history` log），例如：

```
新訊息抵達後 0 ms：暫時卡在舊的捲動位置（尚未捲到底）
新訊息抵達後 151 ms：已捲到最新訊息（正確位置）
```

useLayoutEffect 版本的時間軸旁邊會額外標註：「上面『0 ms』那筆只是量測前的暫時狀態，這裡在瀏覽器來得及畫出任何東西之前，就已經被下面那筆修正取代，使用者實際上『完全不會看到』清單卡在舊位置的樣子」——這點很重要：**兩個版本的 `history` 資料本身看起來很像（都有一筆卡住、一筆已捲到底），差異完全在於「卡住那筆有沒有真的被瀏覽器畫出來」，而不是「有沒有記錄下來」**。這份時間軸也是實際驗證這個範例功能是否正確時，用來取代「跟瀏覽器自動化工具搶時間、賭運氣讀取那一瞬間的 DOM 狀態」的可靠依據。

> 💡 **實測小提醒**：`<StrictMode>` 會讓元件初次掛載時的 Effect 多執行一次（掛載 => 清除 => 再掛載），但因為這個 Demo 一開始就靠一支獨立、一律直接執行的 `useLayoutEffect` 把畫面捲到底一次（讓兩邊起始畫面一致），而「按下按鈕收到新訊息」是靠已掛載元件的 state 更新（不是重新掛載），所以每次按按鈕看到的行為不會被 StrictMode 影響；正式打包（`npm run build`）後同樣不會有 StrictMode 的額外執行。

### 3. Demo 3：`useId`——地址欄位重複 id 重現

對應 `src/components/IdDemoLab.jsx` + `src/components/AddressFields.jsx` + `src/components/BadAddressFields.jsx`。

同一個「地址欄位群組」元件在畫面上被渲染兩次（帳單地址、收件地址），上方分頁切換「✅ 使用 `useId`」與「❌ 寫死固定 id」兩種寫法。畫面下方有一個即時掃描目前 DOM 上有沒有重複 id 的偵測結果（`src/utils/useDuplicateIdReport.js`）。

**實際驗證方式**：點一下「收件地址」欄位群組裡「街道地址」的 **label 文字**（不要直接點輸入框）：

- 在「✅ 使用 `useId`」模式下：焦點正確跳到收件地址自己的輸入框。
- 切到「❌ 寫死固定 id」模式再試一次：焦點會**錯誤地**跳到帳單地址的輸入框——因為瀏覽器看到重複的 id，`htmlFor` 只認畫面上第一個符合的元素。同時下方的偵測結果也會顯示「⚠️ 偵測到重複的 id」。

這是這三個 Demo 裡，**最容易親手重現、也最直觀**的一個真實 bug：不需要理解任何時序或渲染機制，只要點一下 label 文字，就能立刻看到焦點跑錯地方。

## 七、常見陷阱整理

| 陷阱 | 說明 | 對策 |
| --- | --- | --- |
| 忘記用 `forwardRef` 包住元件，直接對函式元件傳 `ref` | React（19 之前）不會把 `ref` 當成一般 prop 轉發進函式元件，`ref.current` 會是 `null`，開發模式下可能出現警告 | 用 `forwardRef` 包住需要接收 `ref` 的函式元件（或改用 React 19 的「ref as a prop」寫法） |
| 混用「React 用 JSX 算出來的 `className`」與「用 `useImperativeHandle` 暴露的方法直接 `classList` 操作」，卻沒注意到兩者的執行時機 | 如果在同一個事件處理函式裡，先呼叫了會觸發重新渲染的 `setState`，再呼叫直接操作 DOM class 的命令式方法，`setState` 觸發的重新渲染有可能在稍後才 commit，把命令式加上去的 class 整個覆蓋掉 | 需要兩者都生效時，用 `flushSync` 強制先完成該次 state 更新的渲染與 commit，再執行命令式的 DOM 操作（詳見 Demo 1 的 `RegistrationForm.jsx`） |
| 把 `useImperativeHandle` 當成管理「畫面需要長期反映」的資料的手段（例如只用 `getValue()` 讓父層「主動去問」目前的值，取代原本該用的 `value` + `onChange` 受控模式） | 父層沒辦法「同步」反應這個值的變化，只能等某個時機點主動呼叫方法才拿得到最新值，喪失宣告式渲染「資料改變、畫面自動更新」的好處 | 長期需要跟著渲染的資料，優先用一般的 `props`／`state`（受控模式）；`useImperativeHandle` 保留給真正一次性、命令式的動作 |
| 把昂貴、非必要的計算放進 `useLayoutEffect`，而不是 `useEffect` | `useLayoutEffect` 是同步執行、會阻塞瀏覽器繪製，如果邏輯本身不需要「搶在繪製前完成」，只會白白拖慢畫面反應速度 | 預設優先使用 `useEffect`；只有「使用者會真的看到明顯閃爍」的量測後調整版面情境，才換成 `useLayoutEffect` |
| 在有伺服器端渲染（SSR）的框架中使用 `useLayoutEffect`，卻沒注意到它在伺服器端無法執行對應邏輯 | `useLayoutEffect` 依賴真實瀏覽器 DOM 才能量測，伺服器端渲染時沒有這個環境，React 會發出警告 | 純前端渲染（像今天的 Vite 範例）不受影響；有 SSR 需求時，考慮改用 `useEffect`，或依框架建議延後到客戶端才執行對應邏輯 |
| 同一個表單類元件在同一頁面被重複使用時，把 `id` 寫死成固定字串 | 兩份實例會產生完全相同的 `id`，`label htmlFor`／`aria-describedby` 只認畫面上第一個符合的元素，導致點擊第二份表單的 label，焦點卻跳到第一份表單，這是能親手重現的真實 bug | 一律用 `useId()` 產生「這一個元件實例」專屬的 id 前綴，再組出多個相關的子 id |
| 拿 `useId()` 產生的值當作 list 渲染時的 `key` | `useId()` 的值跟「元件實例」綁定，不會反映清單資料本身的新增／刪除／排序，會讓 React 的 diff 演算法做出錯誤判斷 | list 的 `key` 一律使用跟資料本身綁定的穩定識別碼（例如後端回傳的 `id` 欄位），`useId()` 只用在無障礙屬性 |

## 執行方式

```bash
cd examples/day17-imperative-layout-id-lab
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。也可以執行 `npm run build` 打包成正式版本，或執行 `npm run lint` 確認程式碼沒有明顯的 Hook 使用錯誤。
