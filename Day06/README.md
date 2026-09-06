# Day 06｜條件渲染 & 列表渲染

- 今日範例程式碼：[`Day06\examples\todo-list`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day06/examples/todo-list)

## 一、條件渲染（Conditional Rendering）的三種寫法

在 React 裡，「要不要顯示某段 JSX」本質上就是一般的 JavaScript 條件判斷——因為 JSX 本身只是 `React.createElement(...)` 的語法糖，最終仍然是一段會被求值的表達式。今天要介紹的三種寫法，分別適合不同的情境。

### 1. 三元運算子（Ternary Operator）：`condition ? A : B`

適合「**兩種情況都要顯示不同內容**」的場景，例如依完成狀態顯示不同文字，或依條件套用不同的 `className`：

```jsx
function FilterSummary({ remainingCount }) {
  return remainingCount > 0 ? (
    <p className="filter-summary">還有 {remainingCount} 項待完成</p>
  ) : (
    <p className="filter-summary">🎉 全部完成了！</p>
  )
}
```

也常直接寫在 JSX 屬性裡，例如今天範例 `FilterBar.jsx` 依目前的篩選條件切換按鈕樣式：

```jsx
<button
  className={filter === 'all' ? 'filter-btn filter-btn--active' : 'filter-btn'}
  onClick={() => onChangeFilter('all')}
>
  全部
</button>
```

### 2. 邏輯與運算子（Logical AND）：`condition && A`

適合「**條件為真才顯示，條件為假時什麼都不顯示**」的場景——也就是只有一個分支、另一個分支是「不渲染任何東西」。今天範例 `TodoItem.jsx` 用它來顯示「已完成」徽章：

```jsx
{todo.completed && <span className="badge">已完成</span>}
```

原理是 JavaScript 的 `&&` 運算子特性：如果左邊是 falsy（`false`、`0`、`''`、`null`、`undefined`、`NaN`），整個表達式就直接回傳左邊的值，不會繼續求值右邊；如果左邊是 truthy，才會回傳右邊的值。React 在渲染時，如果收到的內容是 `false`、`null`、`undefined`，會直接視為「不渲染任何東西」而略過；但如果收到的是 `0` 或 `''` 這種 falsy 但仍然是「有效內容」的值，**React 仍然會把它當成文字節點渲染出來**。

### 3. ⚠️ `&&` 最常見的陷阱：數字 `0`

這是初學者非常容易踩到的坑，直接看範例：

```jsx
// ❌ 危險寫法：remainingCount 是數字，當它剛好是 0 時……
{remainingCount && <p>還有 {remainingCount} 項待完成</p>}
```

當 `remainingCount` 是 `0` 時，`0 && <p>...</p>` 會被求值成 `0`（因為 `&&` 左邊是 falsy，直接回傳左邊的值），而 `0` 對 React 來說是一個「合法的可渲染內容」（跟字串、數字一樣可以直接塞進 JSX），於是畫面上真的會多印出一個孤零零的 `0` 字元，而不是預期中的「什麼都不顯示」。

今天範例 `FilterBar.jsx` 特意改用**三元運算子**來避開這個陷阱：

```jsx
// ✅ 安全寫法：用比較運算式 `remainingCount > 0`，結果永遠是明確的 boolean
{remainingCount > 0 ? (
  <p className="filter-summary">還有 {remainingCount} 項待完成</p>
) : (
  <p className="filter-summary">🎉 全部完成了！</p>
)}
```

**口訣：`&&` 前面的條件式，最好保證求值結果一定是明確的 `true` / `false`（例如用 `> 0`、`!== ''`、`.length > 0` 等比較運算式），不要直接放一個型別是數字或字串的變數。**

### 4. 提早 return（Early Return）

適合「**某個條件成立時，整個元件要顯示完全不同的畫面（甚至什麼都不顯示）**」的場景。與其把所有邏輯都塞進同一段 JSX 用巢狀三元運算子硬擠，不如在函式最前面用 `if` 判斷，提早 `return` 掉一種情況，讓後面的主要邏輯保持乾淨。今天範例 `TodoList.jsx`：

```jsx
function TodoList({ todos, onToggle, onDelete }) {
  // 提早 return：清單是空的時候，直接回傳提示文字，完全不執行下面的 .map()
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
```

如果不用提早 return，硬要塞進同一段 JSX，會變成很難閱讀的巢狀三元運算子：

