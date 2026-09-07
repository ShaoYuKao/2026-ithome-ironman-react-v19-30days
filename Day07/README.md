# Day 07｜週複習與小專案：待辦清單 App

- 今日範例程式碼：[`Day07\examples\todo-list-app`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day07/examples/todo-list-app)

## 一、本週學習地圖回顧

在動手做小專案之前，先快速複習一次這一週每天學了什麼、對應到今天小專案的哪個部分，讓「這一週到底學了什麼」在腦中連成一條線，而不是六天各自獨立的片段知識：

| Day | 主題 | 在今天小專案裡對應到的部分 |
| --- | --- | --- |
| Day01 | React 是什麼、開發環境建置 | 整個 `todo-list-app` 專案本身就是用 `npm create vite@latest` 建立的 React 19 專案 |
| Day02 | JSX 語法、`{}` 嵌入表達式 | `{remainingCount}`、`{todo.text}` 等各種在 JSX 裡動態帶入資料的寫法 |
| Day03 | 元件與 Props、`children` | 拆成 `TodoApp` / `TodoInput` / `FilterBar` / `TodoList` / `TodoItem` 五個元件，透過 props 互相傳遞資料與函式 |
| Day04 | `useState`、不可變性、Lazy Initializer | `todos`、`filter` 兩個 state；新增/切換/刪除一律用展開運算符與 `.map()`/`.filter()` 產生新陣列；`useState(loadTodos)` 用 Lazy Initializer 讀取 `localStorage` |
| Day05 | 事件處理、受控元件 | `TodoInput` 的 `onChange` + `value`（受控輸入框）、`onSubmit` + `preventDefault()`、`TodoItem` 的 `onChange`（checkbox）與 `onClick`（刪除） |
| Day06 | 條件渲染、列表渲染、`key` | `FilterBar` 的三元運算子、`&&`；`TodoList` 的提早 return（空清單）；`.map()` + `key={todo.id}` 渲染整份清單 |

**今天不會有太多全新的 API**，重點是把這六天學過的東西，**用「元件之間該怎麼協作」的角度重新組裝一次**，並補上一個新技能：用原生 `localStorage` 讓資料持久化。

## 二、待辦清單 App 的整體架構設計

### 1. 先畫出元件樹

```
App
└── TodoApp（狀態集中管理：todos、filter）
    ├── TodoInput（受控輸入框，負責「新增」）
    ├── FilterBar（切換 全部／未完成／已完成，負責「篩選」與「清除已完成」）
    └── TodoList（依篩選結果渲染列表）
        └── TodoItem（單一待辦事項：勾選完成、刪除）
```

`TodoInput`、`FilterBar`、`TodoList` 三個是**兄弟元件**，彼此看不到對方的內部資料。但它們三個都需要用到「同一份待辦清單資料」：

- `TodoInput` 要**新增**一筆到清單裡。
- `FilterBar` 要根據清單**算出**「還有幾項未完成」，並且能**清除**已完成的項目。
- `TodoList` 要把清單**篩選**、渲染出來。

### 2. 狀態提升（Lifting State Up）：資料該放在誰身上？

如果 `todos` 這份資料分別放在 `TodoInput` 或 `TodoList` 自己身上，其他兄弟元件就完全拿不到、也改不了它——Props 只能**由父元件往下傳給子元件**，沒有辦法在兄弟元件之間直接傳遞。

解法是 React 社群非常常見的一個模式，稱為**狀態提升（Lifting State Up）**：

> 當多個元件需要共享、同步同一份會變動的資料時，把這份 state **往上移動到它們共同的最近父元件**身上，再透過 Props **由上往下**傳給每一個需要用到它的子元件。

對照到今天的專案，`todos` 和 `filter` 這兩個 state 都宣告在 `TodoInput`、`FilterBar`、`TodoList` 的共同父元件 `TodoApp` 身上：

```jsx
function TodoApp() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('all')
  // ……
}
```

### 3. 溝通模式：「資料往下傳，事件往上回報」

