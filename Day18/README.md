# Day 18｜React 19 新特性（一）：Actions 與表單

- 今日範例程式碼：[`Day18\examples\day18-actions-forms-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day18/examples/day18-actions-forms-lab)

## 一、為什麼需要 Actions：從 Day09 的手動表單談起

回顧 Day09 的會員註冊表單，送出邏輯長這樣：

```jsx
// src/components/RegisterForm.jsx
const [formData, setFormData] = useState(initialRegisterFormData)
const [errors, setErrors] = useState({})
const [hasSubmitted, setHasSubmitted] = useState(false)
const [submittedData, setSubmittedData] = useState(null)

function handleSubmit(event) {
  event.preventDefault() // 表單預設會整頁重新整理，SPA 裡幾乎都要手動阻止
  const validationErrors = validateRegisterForm(formData)
  setErrors(validationErrors)
  setHasSubmitted(true)

  if (Object.keys(validationErrors).length > 0) {
    setSubmittedData(null)
    return
  }
  // 驗證通過：模擬「註冊成功」
  setSubmittedData(formData)
  setFormData(initialRegisterFormData)
  setErrors({})
  setHasSubmitted(false)
}
```

這段程式碼完全可以運作，但注意到：它從頭到尾都是**同步**的——沒有真的打一支 API、沒有網路延遲，所以完全不需要處理「送出中」這個過渡狀態。一旦把「呼叫真正的後端」這件事加進來，同一段邏輯馬上就會膨脹成這樣（這是還沒寫、但你一定寫過的樣子）：

```jsx
const [isSubmitting, setIsSubmitting] = useState(false) // 新增：手動追蹤送出中
const [submitError, setSubmitError] = useState(null)     // 新增：手動追蹤失敗訊息

async function handleSubmit(event) {
  event.preventDefault()
  const validationErrors = validateRegisterForm(formData)
  setErrors(validationErrors)
  if (Object.keys(validationErrors).length > 0) return

  setIsSubmitting(true)       // 別忘記在開始時打開
  setSubmitError(null)
  try {
    const result = await fetch('/api/register', { method: 'POST', body: /* ... */ })
    // ...處理成功／伺服器回傳的錯誤...
  } catch (error) {
    setSubmitError(error.message)
  } finally {
    setIsSubmitting(false)     // 別忘記無論成功失敗都要關掉
  }
}
```

這段程式碼本身沒有錯，但暴露出幾個「每次寫表單都要重新處理一次」的固定痛點：

1. **`isSubmitting` 這種 state 很容易忘記處理某個分支**——尤其是 `finally` 忘了寫、或是某個 `return` 提早離開卻沒關掉 `isSubmitting`，就會讓按鈕永遠卡在「送出中」。
2. **「送出按鈕該不該 disable」這件事，往往得透過 props 一路往下傳**——如果送出按鈕是一個獨立的子元件，`isSubmitting` 就得從最外層一路傳進去。
3. **想要「送出留言先樂觀顯示、失敗再收回」這種體驗，得自己手刻一整套「暫存資料 + 真實資料」的邏輯**，並小心處理「什麼時候該把暫存資料換成真實資料／移除」。

React 19 的 **Actions** 就是官方針對這一整組痛點提出的解法：把「表單／按鈕觸發一段非同步邏輯」這件事，從「你自己手動組合一堆 `useState` + `try/catch/finally`」，收斂成「React 原生就認識、原生就會追蹤 `pending` 狀態」的一等公民。今天要學的四個角色——`<form action={fn}>`、`useActionState`、`useFormStatus`、`useOptimistic`——分別解決的正是上面列的三個痛點。

> 💡 官方部落格 [react.dev/blog "React v19"](https://react.dev/blog/2024/12/05/react-19) 對 Actions 的定義：「按照慣例，使用非同步 transition 的函式被稱為『Actions』。Actions 會自動管理提交資料的過程：Pending 狀態（從送出的那一刻開始，到最終狀態更新提交完成為止）、樂觀更新（Optimistic updates，可以在資料送出時樂觀地顯示使用者看到的狀態）、錯誤處理（當 Action 失敗時顯示錯誤 UI，並自動把樂觀更新復原成原本的值）。」

## 二、`<form action={...}>`：當 action 是函式時，React 接管了什麼

在 HTML 裡，`<form action="/some-url">` 的 `action` 本來就存在，代表「送出表單後要導航到哪個網址」。React 19 讓這個屬性多接受一種新的值：**一個函式**。

```jsx
<form action={someFunction}>
  <input name="message" />
  <button type="submit">送出</button>
</form>
```

### 1. `action` 是函式時，React 到底接管了哪些事

你可以把「把函式傳給 `action`」想像成請 React 幫表單內建一位「送出管家」：只要偵測到 `action` 是一個函式，每次表單送出時，管家都會自動做好三件事：

- **攔下瀏覽器預設的「整頁重新整理／換頁」行為**：效果等同你在 Day09 手動呼叫的 `event.preventDefault()`，差別只是這次不用自己寫。
- **自動幫你把整份表單目前的內容「打包」好**：你不需要一個一個欄位手動讀 `value`，`action` 函式會直接收到一份已經包好所有欄位內容的資料（也就是待會會看到的 `FormData`）。
- **把整個送出過程包成一段「進行中」的狀態，並自動往下廣播給子元件**：這正是為什麼待會要學的 `useFormStatus`、`useOptimistic` 完全不需要你手動處理「現在正在送出中」這件事，React 自己就會通知它們。

用一句話理解：**`<form action={fn}>` 把 Day09 手寫的「`event.preventDefault()` ＋ 手動組資料 ＋ 手動管理 `isSubmitting`」這三個步驟，一次幫你內建好了。**

> 🔍 **補充**：以下是從 React 原始碼追蹤、驗證上述行為的過程，不是必要閱讀，跳過也完全不影響你使用 Actions。
>
> 查閱 [`react/packages/react-dom-bindings/src/events/plugins/FormActionEventPlugin.js`](https://github.com/react/react/blob/main/packages/react-dom-bindings/src/events/plugins/FormActionEventPlugin.js)，這裡是瀏覽器 `submit` 事件真正被攔截處理的地方：
>
> ```js
> function submitForm() {
>   if (nativeEvent.defaultPrevented) {
>     // ...
>   } else if (typeof action === 'function') {
>     // A form action was provided. Prevent native navigation.
>     event.preventDefault();
> 
>     // Dispatch the action and set a pending form status.
>     const formData = new FormData(form, submitter);
>     const pendingState: FormStatus = {
>       pending: true,
>       data: formData,
>       method: form.method,
>       action: action,
>     };
>     if (__DEV__) {
>       Object.freeze(pendingState);
>     }
>     startHostTransition(formInst, pendingState, action, formData);
>   } else {
>     // No earlier event prevented the default submission, and no action was
>     // provided. Exit without setting a pending form status.
>   }
> }
> ```
>
> 這段程式碼揭露了三件事：
>
> 1. **只要 `action` 是函式，React 就會呼叫 `event.preventDefault()`**——瀏覽器原生「送出表單、整頁重新整理／導頁」的預設行為完全不會發生，跟你在 Day09 手動呼叫 `event.preventDefault()` 是同一件事，只是這次換 React 幫你做。
> 2. **React 會自己用原生 `FormData` API 讀出整個表單目前的內容**（`new FormData(form, submitter)`）——這就是為什麼 Action 函式收到的第二個參數會是一個 `FormData` 物件，而不是你熟悉的「一個一個欄位的 `value`」。
> 3. **`startHostTransition(...)` 才是真正執行 Action、追蹤 pending 狀態的地方**——它把整個提交過程包進一個 React transition，這正是 `useFormStatus`、`useOptimistic` 能夠自動感應到「現在有一個表單正在送出」的根本原因：**你完全不需要手動呼叫 `startTransition`，React 自己就把它包好了**。

### 2. 送出成功後，表單會自動重置（僅限「不受控」欄位）

如果你的 Action 函式「順利執行完畢」（沒有丟出任何錯誤），React 會自動幫你把表單裡「沒有用 `value`／`onChange` 手動控制」的欄位清空——效果就跟瀏覽器原生表單被呼叫了一次 `form.reset()` 一樣，完全不需要自己手動呼叫。

這裡有兩個容易搞混、但初學者一定要先弄清楚的時間點：

- **什麼時候會被判定為「順利執行完畢」**：只要你的 Action 函式最後正常 `return`、沒有丟出例外（沒有 `throw`），不管你自己在函式裡怎麼判斷「這次算不算成功」，**React 一律當作「順利完成」**——即使你回傳的是一個代表「失敗」的物件也一樣！
- **重置真正發生的時間點**：是等到整個 Action 函式（包含裡面所有的 `await`）**完全執行完畢**之後，欄位才會被清空，不是「使用者按下送出按鈕的那一瞬間」。

這也是為什麼下面的 ⚠️ 提醒特別重要：只要你自己 `catch` 住錯誤、正常結束函式，表單一樣會被清空，使用者剛打的內容也會跟著消失——這正是本篇範例的留言板要另外設計一個「失敗橫幅」保留使用者輸入內容的原因。

### 3. 不需要 `useActionState` 也能用：Action 可以是 Standalone 的

`<form action={...}>` 本身不強制要求搭配 `useActionState`。只要你的函式簽章符合「接收 `FormData`，回傳（或不回傳）一個值／Promise」，直接把一個 async 函式傳給 `action` 就會被 React 視為 Action，一樣會自動包成 transition、一樣能被子元件的 `useFormStatus` 讀到 pending 狀態。本篇範例的留言板（`src/components/CommentBoard.jsx`）就是刻意示範這種「Standalone Action」的寫法，跟下一節搭配 `useActionState` 的會員註冊表單形成對照。

## 三、`useActionState`：讓「非同步送出」變成一個狀態機

### 1. 基本語法

```js
const [state, formAction, isPending] = useActionState(actionFn, initialState, permalink?);
```

> 依據表單 Action（可為 Server Function 或一般 async 函式）的執行結果更新 state，回傳目前狀態、可傳給 `<form action={formAction}>` 的包裝函式，以及是否仍在等待結果的 `isPending`。此 Hook 是舊版 `react-dom` 的 `useFormState` 的後繼者，並已移入 `react` 核心套件。

用一句話理解：呼叫 `useActionState` 就像跟 React 要三樣東西——「目前的狀態」「一個可以直接塞進 `<form action={...}>` 的函式」，以及「現在是不是還在等結果」的布林值。以下整理出這三個回傳值分別對應什麼：

| 回傳值 | 說明 |
| --- | --- |
| `state` | 目前的狀態——也就是 `action` 函式上一次執行完畢後 `return` 的值。第一次渲染時等於 `initialState`。 |
| `formAction` | 包裝過的函式，直接傳給 `<form action={formAction}>`（或 `<button formAction={formAction}>`）；呼叫它就會觸發 `action` 執行一次。 |
| `isPending` | 布林值，`action` 正在執行（尚未 resolve/reject）時是 `true`，非常適合拿來 disable 按鈕或顯示 loading 提示。 |

你傳給 `useActionState` 的 `action` 函式，簽章固定是：

```js
async function action(previousState, formData) {
  // previousState：上一次這個 action 執行完畢後回傳的 state（第一次是 initialState）
  // formData：這次表單送出當下，React 用原生 FormData API 讀出來的表單內容
  return nextState // 這次執行完，會成為新的 state
}
```

這跟 Day12 學過的 `useReducer` 的 `reducer(state, action) => newState` 簽章幾乎一模一樣——差別只在於：`useActionState` 的這個函式**可以是 async**，而且它的「觸發時機」是真正的表單送出事件，不是你手動 `dispatch`。

### 2. 動手拆解

這是把 Day09 的會員註冊表單改寫成 Actions 版本的結果。先看 `registerAction`：

```jsx
// src/components/RegistrationForm.jsx
const initialState = { status: 'idle', errors: {}, message: '' }

async function registerAction(previousState, formData) {
  const values = {
    name: (formData.get('name') ?? '').toString().trim(),
    email: (formData.get('email') ?? '').toString().trim(),
    // ...其餘欄位...
  }

  // Step 1：跟 Day09 一模一樣的同步檢查，不需要問伺服器就能判斷。
  const clientErrors = validateRegisterForm(values)
  if (Object.keys(clientErrors).length > 0) {
    return { status: 'error', errors: clientErrors, message: '請修正下方標示的欄位' }
  }

  // Step 2：一定得問伺服器才會知道的規則（Email 是否已被註冊），這裡會有
  // 一段真實的網路延遲——這段 await 期間，isPending／useFormStatus 的
  // pending 都會是 true，送出按鈕也會被自動 disable。
  try {
    const result = await registerUser(values)
    if (!result.success) {
      return { status: 'error', errors: result.errors ?? {}, message: result.message }
    }
    return { status: 'success', errors: {}, message: `🎉 ${result.message}！歡迎加入，${result.user.name}` }
  } catch (networkError) {
    // 重點：一定要自己 catch！否則例外會變成 Error Boundary 錯誤，
    // 而不是被 useActionState 優雅地包成一個可以顯示在畫面上的錯誤 state。
    return { status: 'error', errors: {}, message: `無法連線到伺服器：${networkError.message}` }
  }
}
```

值得注意的設計：

- **先做同步驗證、再做非同步驗證**：`isPending` 涵蓋的是「整個 `registerAction` 函式」執行的時間，呼叫端完全不需要區分「這次卡住是因為在驗證欄位格式，還是真的在等網路回應」——這正是 Actions 幫你拉平的複雜度之一。
- **`try/catch` 是必要的**，不是防禦性寫法而已：正如第二節說明的，一旦例外被丟出去，整個表單所在的子樹會被 Error Boundary 取代，不會停留在原地顯示錯誤訊息。
- **伺服器端才驗證得出的規則**：`server/index.js` 預先塞了一個「已註冊」帳號 `test@example.com`，前端不可能無延遲、無需詢問伺服器就知道這件事——這正是需要真正網路請求的地方（詳見第七節動手實作）。

元件裡使用 `useActionState` 的方式：

```jsx
function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState)

  return (
    <form action={formAction} className="register-form" noValidate>
      {/* ...欄位... */}
      {state.status === 'error' && <p role="alert">⚠️ {state.message}</p>}
      {state.status === 'success' && <p>{state.message}</p>}
      <SubmitButton pendingLabel="註冊中...">註冊</SubmitButton>
    </form>
  )
}
```

注意 `<form>` 上沒有 `onSubmit`，只有 `action={formAction}`；`noValidate` 是為了關閉瀏覽器原生的表單驗證提示框，改成完全由 `validateRegisterForm` 自己控制錯誤訊息的顯示方式（跟 Day09 一致）。

### 3. 為什麼是「排隊」而不是「取消上一次」：sequential 執行

官方文件特別強調：如果同一個 `formAction` 被連續呼叫多次（例如使用者手很快、連點兩次送出按鈕），這些呼叫**不會互相取消**，而是排隊、依序（sequentially）執行——每一次呼叫收到的 `previousState`，都是「前一次呼叫」執行完畢後的結果，而不是「呼叫當下」畫面上顯示的 `state`。

白話來說，這就像銀行櫃檯排隊辦事：連點兩次送出按鈕，等於拿了兩張號碼牌——櫃員（React）一定會先把第一張申請單處理完、蓋完章，才輪到處理第二張，絕對不會兩張同時處理，也不會讓後面那張插隊蓋掉前面的結果。

對今天的範例來說，這代表：如果你在「註冊中...」按鈕還沒完成時，想辦法再次觸發 `registerAction`（本範例已透過 `SubmitButton` 在 `pending` 時 disable 按鈕來避免這個情境），第二次呼叫並不會平白蓋掉第一次的結果，而是乖乖等第一次真的執行完，再輪到它開始執行。

## 四、`useFormStatus`：讓表單內的子元件知道「現在送出中」

### 1. 基本語法

```js
import { useFormStatus } from 'react-dom';
const { pending, data, method, action } = useFormStatus();
```

> 讀取「最近的父層 `<form>`」目前提交狀態，常用於表單內的子元件（例如提交按鈕）依 `pending` 狀態顯示 loading 效果，不需額外透過 props 傳遞提交狀態。

用一句話理解：`useFormStatus()` 就像掛在表單門口的一塊「目前狀態」告示牌——平常沒人送出表單時，牌子顯示 `pending: false`；一旦表單開始送出，牌子就會翻面顯示 `pending: true`，還會附上這次送出的表單內容。

`pending` 為 `false` 時，`data`／`method`／`action` 一律是 `null`；`pending` 為 `true` 時，可以透過 `data` 讀到這次送出的完整 `FormData`（例如拿來顯示「正在送出『xxx』...」這種更細緻的提示）。

### 2. 為什麼只有「表單內部」的子元件才讀得到 pending 狀態

`useFormStatus` 最常被提到的限制是：「只讀得到**父層** `<form>` 的狀態，讀不到自己所在元件、或兄弟元件裡的 `<form>`」。

**白話理解**：把 `<form>` 想像成一間正在開會的「會議室」，`pending` 狀態就是貼在會議室**裡面**牆上的公告——只有走進會議室裡面的人才看得到這張公告。

- **負責蓋這間會議室的人**（也就是渲染出 `<form>` 標籤的那個元件本身）：他站在會議室外面監工，看不到自己剛掛到裡面牆上的公告，所以讀到的永遠是「沒有開會」（`pending: false`）。
- **被叫進會議室開會的人**（也就是寫在 `<form>...</form>` 標籤「裡面」的獨立子元件，例如送出按鈕）：他人在會議室裡面，一抬頭就看得到牆上的公告，讀到的才是即時的 `pending: true`。

記住這個畫面，就能秒懂「為什麼在渲染 `<form>` 的同一層呼叫 `useFormStatus()` 永遠是 `false`，要包成獨立子元件、放進 `<form>` 裡面才讀得到 `true`」——不需要知道 React Context 底層怎麼實作。

### 3. 動手拆解：`SubmitButton.jsx`（正確用法）vs `RegistrationForm.jsx` 裡的錯誤示範

先看正確的寫法——獨立成一個元件：

```jsx
// src/components/SubmitButton.jsx
function SubmitButton({ children, pendingLabel = '送出中...' }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn btn--primary" disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  )
}
```

`RegistrationForm.jsx` 裡刻意留了一段**錯誤示範**，讓你可以直接在畫面上比對兩者的差異：

```jsx
// src/components/RegistrationForm.jsx
function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState)

  // ❌ 錯誤示範：在「渲染 <form> 的同一個元件」裡呼叫 useFormStatus()。
  // wrongStatus.pending 永遠是 false，因為 RegistrationForm 相對於它自己
  // 渲染出來的 <form> 來說，是外層而不是子孫。
  const wrongStatus = useFormStatus()

  return (
    <form action={formAction} /* ... */>
      {/* ...欄位... */}
      <SubmitButton pendingLabel="註冊中...">註冊</SubmitButton>
      <span className="status-chip">
        ✅ useActionState 的 isPending：<strong>{String(isPending)}</strong>
      </span>
      <span className="status-chip status-chip--wrong">
        ❌ 同層呼叫 useFormStatus 的 pending：<strong>{String(wrongStatus.pending)}</strong>
      </span>
    </form>
  )
}
```

實際打開範例、按下「註冊」按鈕的當下，畫面會同時顯示兩顆狀態徽章——一顆（`isPending`，來自 `useActionState`）正確跳成 `true`，另一顆（`wrongStatus.pending`，同層呼叫 `useFormStatus`）則自始至終都是 `false`。兩者並排顯示，不需要額外的說明文字，光是實際操作就能親眼確認「同一層呼叫讀不到 pending」這件事是真的，而不是文件上的一句警告而已。

> 💡 這裡也可以順便理解：`isPending`（來自 `useActionState`）跟 `wrongStatus.pending`（`useFormStatus` 放錯位置）雖然目的類似，但**不是同一個東西**——前者是「這個 `useActionState` 實例」自己追蹤的狀態，可以在任何呼叫它的元件裡正常讀到；後者才是真正依賴「元素樹位置」的 Context 讀取。真正需要在跟 `<form>` 「同一層」的地方顯示 pending 狀態時，`useActionState` 回傳的 `isPending` 就是正解，不需要用到 `useFormStatus`。`useFormStatus` 存在的意義，是解決「送出按鈕是一個共用元件、不知道自己會被放進哪一個表單」這種情境，讓它不需要透過 props 一路往下傳 `pending`。

## 五、`useOptimistic`：先樂觀顯示，等真正結果出爐再收斂

### 1. 基本語法

```js
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn?);
```

用一句話理解：`useOptimistic` 就像先幫你「打草稿」——伺服器還沒回覆之前，先讓畫面顯示你「猜」使用者會看到的結果；等真正的回覆到了，草稿就會被正式資料悄悄換掉。語法 `const [optimisticState, addOptimistic] = useOptimistic(state, updateFn?)` 裡這四個名稱分別對應什麼：

**先看「你要傳進去」的兩個參數：**

| 參數 | 說明 |
| --- | --- |
| `state` | 目前「真實」的狀態，通常就是你原本用 `useState` 管理的那份資料（例如留言清單）。沒有任何 Action 在執行時，`useOptimistic` 回傳的 `optimisticState` 會完全等於這個值。 |
| `updateFn?`（可省略） | 簽章是 `(state, optimisticValue) => nextOptimisticState`：決定「呼叫 `addOptimistic(optimisticValue)` 之後，畫面上樂觀顯示的資料該長什麼樣子」。省略不傳的話，行為等同 `(state, optimisticValue) => optimisticValue`——也就是 `addOptimistic` 傳進去的值，會直接變成新的 `optimisticState`。 |

**再看「它回傳給你」的兩個值：**

| 回傳值 | 說明 |
| --- | --- |
| `optimisticState` | 真正要拿去畫面上渲染的狀態。平常（沒有 Action 在執行）就等於 `state`；一旦呼叫過 `addOptimistic`，會立刻變成 `updateFn(state, 你傳的值)` 執行後的結果，讓使用者馬上看到「預期中」的畫面。 |
| `addOptimistic` | 用來觸發樂觀更新的函式，呼叫方式是 `addOptimistic(optimisticValue)`。呼叫它只是在說「先假設結果會是這樣，把這筆資料樂觀地顯示出來」——它本身**不會**發送任何網路請求，單純只是讓 `optimisticState` 立刻改變。 |

簡單說：`state`／`updateFn?` 是你「餵給」`useOptimistic` 的輸入，`optimisticState`／`addOptimistic` 則是它「還給」你、實際會寫進 JSX 裡使用的輸出——兩組名稱剛好對應語法那行等號的左右兩側。

### 2. 五個步驟理解資料流

把官方文件的說明對照 `useOptimistic` 的名字（optimistic＝樂觀），可以拆成五個步驟：

1. 使用者觸發一個 Action（例如送出留言表單）。
2. 在 Action 函式裡，**先**呼叫 `addOptimistic(預期的資料)`——這一刻畫面立刻更新，使用者馬上看到「看起來已經送出去了」的內容，不需要等任何網路回應。
3. Action 函式接著才真正呼叫 API（`await postComment(...)`），這時候真實的網路請求才送出。
4. 如果請求成功：把「真實」的 state 更新成包含伺服器回傳的資料——這個當下，React 的渲染會直接收斂成「真實 state」，樂觀資料自然被取代掉，中間不會有額外多餘的畫面閃爍。
5. 如果請求失敗：因為真實的 state 沒有被更新，Action 結束的瞬間，剛才樂觀顯示的那筆資料會直接消失——這不是 bug，是 `useOptimistic` 的設計本來就如此：**樂觀值只在「Action 進行中」這段期間存在**。

> 官方文件特別強調的一點：「沒有額外的一次渲染去清除樂觀狀態——樂觀狀態跟真實狀態，會在同一次渲染裡一起收斂完成」（There's no extra render to clear the optimistic state）。這也是為什麼你不需要自己寫「Action 結束後手動清掉暫存資料」這種邏輯，React 會在 transition 完成的那次渲染自動處理好。

`useOptimistic` **必須**在一個 Action 裡呼叫才有意義——因為它跟 `useFormStatus` 一樣，都是搭著 `<form action={fn}>` 或 `startTransition` 建立出來的 transition 機制運作，脫離 Action 呼叫 `addOptimistic` 不會有前述「跟著 Action 結束自動收斂」的行為。

### 3. 動手拆解

```jsx
// src/components/CommentBoard.jsx
function CommentBoard() {
  const [comments, setComments] = useState([])       // 「真正的」留言清單
  const [networkMode, setNetworkMode] = useState('normal')
  const [lastFailure, setLastFailure] = useState(null)

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment) => [...state, newComment],
  )

  // commentFormAction 直接傳給 <form action={...}>，沒有經過 useActionState
  // 包裝——這是刻意的對照組：不是每個 Action 都需要 useActionState。
  async function commentFormAction(formData) {
    const name = (formData.get('name') ?? '').toString().trim() || '匿名訪客'
    const message = (formData.get('message') ?? '').toString().trim()
    if (!message) return

    setLastFailure(null)

    // 立刻樂觀顯示這則留言——這個當下，comments（真正的 state）根本還沒
    // 有變，optimisticComments 卻已經多了這一筆，畫面上會馬上看到它。
    addOptimisticComment({
      id: `pending-${Date.now()}`,
      name,
      message,
      createdAt: new Date().toISOString(),
      pending: true,
    })

    try {
      const { comment } = await postComment({ name, message, networkMode })
      setComments((prev) => [...prev, comment])
    } catch (error) {
      // 送出失敗：不更新 comments，樂觀顯示的那則留言會直接消失。
      // 用另一個 state 記錄失敗原因與原始內容，讓使用者知道發生了什麼事。
      setLastFailure({ name, message, reason: error.message })
    }
  }

  return (
    <form action={commentFormAction} className="comment-form">
      <input name="name" placeholder="你的名字（可留空）" />
      <input name="message" placeholder="輸入留言內容" required />
      <SubmitButton pendingLabel="送出中...">送出留言</SubmitButton>
    </form>
  )
}
```

畫面渲染的是 `optimisticComments`（而不是 `comments`），並用 `comment.pending` 決定要不要顯示「送出中...」的樣式與徽章——這樣「暫時的」跟「真實的」留言在畫面上就能用同一份清單、同一段渲染邏輯處理，不需要額外判斷「這筆是暫時的還是真的」再分開渲染兩份清單。

`postComment` 呼叫時額外帶了 `networkMode` 參數，對應到 `server/index.js` 可控制的三種送出模式（見下一節），刻意不使用隨機失敗，讓「樂觀顯示 → 被真實資料覆蓋」跟「樂觀顯示 => 消失＋顯示失敗原因」這兩種結果，都能穩定、可重複地被觸發與驗證，而不必依賴運氣。

### 4. 呼應第二節：失敗時欄位仍會被自動清空

延續第二節「⚠️」段落交叉驗證出的結論——`commentFormAction` 在 `catch` 區塊裡沒有把錯誤往外丟，只是正常 `return`（隱式回傳 `undefined`），所以從 React 的角度看，這次 Action **依然算是順利完成**，`<form>` 裡不受控的 `<input name="message">` 一樣會被自動清空。這正是 `lastFailure` 這個 state 存在的原因：把「使用者當時打的名字／留言內容／失敗原因」額外記下來，顯示成一則錯誤橫幅：

```jsx
{lastFailure && (
  <p className="form-banner form-banner--error" role="alert">
    ⚠️「{lastFailure.message}」送出失敗：{lastFailure.reason}（請確認內容後再試一次）
  </p>
)}
```

如此一來，即使輸入框本身被清空了，使用者仍然能在畫面上看到剛才打的內容與失敗原因，而不是毫無說明地「打完的字憑空消失」。

## 六、四個角色的小結對照表

| API | 解決的問題 | 回傳值 | 誰該用 |
| --- | --- | --- | --- |
| `<form action={fn}>` | 讓 React 接管表單送出這個事件本身：自動 `preventDefault`、自動包成 transition、成功後自動重置不受控欄位 | （無，`fn` 直接接收 `FormData`） | 所有想要拿到 Actions 系列好處（pending／樂觀更新／自動重置）的表單 |
| `useActionState` | 幫你保管「上一次 Action 執行結果」的狀態機，取代手動 `useState` 管 `errors`／`isSubmitting` | `[state, formAction, isPending]` | 需要顯示錯誤訊息、成功訊息、或任何「上次送出結果」的表單 |
| `useFormStatus` | 讀取「父層 `<form>`」目前的提交狀態，不需要透過 props 往下傳 | `{ pending, data, method, action }` | 表單「內部」的獨立子元件（送出按鈕、loading 提示），且必須是共用元件情境 |
| `useOptimistic` | 在真正結果出爐前，先樂觀顯示預期中的畫面，讓互動感覺更即時 | `[optimisticState, addOptimistic]` | 需要「感覺起來很快」的列表型 UI（留言、按讚、聊天訊息） |

四者的共同心法：**它們都建立在同一套 transition 機制之上**——`<form action={fn}>` 是觸發點，`useActionState`／`useFormStatus`／`useOptimistic` 則是三種「讀取／管理這個 transition 相關資訊」的不同角度。理解了「`<form>` 會把 pending 狀態放進 Context 往下傳」「Action 沒有 throw 就算完成」這兩個底層規則之後，其餘的行為幾乎都可以自己推導出來，不需要死背。

## 七、今日範例

### 專案結構

這是本系列第一個需要「真正後端」的範例，因此拆成前後端兩個獨立的 `package.json`：

```
examples/day18-actions-forms-lab/
├── server/                  # Express 後端（port 4018）
│   ├── package.json
│   └── index.js             # /api/register、/api/comments
├── src/
│   ├── components/
│   │   ├── ActionsFormsLab.jsx   # 分頁容器
│   │   ├── RegistrationForm.jsx  # Demo 1：useActionState + useFormStatus
│   │   ├── CommentBoard.jsx      # Demo 2：useOptimistic
│   │   ├── SubmitButton.jsx      # 共用：正確示範 useFormStatus
│   │   └── FieldError.jsx
│   ├── utils/
│   │   ├── api.js           # fetch 包裝：registerUser／fetchComments／postComment
│   │   └── validators.js    # 沿用 Day09 的驗證邏輯
│   └── App.jsx
├── vite.config.js           # /api 開發代理，轉發到 http://localhost:4018
└── package.json              # 前端（Vite + React，port 5173）
```

`vite.config.js` 把所有 `/api` 開頭的請求代理到 Express，讓前端程式碼統一呼叫相對路徑（例如 `fetch('/api/register')`），不需要處理 CORS、也不必把後端網址寫死：

```js
const apiProxy = {
  '/api': { target: 'http://localhost:4018', changeOrigin: true },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
```

### 1. Demo 1：會員註冊（`useActionState` + `useFormStatus`）

實際測試過的三種情境（對應 `server/index.js` 的驗證規則）：

- **什麼都不填直接按「註冊」**：`registerAction` 的 Step 1（同步驗證）就會擋下，姓名／Email／密碼／確認密碼／性別／城市六個欄位都會顯示對應的錯誤訊息，**完全不會發出任何網路請求**（實測 API 完全沒被呼叫）。
- **填入 `test@example.com`**（伺服器預先塞好的「已註冊」帳號）**+ 其餘欄位都合法**：同步驗證會通過，接著真的發出 `POST /api/register`，等待約 1 秒後收到 HTTP 422，畫面顯示「這個 Email 已經被註冊過了，請換一個或直接登入」——這條規則**只有伺服器才知道**，前端不可能無延遲驗證出來，實測回應內容：
  ```json
  { "success": false, "errors": { "email": "這個 Email 已經被註冊過了，請換一個或直接登入" }, "message": "註冊失敗，請確認下方標示的欄位" }
  ```
- **填入全新的 Email + 其餘欄位都合法**：約 1 秒後收到 HTTP 201，畫面顯示「🎉 註冊成功！歡迎加入，OOO」，且因為所有欄位都是不受控（沒有 `value`/`onChange`），送出成功後 React 會自動把整個表單清空，不需要手動呼叫 `form.reset()`。實測回應內容：
  ```json
  { "success": true, "user": { "name": "陳大文", "email": "newuser@example.com" }, "message": "註冊成功" }
  ```

送出過程中（尤其是等待伺服器那 1 秒），觀察畫面下方兩顆狀態徽章：`useActionState` 的 `isPending` 會正確變成 `true`（送出按鈕同時也會被 `SubmitButton` 內的 `useFormStatus` 自動 disable、文字變成「註冊中...」）；同層呼叫 `useFormStatus()` 的 `wrongStatus.pending` 則自始至終都是 `false`——兩者並排顯示，親眼比對第四節提到的限制。

### 2. Demo 2：留言板（`useOptimistic`）

上方「送出模式」可以切換三種狀況，對應 `server/index.js` 依 `networkMode` 決定的延遲與結果（皆已實測驗證）：

| 送出模式 | 伺服器行為（實測延遲） | 畫面上會看到的結果 |
| --- | --- | --- |
| ✅ 正常（約 0.7 秒） | 延遲 700ms 後回傳 HTTP 201 + 這則留言的資料 | 留言先以「送出中...」樣式出現在清單最下方，約 0.7 秒後樣式恢復正常（收斂成真實資料，畫面沒有任何額外閃爍） |
| 🐢 較慢（約 2.6 秒） | 延遲 2600ms 後回傳 HTTP 201 | 同上，只是「送出中...」的樣式會停留更久，方便清楚觀察樂觀狀態存在的這段期間 |
| ❌ 模擬伺服器拒絕 | 延遲 1200ms 後回傳 HTTP 500 | 留言先以「送出中...」樣式短暫出現，約 1.2 秒後**直接從清單消失**，下方出現紅色錯誤橫幅顯示剛才的留言內容與失敗原因；輸入框本身也會被 React 自動清空（見第五節第 4 小節的說明） |

實測 `POST /api/comments` 三種模式的回應（直接呼叫 API 驗證，不透過畫面）：

```json
// networkMode: "normal"（實測耗時 746ms）
{ "success": true, "comment": { "id": 2, "name": "測試者", "message": "...", "createdAt": "..." } }

// networkMode: "fail"（實測耗時 1208ms）
{ "success": false, "message": "伺服器暫時無法處理這則留言，請稍後再試一次" }
```

失敗的留言確認**不會**被寫進伺服器端的資料裡——後續呼叫 `GET /api/comments` 驗證過，清單裡只會有成功送出的那幾筆，不包含失敗的那則。

## 八、常見陷阱整理

| 陷阱 | 說明 | 對策 |
| --- | --- | --- |
| 在「渲染 `<form>` 的同一個元件」裡呼叫 `useFormStatus()` | 該元件相對於自己渲染出來的 `<form>` 是外層，不是子孫，讀 Context 只會拿到預設值 `{ pending: false, ... }`，永遠讀不到 `true` | 把需要讀 pending 狀態的部分（通常是送出按鈕）抽成獨立子元件，放在 `<form>...</form>` 裡面 |
| Action 函式忘記自己 `catch` 非同步錯誤 | 例外會被 React 當成渲染錯誤，觸發最近的 Error Boundary，整個表單（甚至更外層的畫面）被錯誤畫面取代，而不是停留原地顯示錯誤訊息 | 一律用 `try/catch` 包住 Action 內的非同步呼叫，把錯誤轉換成一個「代表失敗」的回傳值 |
| 誤以為「自己 `catch` 掉錯誤」等於「表單不會被自動重置」 | React 判斷 Action 是否成功，只看函式回傳的 Promise 有沒有 reject，跟你自己的業務邏輯判斷無關；只要沒有 throw，不受控欄位一律會被清空 | 需要保留使用者輸入內容以便重試時，另外用一個 state 記下失敗當下的原始輸入內容，顯示在錯誤訊息旁邊（見 `CommentBoard.jsx` 的 `lastFailure`） |
| 在 Action **之外**（例如按鈕的 `onClick`，而不是表單送出流程）呼叫 `addOptimistic` | `useOptimistic` 依賴 transition 機制才能在 Action 結束時自動收斂樂觀狀態，脫離 Action 呼叫可能無法如預期般被清除或替換 | `addOptimistic` 一律在 Action 函式（`<form action={fn}>` 呼叫的那個函式）內部呼叫 |
| 表單有多個欄位，卻只在部分欄位加 `name` 屬性 | React 讀取 `FormData` 完全依賴原生 `<input name="...">` 的 `name` 屬性，沒有 `name` 的欄位在 `formData.get(...)` 裡會讀不到值 | 表單裡每個要送出的欄位都要確實加上 `name`，跟原生 HTML 表單的規則一致 |
| 把 `useActionState` 的 `isPending` 跟同層呼叫 `useFormStatus()` 的結果混為一談 | 兩者運作機制不同：`isPending` 是這個 `useActionState` 實例自己追蹤的狀態，`useFormStatus` 則依賴 Context／元素樹位置 | 跟 `<form>` 同層或更外層時，一律用 `useActionState` 回傳的 `isPending`；只有表單「內部」共用子元件才需要 `useFormStatus` |

## 執行方式

今天的範例第一次需要**同時啟動兩個服務**：Express 後端（提供 `/api/register`、`/api/comments`）與 Vite 前端。建議開兩個終端機視窗：

```bash
# 終端機 1：啟動後端 API（http://localhost:4018）
cd Day18/examples/day18-actions-forms-lab/server
npm install
npm start
# 或使用 npm run dev（node --watch，程式碼變更會自動重啟）
```

```bash
# 終端機 2：啟動前端 Vite 開發伺服器（http://localhost:5173）
cd Day18/examples/day18-actions-forms-lab
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。若看到「留言載入失敗」或註冊送出後一直卡在「無法連線到伺服器」，請先確認終端機 1 的 Express 服務是否已經成功啟動（會印出 `[day18-actions-forms-lab] Express server ready at http://localhost:4018`）。

也可以執行 `npm run build` 將前端打包成正式版本，或執行 `npm run lint` 確認程式碼沒有明顯的 Hook 使用錯誤——這兩個指令都只需要在前端（`examples/day18-actions-forms-lab`）目錄下執行，後端是一支單純的 Express 應用，不需要打包。