```jsx
// ❌ 可讀性差：巢狀三元運算子，邏輯全部擠在同一段 JSX 裡
return todos.length === 0 ? (
  <p className="empty-state">目前沒有符合條件的待辦事項</p>
) : (
  <ul className="todo-list">
    {todos.map((todo) => (
      <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
    ))}
  </ul>
)
```

同一個 Function Component 裡可以有多個提早 return（例如 loading 狀態、error 狀態、空清單狀態各自 return 一段畫面），最後才 return 「正常情況」的主要 JSX，這也是之後處理 loading / error 狀態時會反覆用到的模式。

### 5. 三種寫法怎麼選？

| 寫法 | 適用情境 | 今天範例 |
| --- | --- | --- |
| 三元運算子 `A ? B : C` | 兩種情況都要顯示「不同但同樣重要」的內容 | `FilterBar` 的按鈕樣式、「還有 N 項待完成」/「全部完成了」 |
| `&&`：`A && B` | 只有「顯示」或「完全不顯示」兩種結果，沒有替代內容 | `TodoItem` 的「已完成」徽章 |
| 提早 return | 整個元件在某個條件下要回傳完全不同（甚至更複雜）的畫面 | `TodoList` 清單為空時的提示文字 |

## 二、`.map()` 渲染列表

React 沒有專屬的「列表渲染語法」（不像某些模板引擎有 `v-for`、`*ngFor` 這種指令），而是直接利用 JavaScript 陣列原生的 `Array.prototype.map()`：把一個資料陣列，轉換成一個「JSX 元素」的陣列，然後把這個陣列直接放進 `{}` 裡渲染。

```jsx
const todos = [
  { id: 'a1', text: '學習條件渲染', completed: true },
  { id: 'a2', text: '學習列表渲染', completed: false },
]

function TodoList() {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
```

`{todos.map(...)}` 這段表達式的求值結果是一個 React 元素的陣列 `[<li>...</li>, <li>...</li>]`，React 知道如何把陣列裡的每一個元素依序渲染出來，這跟直接寫 `{singleElement}` 渲染單一元素的原理是一致的，只是這裡的內容是陣列。

### 為什麼不用 `for` 迴圈？

`for` 迴圈是一段「敘述（statement）」，不是「表達式（expression）」，不能直接寫在 JSX 的 `{}` 裡面（`{}` 裡只能放表達式）。如果真的想用命令式的迴圈，得先在 JSX 之外把結果組成陣列：

```jsx
const items = []
for (const todo of todos) {
  items.push(<li key={todo.id}>{todo.text}</li>)
}

return <ul>{items}</ul>
```

這樣寫並沒有錯，但明顯比 `.map()` 冗長。`.map()` 是表達式（回傳新陣列），可以直接內嵌在 JSX 裡，這也是為什麼 React 社群幾乎清一色使用 `.map()`（偶爾搭配 `.filter()`先篩選、再 `.map()` 渲染）來處理列表渲染。

## 三、`key` 屬性：為什麼列表渲染一定要加它？

寫 `.map()` 渲染列表時，React 會在 Console 印出一個很眼熟的警告：

> Warning: Each child in a list should have a unique "key" prop.

這個警告不是隨便給的，`key` 牽涉到 React 內部**協調（Reconciliation）演算法**怎麼判斷「新的一批子節點裡，哪一個對應到舊的哪一個」。這一節直接搞懂 `key` 實際上做了什麼事。

### 1. React 需要 `key` 才能認得出「這是同一筆資料」

React 每次重新渲染時，會拿到一份新的子節點清單，並跟上一次渲染的舊子節點清單做比對，決定哪些節點要「保留並更新」、哪些要「新增」、哪些要「刪除」、哪些要「搬移位置」。如果沒有 `key`，React 只能靠 **陣列的順序（index）** 去猜測對應關係；但陣列順序在新增、刪除、排序之後很容易整批錯位，`key` 就是讓 React 能夠不靠順序、直接用「身分證字號」精準比對的機制。

### 2. React 怎麼透過 `key` 認出每一筆資料？

可以把 `key` 想像成每一筆資料的**身分證字號**。

假設目前有三筆待辦事項：

```jsx
const todos = [
  { id: 'a1', text: '學習 React' },
  { id: 'b2', text: '學習 JSX' },
  { id: 'c3', text: '學習列表渲染' },
]
```

使用 `.map()` 渲染：

```jsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
</ul>
```