State 提升到 `TodoApp` 之後，子元件要「讀取資料」很直覺——直接透過 props 往下傳即可（例如 `<TodoList todos={visibleTodos} />`）。但子元件要「修改資料」呢？子元件自己並沒有 `setTodos` 這個函式，Props 又是唯讀的——解法是：**父元件把「處理某個操作的函式」也透過 props 傳下去，子元件只需要在使用者互動時呼叫這個函式，實際的 state 更新邏輯仍然寫在父元件裡**。

```jsx
// TodoApp.jsx（父元件）：定義好「新增」該怎麼處理
function handleAdd(text) {
  const newTodo = { id: crypto.randomUUID(), text, completed: false }
  updateTodos([...todos, newTodo])
}

// 把 handleAdd 這個函式，當成一個叫做 onAdd 的 prop 傳給子元件
<TodoInput onAdd={handleAdd} />
```

```jsx
// TodoInput.jsx（子元件）：不知道、也不需要知道 todos 陣列長什麼樣子，
// 只需要在使用者送出表單時，呼叫父元件傳進來的 onAdd
function TodoInput({ onAdd }) {
  // ……
  onAdd(trimmed)
}
```

這個「資料（data）往下流、事件（event）往上回報」的模式，就是 React 資料流動的核心原則——**單向資料流（One-way Data Flow）**。整個 App 只有 `TodoApp` 一個地方真正呼叫 `setTodos`，其他元件都是透過呼叫父元件給的函式來「請求」變更，而不是自己偷偷改資料。好處是：**只要看 `TodoApp` 這一個檔案，就能知道 `todos` 有哪幾種可能的變化方式**，不用擔心資料在其他地方被意外修改，之後專案變大時也比較容易除錯。

## 三、事件處理回顧

今天的 App 裡用到的事件處理，都是 Day05 學過的東西，這裡快速對照一次：

```jsx
// 1. 受控輸入框：value + onChange，讓 state 隨每次按鍵同步更新
<input type="text" value={text} onChange={(event) => setText(event.target.value)} />

// 2. 表單送出：onSubmit + event.preventDefault() 阻止整頁重新整理
<form onSubmit={handleSubmit}>...</form>

// 3. checkbox 也是受控元件：checked 對應 state，onChange 觸發切換
<input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />

// 4. 一般點擊事件，搭配 inline arrow function 傳遞這一筆資料的 id
<button onClick={() => onDelete(todo.id)}>刪除</button>
```

沒有新東西，但值得留意：**不管是 `TodoInput` 的文字框、還是 `TodoItem` 的 checkbox，全部都是受控元件**——畫面顯示的內容，永遠是由 state 決定，使用者的操作只是「觸發一次 state 更新」，而不是讓瀏覽器自己記住輸入框的內容。這也是為什麼待辦事項勾選完成後，畫面能立刻同步顯示刪除線樣式與「已完成」徽章：它們都只是根據同一份 `todo.completed` state 渲染出來的結果。

## 四、條件渲染與列表渲染回顧

```jsx
// 三元運算子：兩種情況都要顯示「不同但同樣重要」的內容
{remainingCount > 0 ? (
  <p className="filter-summary">還有 {remainingCount} 項待完成</p>
) : (
  <p className="filter-summary">🎉 全部完成了！</p>
)}

// && 寫法：只有存在已完成項目時，才顯示「清除已完成」按鈕
{completedCount > 0 && (
  <button onClick={onClearCompleted}>清除已完成（{completedCount}）</button>
)}

// 提早 return：清單是空的時候，直接回傳提示文字
if (todos.length === 0) {
  return <p className="empty-state">目前沒有符合條件的待辦事項</p>
}

// .map() + key：渲染整份清單，key 用穩定的 id，不用陣列 index
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
))}
```

這裡特別想再強調一次 Day06 的重點：`remainingCount > 0 ? ... : ...` 之所以用三元運算子而不是 `remainingCount && ...`，是因為 `remainingCount` 是數字，當它剛好是 `0` 時，`&&` 寫法會讓 React 把 `0` 當成合法內容直接印在畫面上；而 `completedCount > 0 && (...)` 這裡雖然條件本身也是比較運算式、結果一定是明確的 boolean，用 `&&` 才是安全的。