這裡：

```jsx
key={todo.id}
```

等於是在告訴 React：

```text
a1 → 學習 React
b2 → 學習 JSX
c3 → 學習列表渲染
```

React 不只是看到畫面上有「第一個 `<li>`、第二個 `<li>`、第三個 `<li>`」，而是可以透過 `key` 知道：

> 「這個 `<li>` 是 `a1` 那一筆資料。」
> 「這個 `<li>` 是 `b2` 那一筆資料。」
> 「這個 `<li>` 是 `c3` 那一筆資料。」

假設之後刪除了：

```text
學習 JSX
```

新的資料變成：

```jsx
[
  { id: 'a1', text: '學習 React' },
  { id: 'c3', text: '學習列表渲染' },
]
```

React 可以透過 `key` 判斷：

```text
a1 → 原本就存在
b2 → 不見了
c3 → 原本就存在
```

因此 React 知道：

```text
a1 → 保留
b2 → 移除
c3 → 保留
```

即使 `c3` 原本排在第三個，現在變成第二個，它的：

```jsx
key="c3"
```

並沒有改變。

所以 React 仍然知道：

> 「它只是換了位置，但還是原本那一筆資料。」

這就是為什麼 `key` 最重要的要求是：

> **同一筆資料的 `key` 應該穩定，而且不要因為排序位置改變。**

因此最常見的寫法就是：

```jsx
todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))
```

而不是使用資料目前排在第幾個位置。

#### 可以把 `key` 想成學生的學號

例如班上有三位學生：

| 學號   | 姓名 |
| ------ | --- |
| `S001` | 小明 |
| `S002` | 小華 |
| `S003` | 小美 |

今天座位是：

```text
第一排：小明
第二排：小華
第三排：小美
```

明天老師重新安排座位：

```text
第一排：小美
第二排：小明
第三排：小華
```

雖然每個人的**位置改變了**，但是：

```text
小明仍然是 S001
小華仍然是 S002
小美仍然是 S003
```

所以老師不會因為小美從第三排搬到第一排，就以為她變成另一個學生。

React 的 `key` 就有點像這個「學號」。

```jsx
key={todo.id}
```

就是讓 React 可以辨認：

> 「位置可能改變，但這仍然是同一筆資料。」

### 3. 為什麼不建議用陣列 `index` 當 `key`？

`.map()` 可以取得目前項目的 `index`：

```jsx
todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))
```

乍看之下似乎沒有問題，因為：

```text
第一筆 → key=0
第二筆 → key=1
第三筆 → key=2
```

而且 React 也不會顯示「缺少 `key`」的警告。

但是問題在於：

> **index 代表的是「目前排第幾個」，而不是「這是哪一筆資料」。**

只要列表發生：

* 插入
* 刪除
* 排序

index 就可能改變。

#### 範例：在最前面插入一筆資料

原本有：

```jsx
const todos = [
  { id: 'a1', text: 'A' },
  { id: 'b2', text: 'B' },
  { id: 'c3', text: 'C' },
]
```

如果使用：

```jsx
key={index}
```

React 看到的是：

| index / key | 資料 |
| ----------: | --- |
|         `0` | A  |
|         `1` | B  |
|         `2` | C  |

現在我們在最前面新增 `D`：

```jsx
[
  { id: 'd4', text: 'D' },
  { id: 'a1', text: 'A' },
  { id: 'b2', text: 'B' },
  { id: 'c3', text: 'C' },
]
```

重新計算 index 後：

| index / key | 資料 |
| ----------: | --- |
|         `0` | D  |
|         `1` | A  |
|         `2` | B  |
|         `3` | C  |

注意這時候發生了什麼事：

```text
原本：
key=0 → A
key=1 → B
key=2 → C

加入 D 之後：
key=0 → D
key=1 → A
key=2 → B
key=3 → C
```

問題就在這裡。

React 原本認識：

```text
key=0
```

但之前這個 `key` 代表的是：

```text
A
```

現在卻突然變成：

```text
D
```

同樣地：

```text
key=1：原本 B → 現在 A
key=2：原本 C → 現在 B
```

也就是說，**資料的身分和 `key` 對不上了。**

#### 如果改成使用真正的 `id`

```jsx
todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))
```

原本：

| key  | 資料 |
| ---- | --- |
| `a1` | A  |
| `b2` | B  |
| `c3` | C  |

加入 D：