## 五、加分項目：用原生 `localStorage` 讓資料持久化（先不用 `useEffect`）

到目前為止的待辦清單，只要重新整理頁面，`todos` state 就會被重設成初始值 `[]`，之前新增的資料全部消失——因為 React 的 state **只存在於瀏覽器分頁記憶體中**，並不會自動保存到任何地方。今天要解決這個問題，先用瀏覽器原生的 API 就好。

### 1. 認識 `localStorage`：瀏覽器內建的鍵值儲存空間

`localStorage` 是瀏覽器提供的一個全域物件，可以把資料以「字串」的形式儲存在使用者的瀏覽器裡，就算關閉分頁、重新開機，資料依然存在（除非使用者自己清除瀏覽器資料）。核心只有兩個方法：

```js
localStorage.setItem('key名稱', '要儲存的字串') // 寫入資料
localStorage.getItem('key名稱')                // 讀取資料，找不到會回傳 null
localStorage.removeItem('key名稱')             // 移除資料（今天用不到，先知道有這個方法）
```

**注意：`localStorage` 只能儲存字串**，如果要存陣列或物件（例如我們的 `todos`），必須先用 `JSON.stringify()` 轉成字串才能存進去；讀取回來時，再用 `JSON.parse()` 把字串轉回原本的陣列或物件。今天範例把這兩個方向的轉換，包成兩個工具函式放在 `src/utils/storage.js`：

```js
// Day07\examples\todo-list-app\src\utils\storage.js
const STORAGE_KEY = 'day07-todo-list'

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    // localStorage 內容可能被手動改壞、或瀏覽器處於無痕模式導致讀取失敗，
    // 用 try/catch 接住，改用空清單當保底，避免整個 App 白屏崩潰。
    console.error('讀取 localStorage 失敗，改用空清單啟動：', error)
    return []
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.error('寫入 localStorage 失敗：', error)
  }
}
```

### 2. 讀取初始資料：用 Day04 學過的 Lazy Initializer

還記得 Day04 提過，`useState` 的參數除了直接傳值，還可以傳一個「函式」，這個函式只會在元件**掛載時的第一次渲染**被呼叫一次（Lazy Initializer）。讀取 `localStorage` 剛好符合「初始值需要額外計算（讀檔 + JSON 解析）」這個使用時機：

```jsx
// ❌ 如果寫成 useState(loadTodos())，loadTodos() 會在「每一次重新渲染」都被呼叫一次，
//    只是第二次以後算出來的結果會被 React 直接丟棄不用（因為 useState 只在掛載時採用它），
//    但每次都要重新讀取、解析一次 localStorage，白白浪費效能。
const [todos, setTodos] = useState(loadTodos())

// ✅ 傳「函式本身」，不要加 ()：只有元件掛載的第一次渲染會呼叫 loadTodos()
const [todos, setTodos] = useState(loadTodos)
```

### 3. 寫入資料：不倚賴 `useEffect`，直接在「操作發生的當下」同步寫入

之後幾天才會學到 `useEffect`，今天先採用一個更直覺的做法：**每一次會改變 `todos` 的操作（新增、切換完成、刪除、清除已完成），除了呼叫 `setTodos` 更新畫面，同時也呼叫 `saveTodos` 把最新的資料寫回 `localStorage`**。為了不要在五個地方各自重複寫兩行程式碼，範例把它包成一個共用函式：

```jsx
// Day07\examples\todo-list-app\src\components\TodoApp.jsx
function updateTodos(nextTodos) {
  setTodos(nextTodos)   // 更新畫面上看到的 state
  saveTodos(nextTodos)  // 同步寫回 localStorage
}

function handleAdd(text) {
  const newTodo = { id: crypto.randomUUID(), text, completed: false }
  updateTodos([...todos, newTodo])
}

function handleToggle(id) {
  updateTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
}

function handleDelete(id) {
  updateTodos(todos.filter((todo) => todo.id !== id))
}
```

之後每個操作都只需要「算出下一份完整的 `todos` 陣列」，再丟給 `updateTodos` 統一處理「更新畫面」與「寫入 `localStorage`」這兩件事。