| key  | 資料 |
| ---- | --- |
| `d4` | D  |
| `a1` | A  |
| `b2` | B  |
| `c3` | C  |

可以看到：

```text
A 永遠是 a1
B 永遠是 b2
C 永遠是 c3
```

只有新增的 D 多了一個：

```text
d4
```

所以 React 很容易判斷：

```text
d4 → 新資料
a1 → 原本的 A，只是位置往後移
b2 → 原本的 B，只是位置往後移
c3 → 原本的 C，只是位置往後移
```

這才是理想的狀況。

#### 為什麼有時候 `key={index}` 看起來又沒有問題？

例如：

```jsx
const fruits = ['蘋果', '香蕉', '橘子']
```

而且這個列表永遠：

```text
不新增
不刪除
不排序
```

那麼：

```jsx
{fruits.map((fruit, index) => (
  <li key={index}>{fruit}</li>
))}
```

通常不會產生明顯問題。

因為：

```text
蘋果永遠是第 0 個
香蕉永遠是第 1 個
橘子永遠是第 2 個
```

index 沒有發生變化。

但是實際應用中的清單通常會需要：

```text
新增
刪除
排序
篩選
拖曳
```

因此比較好的習慣仍然是：

```jsx
key={todo.id}
```

而不是：

```jsx
key={index}
```

#### 一個很好記的判斷方式

初學 React 時，可以直接記這個原則：

```text
key 應該回答：

「這是誰？」

而不是：

「它現在排第幾個？」
```

所以：

```jsx
// ✅ 這是誰？
key={todo.id}
```

優於：

```jsx
// ⚠️ 現在排第幾個？
key={index}
```

#### 總結

| `key` 寫法           | 建議     | 原因                  |
| ------------------ | ------ | ------------------- |
| `key={todo.id}`    | ✅ 推薦   | id 跟著資料走，不受排序影響     |
| `key={user.id}`    | ✅ 推薦   | 可以穩定辨識同一個使用者        |
| `key={product.id}` | ✅ 推薦   | 可以穩定辨識同一個商品         |
| `key={index}`      | ⚠️ 不建議 | 新增、刪除、排序後 index 會改變 |
| 沒有 `key`           | ❌ 不建議  | React 無法可靠辨識列表中的項目  |

> **`key` 就像資料的身分證：資料的位置可以改變，但身分不應該跟著改變。**

### 4. `key` 該用什麼值？

- **優先使用資料本身穩定、唯一的 id**：例如資料庫的主鍵、後端 API 回傳的 `id` 欄位，或是新增資料當下就產生好、之後不會再變的識別碼（例如今天範例用 `crypto.randomUUID()`）。
- **`key` 只需要在「兄弟節點之間」唯一**，不需要全域唯一（例如兩個不同的 `.map()` 各自用自己的一組 `key`，彼此不會衝突）。
- **只有在清單保證「永遠不會重新排序、插入、刪除」時，才勉強可以用 index 當 `key`**（例如純粹靜態、渲染一次就不會再變動的清單），但這種情境很少見，養成習慣優先找一個穩定的 id 會更安全。
- `key` **不是** 一般的 props，不會被子元件透過 `props.key` 讀取到，它是 React 內部協調演算法專用的保留屬性。

## 四、今日範例：待辦清單（Todo List）App

今天的練習是把 Day05 的輸入框擴充成完整的待辦清單：新增、刪除、標記完成、依完成狀態篩選顯示；範例額外附上一個「key 陷阱」對照示範。

### 元件拆分

```
App
└── TodoApp（管理 todos、filter 狀態）
    ├── TodoInput（受控輸入框 + 新增）
    ├── FilterBar（切換全部 / 未完成 / 已完成）
    └── TodoList（依篩選結果渲染列表，空清單時提早 return）
        └── TodoItem（單一待辦事項：勾選完成、刪除）
└── KeyPitfallDemo（額外示範：index 當 key vs id 當 key 的差異）
```

### `TodoApp.jsx` — 狀態集中管理

```jsx
const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, completed: false }
    setTodos((prev) => [...prev, newTodo])
  }

  function handleToggle(id) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  function handleDelete(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const visibleTodos = todos.filter(FILTERS[filter])
  const remainingCount = todos.filter((todo) => !todo.completed).length

  return (
    <section className="card todo-card">
      <TodoInput onAdd={handleAdd} />
      <FilterBar filter={filter} onChangeFilter={setFilter} remainingCount={remainingCount} />
      <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
    </section>
  )
}
```