> ⚠️ **小提醒：為什麼不要把 `saveTodos` 塞進 `setTodos(prev => ...)` 的函式式更新裡面？**
>
> 你可能會想寫成這樣，覺得更「一氣呵成」：
>
> ```jsx
> // ❌ 不建議：把「寫入 localStorage」這個副作用，包進 setTodos 的更新函式裡面
> function handleAdd(text) {
>   const newTodo = { id: crypto.randomUUID(), text, completed: false }
>   setTodos((prev) => {
>     const next = [...prev, newTodo]
>     saveTodos(next) // 副作用混進了「計算新 state」的函式裡
>     return next
>   })
> }
> ```
>
> 問題在於：React 在開發模式的 `<StrictMode>` 下（今天的範例、以及所有先前範例的 `main.jsx` 都有包 `<StrictMode>`），會**刻意把這種「計算新 state 的函式」多呼叫一次**，用來幫助開發者及早發現「這個函式其實不是單純的計算，裡面偷偷做了副作用」這類問題。如果照上面的錯誤寫法，`saveTodos(next)` 就會在開發模式下被多執行一次（雖然寫入同樣的內容、結果無害，但也代表這種寫法不夠嚴謹）。今天範例採用的「先在外層算出 `next`，再依序呼叫 `setTodos(next)` 與 `saveTodos(next)`」寫法，把「計算」跟「寫入」分開成清楚的兩個步驟，才是穩妥的做法。

### 4. 這個做法的限制，以及之後會怎麼改善它

現在的寫法可以正常動作，但有一個維護上的隱憂：**任何一個會改變 `todos` 的地方，都要「記得」呼叫 `updateTodos` 而不是直接呼叫 `setTodos`**，一旦哪天不小心手滑漏寫、或有新同事不知道這個約定直接呼叫了 `setTodos`，畫面資料跟 `localStorage` 裡的資料就會悄悄不同步，而且不會有任何警告或錯誤訊息。

過幾天學到 `useEffect` 之後，就可以把「同步到 `localStorage`」這件事**集中寫在一個地方**，讓它在 `todos` state 改變後自動執行，不需要每個修改 `todos` 的函式都手動記得呼叫：

```jsx
// 這是之後才會寫的版本，先看過就好，今天不需要動手實作
useEffect(() => {
  saveTodos(todos)
}, [todos]) // 只要 todos 改變，就自動同步寫入 localStorage，不用在每個 handler 裡手動呼叫
```

先體會「沒有 `useEffect` 時得自己手動在每個操作裡同步」的麻煩，之後學到 `useEffect` 時，會更能感受到它解決了什麼實際問題。

## 六、今日範例：完整的待辦清單 App

這裡按照元件樹的順序，逐一走過每個檔案的重點。

### 步驟一：`src/utils/storage.js` — 封裝 `localStorage` 存取

見第五節第 1 小節的完整程式碼，`loadTodos()` 負責讀取 + 解析，`saveTodos(todos)` 負責序列化 + 寫入，兩者都用 `try/catch` 包起來避免例外狀況讓整個 App 崩潰。

### 步驟二：`src/components/TodoApp.jsx` — 狀態集中管理 + 溝通樞紐

```jsx
import { useState } from 'react'
import TodoInput from './TodoInput.jsx'
import TodoList from './TodoList.jsx'
import FilterBar from './FilterBar.jsx'
import { loadTodos, saveTodos } from '../utils/storage.js'

const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

function TodoApp() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('all')

  function updateTodos(nextTodos) {
    setTodos(nextTodos)
    saveTodos(nextTodos)
  }

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, completed: false }
    updateTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    updateTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  function handleDelete(id) {
    updateTodos(todos.filter((todo) => todo.id !== id))
  }

  function handleClearCompleted() {
    updateTodos(todos.filter((todo) => !todo.completed))
  }

  const visibleTodos = todos.filter(FILTERS[filter])
  const remainingCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - remainingCount

  return (
    <section className="card todo-card">
      <TodoInput onAdd={handleAdd} />
      <FilterBar
        filter={filter}
        onChangeFilter={setFilter}
        remainingCount={remainingCount}
        completedCount={completedCount}
        onClearCompleted={handleClearCompleted}
      />
      <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
    </section>
  )
}

export default TodoApp
```