- `FILTERS` 把「篩選條件」表達成一組純函式對照表，`todos.filter(FILTERS[filter])` 就能依目前選的分頁篩出對應資料，之後要加新的篩選條件，只要在這裡多加一個 key。
- 新增、切換完成、刪除都遵守 Day04 學過的 **不可變性（Immutability）** 原則：用 `[...prev, newTodo]`、`prev.map(...)`、`prev.filter(...)` 產生「新的陣列」，而不是直接對 `prev` 呼叫 `.push()` / `.splice()` 這種會直接改動原陣列的方法。
- `id` 用 `crypto.randomUUID()` 產生，確保每一筆資料都有一個跟「它現在排第幾個」無關、永遠不變的識別碼，這正是第三節強調「`key` 該用穩定 id、不要用 index」的實際作法。

### `TodoInput.jsx` — 受控輸入框 + 提早 return 驗證

```jsx
function TodoInput({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()

    // 提早 return：輸入內容是空白字串時，直接中止函式
    if (trimmed === '') {
      return
    }

    onAdd(trimmed)
    setText('')
  }

  return (
    <form className="todo-input-row" onSubmit={handleSubmit}>
      <input type="text" value={text} onChange={(event) => setText(event.target.value)} />
      <button type="submit">新增</button>
    </form>
  )
}
```

延續 Day05 學過的 `onSubmit` + `event.preventDefault()`，並在 `handleSubmit` 內用「提早 return」擋掉空白輸入——這裡的提早 return 用在一般函式（事件處理器）裡，跟第一節 `TodoList` 用在整個元件的 return 是同一種思路：先擋掉不需要往下處理的情況，讓主要邏輯保持乾淨。

### `FilterBar.jsx` — 三元運算子的兩種用法

```jsx
<button
  className={filter === 'all' ? 'filter-btn filter-btn--active' : 'filter-btn'}
  onClick={() => onChangeFilter('all')}
>
  全部
</button>

{remainingCount > 0 ? (
  <p className="filter-summary">還有 {remainingCount} 項待完成</p>
) : (
  <p className="filter-summary">🎉 全部完成了！</p>
)}
```

一個用在 JSX 屬性（動態 `className`），一個用在整段 JSX 內容切換，對照第一節第 1、3 小節的說明。

### `TodoList.jsx` + `TodoItem.jsx` — `.map()`、`key`、`&&`

```jsx
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

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className="todo-item">
      <label>
        <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
        <span className={todo.completed ? 'todo-text todo-text--done' : 'todo-text'}>
          {todo.text}
        </span>
      </label>
      {todo.completed && <span className="badge">已完成</span>}
      <button onClick={() => onDelete(todo.id)}>刪除</button>
    </li>
  )
}
```

`TodoList` 示範提早 return（空清單）+ `.map()`（渲染列表）+ `key={todo.id}`（穩定 id 當 key）；`TodoItem` 示範三元運算子（完成的項目加上刪除線樣式）與 `&&`（只有完成才顯示徽章）。勾選框 `checked={todo.completed}` + `onChange` 觸發 `onToggle`，延續 Day05、Day09 受控元件的雛型。

### `KeyPitfallDemo.jsx` — 親手體驗 `key` 的差異（額外示範）

```jsx
function KeyPitfallDemo() {
  const [items, setItems] = useState(initialItems)

  function handleInsertFront() {
    seed += 1
    setItems((prev) => [{ id: seed, label: `項目 ${String.fromCharCode(64 + seed)}` }, ...prev])
  }

  return (
    <section className="card key-demo">
      <button onClick={handleInsertFront}>在最前面插入一筆</button>

      <div className="key-demo-grid">
        <div>
          <h3>❌ 用陣列 index 當 key</h3>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <span>{item.label}</span>
                <input type="text" placeholder="在這裡打字試試" />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>✅ 用穩定的 id 當 key</h3>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <span>{item.label}</span>
                <input type="text" placeholder="在這裡打字試試" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
```

操作方式：先在兩份清單的「項目 A」那一列輸入框裡打幾個字，再點擊「在最前面插入一筆」——

- **左側（`key={index}`）**：插入新項目後，原本每一列的 index 都往後挪一位，對照第三節第 3 小節的分析，React 會認為「`key=0` 的節點還在」，於是把打過字的那個輸入框節點**留在原本的位置**，但畫面上這個位置現在顯示的標籤已經變成新插入的項目，輸入框內容跟標籤對不起來。
- **右側（`key={item.id}`）**：`id` 不會因為插入而改變，React 能正確辨認「這幾筆是舊資料、有一筆是新資料」，於是打過字的輸入框會跟著原本的標籤**一起往下移動**，新插入的項目則正確地在最前面顯示一個全新、空白的輸入框。

### 執行方式

```bash
cd Day06/examples/todo-list
npm install
npm run dev
```

打開 `http://localhost:5173/`，可以實際操作：

- 在輸入框輸入待辦事項、按 Enter 或點擊「新增」加入清單；輸入空白字串時不會新增（提早 return 生效）。
- 勾選核取方塊標記完成／取消完成，觀察文字變成刪除線樣式、多出「已完成」徽章。
- 點擊「刪除」移除單一待辦事項。
- 切換「全部 / 未完成 / 已完成」，觀察清單依篩選條件變化；清單篩選結果為空時，會顯示「目前沒有符合條件的待辦事項」（`TodoList` 的提早 return）。
- 在「額外示範」卡片裡，依上面說明的步驟操作，親眼比較 `key={index}` 與 `key={item.id}` 的差異。

## 五、常見誤區

- **`&&` 前面放了一個數字或字串變數，而不是明確的 boolean 判斷式**：例如 `{count && <p>...</p>}`，當 `count` 為 `0` 時會讓畫面多印出一個 `0`；務必改成 `{count > 0 && <p>...</p>}` 或改用三元運算子（見第一節第 3 小節）。
- **在 JSX 裡用 `for` 迴圈或忘記 `.map()` 要回傳（`return`）JSX**：`.map()` 的 callback 如果用 `{}` 包起函式主體，記得要顯式 `return`；如果是箭頭函式的隱式回傳（`(todo) => (<li>...</li>)`），則不需要額外寫 `return`，但外層要用小括號 `()` 而不是大括號 `{}`。
- **用陣列 index 當 `key`，卻在清單會被排序、插入、刪除的情境下使用**：對照第三節，index 不是資料的身分證字號，只要清單順序會變，就該改用資料本身穩定的 id。
- **完全忘記加 `key`**：不加 `key` 時 React 會退回用 index 當隱性的 key（並在 Console 印警告），效果跟明確寫 `key={index}` 一樣，同樣可能造成第三節提到的錯位問題。
- **把 `key` 當成一般 props 傳給子元件使用**：`key` 是 React 保留給協調演算法用的特殊屬性，子元件內部沒辦法透過 `props.key` 讀到它；如果子元件也需要用到這個 id，要另外用別的 prop 名稱（例如 `id`）再傳一次。

## 六、本日重點整理

- **條件渲染三種寫法**：三元運算子 `A ? B : C`（兩種內容都要顯示）、`&&`：`A && B`（只有「顯示」或「不顯示」兩種結果）、**提早 return**（整個元件在某條件下要回傳完全不同的畫面）；`&&` 要特別小心左邊條件是數字 `0` 時的陷阱。
- **`.map()`** 是 React 渲染列表的標準做法：把資料陣列轉換成 JSX 元素陣列，直接放進 `{}` 渲染；`.map()` 是表達式、可以內嵌在 JSX 裡，`for` 迴圈是敘述、不行。
- **`key` 屬性**是 React 協調（Reconciliation）演算法判斷「新舊節點是否為同一筆資料」的依據：當 `key` 相同才會判定為同一筆資料並重複使用（更新）舊節點，`key` 不同就會走向更昂貴的重新配對，甚至整個節點被視為全新建立。
- **用陣列 index 當 `key`** 在清單順序固定不變時沒問題，但只要牽涉到插入、刪除、排序，就可能讓 React 把舊節點的內部狀態（例如輸入框打過的字）錯誤地留在原本的位置上，跟畫面上新顯示的資料對不上；`key` 應該優先使用資料本身穩定、唯一的 id。
- 練習重點：把 Day05 的輸入框擴充成待辦清單（Todo List），實作新增、刪除、標記完成、依完成狀態篩選；範例額外用一個「index vs id 當 key」的並排示範，讓你能親手體驗兩者的實際差異。

---

## 七、參考資源

- [Conditional Rendering - React](https://react.dev/learn/conditional-rendering)
- [Rendering Lists - React](https://react.dev/learn/rendering-lists)