留意這裡新增的 `handleClearCompleted`：延續 `todos.filter(...)` 的不可變更新模式，篩選出「還沒完成」的項目組成新陣列，一次清掉所有已完成的待辦事項。

### 步驟三：`src/components/TodoInput.jsx` — 受控輸入框 + 新增

```jsx
import { useState } from 'react'

function TodoInput({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()

    if (trimmed === '') {
      return
    }

    onAdd(trimmed)
    setText('')
  }

  return (
    <form className="todo-input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="輸入待辦事項，按 Enter 或點擊新增"
        className="todo-input"
      />
      <button type="submit" className="todo-add-btn">新增</button>
    </form>
  )
}

export default TodoInput
```

`TodoInput` 完全不知道 `todos` 陣列的存在，只負責管理自己的輸入框內容（`text` 這個 state），送出表單時把整理好的文字透過 `onAdd(trimmed)` 往上回報——這正是第二節說的「事件往上回報」。

### 步驟四：`src/components/FilterBar.jsx` — 篩選按鈕 + 清除已完成

```jsx
function FilterBar({ filter, onChangeFilter, remainingCount, completedCount, onClearCompleted }) {
  return (
    <div className="filter-bar">
      <div className="filter-buttons">
        <button
          className={filter === 'all' ? 'filter-btn filter-btn--active' : 'filter-btn'}
          onClick={() => onChangeFilter('all')}
        >
          全部
        </button>
        <button
          className={filter === 'active' ? 'filter-btn filter-btn--active' : 'filter-btn'}
          onClick={() => onChangeFilter('active')}
        >
          未完成
        </button>
        <button
          className={filter === 'completed' ? 'filter-btn filter-btn--active' : 'filter-btn'}
          onClick={() => onChangeFilter('completed')}
        >
          已完成
        </button>
      </div>

      {remainingCount > 0 ? (
        <p className="filter-summary">還有 {remainingCount} 項待完成</p>
      ) : (
        <p className="filter-summary">🎉 全部完成了！</p>
      )}

      {completedCount > 0 && (
        <button className="todo-clear-btn" onClick={onClearCompleted}>
          清除已完成（{completedCount}）
        </button>
      )}
    </div>
  )
}

export default FilterBar
```

`onChangeFilter` 其實就是父元件的 `setFilter`（直接把 `setFilter` 當成 prop 傳下去，見步驟二），因為「切換篩選條件」這個操作夠單純，不需要額外包一層 `handleXxx` 函式，直接複用 `setFilter` 即可。

### 步驟五：`src/components/TodoList.jsx` + `TodoItem.jsx` — 篩選渲染

```jsx
// TodoList.jsx
import TodoItem from './TodoItem.jsx'

function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return <p className="empty-state">目前沒有符合條件的待辦事項</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default TodoList
```

```jsx
// TodoItem.jsx
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className="todo-item">
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
        <span className={todo.completed ? 'todo-text todo-text--done' : 'todo-text'}>
          {todo.text}
        </span>
      </label>

      {todo.completed && <span className="badge">已完成</span>}

      <button className="todo-delete-btn" onClick={() => onDelete(todo.id)}>刪除</button>
    </li>
  )
}

export default TodoItem
```

`TodoList` 拿到的 `todos` 已經是 `TodoApp` 依照目前 `filter` 篩選過的結果（`visibleTodos`），`TodoList` 本身不需要知道篩選邏輯，只單純負責「有資料就渲染列表、沒資料就顯示提示文字」，職責劃分得很乾淨——這也是 Day03 提過「元件拆分」的實際好處：每個元件只需要關心自己那一小塊職責。

## 執行方式

```bash
cd Day07/examples/todo-list-app
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。也可以打開瀏覽器開發者工具的 Application（或 Storage）分頁，找到 `Local Storage`，觀察 `day07-todo-list` 這個 key 底下的 JSON 字串，隨著每一次新增、勾選、刪除操作即時更新。
