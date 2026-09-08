# Day 08｜`useEffect` 副作用處理

- 今日範例程式碼：[`Day08\examples\day08-effect-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day08/examples/day08-effect-lab)

## 一、什麼是副作用（Side Effect）？

到目前為止（Day01 ～ Day07），寫的都是「**渲染邏輯**」：根據目前的 props 和 state，計算出這次要顯示的 JSX。理想上，一個 Function Component 應該是一個**純函式（Pure Function）**——只要輸入（props、state）相同，渲染出來的結果就該相同，而且渲染過程本身**不應該**去動任何「畫面以外的東西」。

但實際開發中，有很多事情天生就不屬於「渲染」，而是需要讓元件跟**外部系統**互動，例如：

| 副作用類型     | 範例                                                     |
|----------------|----------------------------------------------------------|
| 資料請求       | 呼叫後端 API 取得文章列表                                |
| 訂閱外部事件   | 監聽瀏覽器 `resize`、`scroll`、WebSocket 訊息推播        |
| 計時器         | `setInterval`、`setTimeout` 做時鐘、倒數、輪詢           |
| 直接操作 DOM   | 手動聚焦某個輸入框、量測元素尺寸                         |
| 讀寫瀏覽器儲存 | `localStorage`、`sessionStorage`（今天要練習的重點之一） |

這些操作有一個共同點：**它們不是「算出 JSX」，而是「跟渲染畫面以外的世界打交道」**，所以統稱為「副作用」。`useEffect` 就是 React 提供的標準做法，讓你可以在「渲染完成之後」安全地執行這些副作用程式碼。

> `useEffect` 讓元件與外部系統（網路請求、瀏覽器 DOM、第三方 UI 元件、動畫等）同步，在瀏覽器完成繪製「之後」非同步執行。

## 二、先理解元件的三個重要時機：出現、更新、消失

在開始學 `useEffect` 之前，我們先不要急著記 React 的專有名詞。

想像畫面上有一個「時鐘元件」：

```jsx
function Clock() {
  return <p>現在時間：12:30:15</p>
}
```

這個元件從被顯示到最後消失，大致會經歷三種情況：

```text
元件第一次出現在畫面
        ↓
元件裡的資料發生改變
        ↓
畫面重新渲染
        ↓
資料可能再次改變
        ↓
畫面再次重新渲染
        ↓
元件最後從畫面消失
```

React 對這三個階段分別有名稱：

| 初學者可以先這樣想 | React 名稱    | 發生時機                    |
| --------- | ----------- | ----------------------- |
| 元件出現了     | 掛載（Mount）   | 元件第一次被加入畫面              |
| 元件內容改變了   | 更新（Update）  | state 或 props 改變，元件重新渲染 |
| 元件消失了     | 卸載（Unmount） | 元件從畫面中被移除               |

先記住一句話即可：

> **Mount = 出現、Update = 更新、Unmount = 消失。**

### 掛載（Mount）：元件第一次出現在畫面

例如：

```jsx
function Greeting() {
  return <h1>Hello React!</h1>
}
```

當 `<Greeting />` 第一次被 React 顯示到畫面上：

```jsx
<Greeting />
```

這就是：

```text
Greeting 元件
     ↓
第一次出現在畫面
     ↓
   Mount
```

有些事情通常只需要在這時候做一次，例如：

* 第一次載入資料
* 啟動計時器
* 開始監聽瀏覽器事件
* 建立 WebSocket 連線

這些事情就可能會使用 `useEffect`。

例如：

```jsx
useEffect(() => {
  console.log('元件出現在畫面了')
}, [])
```

現在先不用急著理解 `[]`，後面會詳細介紹。

你只需要知道：

> 這段 Effect 會在元件第一次出現在畫面後執行。

### 更新（Update）：資料改變，元件重新渲染

假設有一個計數器：

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </>
  )
}
```

第一次顯示時：

```text
count = 0

畫面：
0
```

點擊按鈕：

```text
setCount(1)
    ↓
count 改變
    ↓
React 重新執行 Counter
    ↓
重新渲染畫面
    ↓
畫面變成 1
```

這一次並不是建立新的 `Counter` 元件，而是原本的元件因為 state 改變而**更新（Update）**。

如果我們希望：

> 「每當 `count` 改變，就做某件事情」

就可以使用：

```jsx
useEffect(() => {
  console.log(`count 現在是 ${count}`)
}, [count])
```

執行概念是：

```text
第一次顯示
count = 0
    ↓
執行 effect

使用者按 +1
    ↓
count = 1
    ↓
重新渲染
    ↓
執行 effect

使用者再按 +1
    ↓
count = 2
    ↓
重新渲染
    ↓
執行 effect
```

因此可以先把：

```jsx
[count]
```

理解成：

> **「請 React 注意 `count`，當它改變時，再執行這個 Effect。」**

### 卸載（Unmount）：元件從畫面消失

元件不一定永遠存在於畫面上。

例如：

```jsx
function App() {
  const [visible, setVisible] = useState(true)

  return (
    <>
      <button onClick={() => setVisible(!visible)}>
        顯示 / 隱藏
      </button>

      {visible && <Greeting />}
    </>
  )
}
```

當：

```text
visible = true
```

畫面上有：

```jsx
<Greeting />
```

如果使用者點擊按鈕，使：

```text
visible = false
```

React 就會把 `Greeting` 從畫面移除。

這個過程叫做：

**卸載（Unmount）。**

```text
Greeting 出現在畫面
        ↓
      Mount
        ↓
使用者關閉 Greeting
        ↓
Greeting 從畫面消失
        ↓
     Unmount
```

### `useEffect` 為什麼需要知道「元件消失」？

假設元件出現時，我們啟動了一個計時器：

```jsx
useEffect(() => {
  const timerId = setInterval(() => {
    console.log('tick')
  }, 1000)
}, [])
```

問題是：

> 元件消失之後，這個計時器會自己停止嗎？

答案是：**不會。**

`setInterval` 是瀏覽器提供的功能。React 把元件移除，並不代表瀏覽器會自動幫我們停止計時器。

因此我們需要告訴 React：

```text
元件出現
   ↓
建立計時器
   ↓
計時器持續執行
   ↓
元件準備消失
   ↓
把計時器清掉
```

這就是 `useEffect` 的**清除函式（Cleanup Function）**：

```jsx
useEffect(() => {
  const timerId = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => {
    clearInterval(timerId)
  }
}, [])
```

可以先用這個方式閱讀：

```jsx
useEffect(() => {

  // 元件出現後
  // 建立副作用
  const timerId = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => {

    // 元件消失前
    // 清除剛才建立的副作用
    clearInterval(timerId)

  }
}, [])
```

所以 `return` 出去的函式不是拿來「回傳資料」，而是告訴 React：

> **「這個 Effect 如果不再需要了，請執行這段程式碼幫我清理。」**

### 把三個階段放在一起看

現在可以把整個概念整理成：

```text
┌──────────────────────┐
│ 元件第一次出現在畫面   │
│       Mount          │
└──────────┬───────────┘
           ↓
       執行 Effect
           ↓
┌──────────────────────┐
│ state / props 改變   │
│       Update         │
└──────────┬───────────┘
           ↓
        重新渲染
           ↓
   視情況再次執行 Effect
           ↓
          ...
           ↓
┌──────────────────────┐
│    元件從畫面消失     │
│       Unmount        │
└──────────┬───────────┘
           ↓
     執行 Cleanup
```

因此目前可以先記住：

| 階段      | 白話意思        | `useEffect` 中要注意的事情  |
| ------- | ----------- | -------------------- |
| Mount   | 元件第一次出現     | Effect 第一次執行         |
| Update  | 元件資料改變、重新渲染 | 依賴項改變時，Effect 可能再次執行 |
| Unmount | 元件從畫面消失     | Cleanup 負責清除副作用      |

### 一個非常重要的觀念

`useEffect` 並不是單純在處理：

> 「元件第一次出現要做什麼？」

它真正想解決的是：

> **當元件需要和 React 以外的東西同步時，要怎麼建立這個同步關係，以及不需要時怎麼把它清掉。**

例如：

```text
React 元件
   │
   ├── 瀏覽器計時器 setInterval
   ├── window resize 事件
   ├── WebSocket
   ├── API
   ├── DOM
   └── localStorage
```

這些都屬於 React 元件以外的系統，也就是前一節介紹的「副作用」。

### 補充：如果看到舊版 React 教學

如果未來維護比較舊的 React 專案，可能會看到 **Class Component**：

```jsx
componentDidMount()
componentDidUpdate()
componentWillUnmount()
```

現在**完全不需要背這三個方法**。

只要知道它們大致對應：

| Function Component 概念 | 舊版 Class Component     |
| --------------------- | ---------------------- |
| Mount                 | `componentDidMount`    |
| Update                | `componentDidUpdate`   |
| Unmount               | `componentWillUnmount` |

本系列使用的是 **React 19 + Function Component + Hooks**，所以接下來我們都會使用：

```jsx
useEffect(...)
```

來學習，不需要先學會 Class Component。

## 三、`useEffect` 基本語法

```jsx
import { useEffect } from 'react'

useEffect(() => {
  // 1. Effect 本體：在瀏覽器完成這次畫面繪製「之後」，非同步執行
  //    適合寫：建立訂閱、啟動計時器、發送 API 請求、寫入 localStorage……

  return () => {
    // 2. 清除函式（cleanup function）：可以省略不寫
    //    會在「下一次這個 effect 即將重新執行之前」，
    //    以及「元件卸載時」被呼叫
  }
}, [依賴項1, 依賴項2 /* , ... */]) // 3. 依賴陣列：可以省略、傳空陣列、或傳有值的陣列
```

`useEffect` 接收兩個參數：

1. **Effect 函式**：描述「要做什麼副作用」的函式本體，可以選擇性地 `return` 一個函式當作清除函式。
2. **依賴陣列（dependency array）**：告訴 React「這個 effect 依賴哪些會變動的值」，決定它要不要在這次重新渲染後重新執行。

> **執行時機補充**：`useEffect` 是在瀏覽器完成畫面繪製「之後」才非同步執行，不會阻塞畫面顯示；如果需要在瀏覽器繪製「之前」同步執行（例如量測 DOM 尺寸後要立即調整、避免畫面閃爍），則要用 `useLayoutEffect`，這個會留到之後過幾天再詳細介紹，今天先專心搞懂 `useEffect` 就好。

## 四、依賴陣列（Dependency Array）三種情境

這是今天最重要的觀念，直接對照三種寫法：

### 1. 不傳依賴陣列：每次 render 之後都執行

```jsx
useEffect(() => {
  console.log('每次渲染完成後都會執行一次')
})
```

沒有第二個參數時，React 沒辦法判斷這個 effect 跟哪些值有關，只好保守地選擇「**每一次渲染完成後都重新執行一次**」——不管是這個元件自己的 state 改變，還是父元件重新渲染導致它跟著重新渲染，都會觸發。

實務上這種寫法比較少用，因為大部分情境下我們只想在「特定的值改變時」才重新執行副作用，而不是每次渲染都執行——不然很容易造成不必要的重複請求、重複訂閱。

### 2. 空陣列 `[]`：只在掛載時執行一次

```jsx
useEffect(() => {
  console.log('只在元件掛載時執行一次')
}, [])
```

傳入一個空陣列，代表「這個 effect 不依賴任何會變動的值」，所以 React 只會在元件**掛載**的那一次執行它，之後不管元件重新渲染幾次，都不會再重新執行。最常見的使用時機：只需要建立一次的訂閱、只需要抓一次的初始資料、只需要啟動一次的計時器。

### 3. 有值陣列：依賴項改變時才重新執行

```jsx
useEffect(() => {
  console.log(`userId 變成 ${userId} 了，重新抓取這個使用者的資料`)
}, [userId])
```

陣列裡放入一個或多個值，React 會在每次重新渲染後，用 [`Object.is`](https://mdn.club.tw/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)（概念上很接近 `===`）依序比較這次的值跟上一次的值是否相同：**只要有任何一個依賴項改變了，就重新執行這個 effect；如果全部都沒變，就跳過、不執行**。

### 三種情境對照表

| 寫法 | 初學者記法 | 實際行為 | 近似的 class 生命週期 |
| --- | --- | --- | --------------------- |
| `useEffect(fn)` | 每次都檢查 | 每次渲染完成後執行 | 每次都觸發的 `componentDidUpdate`（含首次渲染） |
| `useEffect(fn, [])` | 第一次就好 | 只在元件掛載後執行 | `componentDidMount` |
| `useEffect(fn, [a, b])` | 注意只要 `a` 或 `b` 改變就再執行 |  掛載時執行一次，之後只要 `a` 或 `b` 改變就再執行 | 有條件的 `componentDidUpdate` |

> ⚠️ **常見陷阱：依賴陣列裡放物件、陣列、函式字面量**
>
> ```jsx
> // ❌ 每次渲染，options 都是全新建立的物件（就算內容一模一樣，參照位址也不同），
> //    Object.is 比較永遠判定「不一樣」，導致這個 effect 每次渲染都會重新執行。
> useEffect(() => {
>   fetchData(options)
> }, [{ page: 1, size: 20 }])
> ```
>
> 這類「參照型別每次都是新的」問題，會在之後幾天學到 `useMemo` / `useCallback` 單元時有更完整的解法（把物件、函式也快取起來，讓它們的參照在依賴項沒變時保持不變）。今天只需要先知道：**依賴陣列裡最好放的是原始型別（數字、字串、布林值）**，如果不得不放物件或函式，要特別小心它是不是每次渲染都被重新建立。

## 五、清除函式（Cleanup Function）：時機與必要性

`useEffect` 的 effect 本體可以選擇性地 `return` 一個函式，這個函式就是**清除函式（cleanup function）**，它會在兩種情況下被呼叫：

1. **下一次同一個 effect 即將重新執行之前**（依賴項改變、effect 要重新跑一次時，React 會先呼叫上一次的清除函式，再執行這一次新的 effect 本體）。
2. **元件卸載（Unmount）時**——也就是這個元件即將永遠從畫面上消失，這是清除函式**最後一次**被呼叫的時機。

### 為什麼一定要清除？以計時器為例

```jsx
useEffect(() => {
  const timerId = setInterval(() => {
    console.log('tick')
  }, 1000)

  // 沒有清除函式的話：每次這個 effect 重新執行（或元件卸載）都會「再開一個新的計時器」，
  // 但舊的那個 setInterval 並不會自動停止——它會繼續在背景默默執行，
  // 造成畫面明明只顯示一個時鐘，卻同時有好幾個計時器在疊加執行、越跑越快，
  // 這就是典型的「忘記清除副作用」造成的記憶體洩漏（Memory Leak）與 Bug。
  return () => {
    clearInterval(timerId)
  }
}, [])
```

其他常見必須清除的副作用還包括：

```jsx
// 監聽瀏覽器事件：忘記移除監聽器，元件卸載後這個函式仍然會被觸發，
// 但這時候元件早就不存在了，輕則浪費效能，重則因為存取到已卸載元件的資料而出錯。
useEffect(() => {
  function handleResize() {
    console.log(window.innerWidth)
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

```jsx
// 非同步請求：元件卸載後，請求結果如果還是硬塞進 state，
// React 會在開發模式下警告「在已卸載的元件上呼叫 setState」。
useEffect(() => {
  let ignore = false

  fetchUser(userId).then((data) => {
    if (!ignore) {
      setUser(data)
    }
  })

  return () => {
    ignore = true
  }
}, [userId])
```

**簡單記憶：只要 effect 本體「建立」了什麼會持續存在的東西（計時器、訂閱、事件監聽器、連線），就該在清除函式裡把它「收掉」**，讓每一次 effect 執行都乾乾淨淨、不留下殘留物。

## 六、開發模式下的小驚喜：`<StrictMode>` 讓 effect 「多跑一次」

打開今天的範例專案時，你會發現 `EffectPlayground`、`MountDemo` 的紀錄面板，一開始就已經有一組紀錄了（而不是空的），而且專案的 `main.jsx` 都有包一層：

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`<StrictMode>` 是 React 提供的「**開發模式輔助工具**」，其中一項行為是：**在開發模式下，會刻意把每個元件多執行一次「掛載 => 卸載 => 再掛載」**，藉此幫助你及早發現「effect 沒有寫對應的清除函式」這類問題——如果你的 effect 沒有妥善清理，這種「重複掛載」很容易讓 Bug 提早在開發階段就現形，而不是等到上線後才在使用者的瀏覽器裡出問題。

**這個行為只會發生在開發模式（`npm run dev`），正式建置（`npm run build` 之後的產物）並不會有這個「多跑一次」的現象**。所以待會實際操作範例時，看到 log 一開始就有一組「掛載又卸載」的紀錄，是正常現象，不是程式寫錯了。

## 七、今日範例：四個小實驗

是一個用 Vite 建立的 React 19 專案，裡面有四個獨立的示範卡片，每一個都附上「即時執行紀錄」面板，方便實際操作時觀察 `useEffect` 何時被觸發。

### 實驗一：`EffectPlayground.jsx` — 依賴陣列三種情境對照

```jsx
// src/components/EffectPlayground.jsx
function EffectPlayground() {
  const [countA, setCountA] = useState(0)
  const [countB, setCountB] = useState(0)
  const [logs, setLogs] = useState([])

  function addLog(text, type) {
    setLogs((prev) => [...prev, { id: nextLogId++, time: nowLabel(), text, type }].slice(-12))
  }

  // 情境一：無依賴陣列 → 每次 render 後都執行
  useEffect(() => {
    addLog(`🟠 無依賴陣列：每次 render 後都會執行一次（countA=${countA}, countB=${countB}）`, 'warn')
  })

  // 情境二：空陣列 [] → 只在掛載時執行一次
  useEffect(() => {
    addLog('🟢 空陣列 []：只在元件掛載時執行一次，之後永遠不會再執行', 'mount')
  }, [])

  // 情境三：依賴 [countA] → 只有 countA 改變時才重新執行
  useEffect(() => {
    addLog(`🔵 依賴 [countA]：countA 改變時才執行（目前 countA=${countA}）`, 'dep')
    return () => {
      addLog(`⚪ 清除函式：在下一次「依賴 [countA]」effect 執行前被呼叫（清除舊的 countA=${countA}）`, 'cleanup')
    }
  }, [countA])

  // ……render 兩個獨立的按鈕：countA + 1、countB + 1
}
```

點擊「`countA + 1`」時，因為 `countA` 有改變，「無依賴陣列」跟「依賴 `[countA]`」兩個 effect 都會執行；點擊「`countB + 1`」時，雖然一樣觸發了重新渲染，但因為 `countA` 沒有改變，「依賴 `[countA]`」的 effect 完全不會執行——只有「無依賴陣列」那個會執行。**實際操作這兩個按鈕、比對紀錄面板，會比死背文字更容易記住三種情境的差異。**

### 實驗二：`MountDemo.jsx` + `Greeting.jsx` — 掛載與卸載的清除函式

```jsx
// src/components/Greeting.jsx
function Greeting({ onLog }) {
  useEffect(() => {
    onLog('🟢 掛載（Mount）元件出現：Greeting 已經加入畫面，適合寫初始化、訂閱的程式碼', 'mount')

    return () => {
      onLog('🔴 卸載（Unmount）元件消失：開始清除 Greeting 使用的資源，適合寫取消訂閱、清除資源的程式碼', 'cleanup')
    }
  }, [])

  return <p className="greeting-box">👋 哈囉，我是 Greeting 子元件！</p>
}
```

```jsx
// src/components/MountDemo.jsx
{visible ? <Greeting onLog={addLog} /> : <p className="empty-state">（目前沒有掛載任何元件）</p>}
```

`MountDemo` 用 Day06 學過的條件渲染，讓 `Greeting` 子元件「出現／消失」。當 `visible` 從 `true` 變成 `false`，`Greeting` 會真正從畫面上被移除（卸載），這時候它 `useEffect` 回傳的清除函式就會被呼叫一次，紀錄面板上會出現「🔴 卸載」訊息；再次點擊讓它重新出現，就會是全新一次的「🟢 掛載」。

> 這個檔案裡有一個值得注意的小細節：`Greeting` 的 `useEffect` 依賴陣列是空陣列 `[]`，並沒有把 `onLog` 這個 prop 放進去。原因是 `onLog`（也就是父元件的 `addLog`）每次呼叫都是用 `setLogs(prev => [...prev, ...])` 這種**函式式更新**寫入，不論呼叫的是哪一次 render 產生的 `onLog` 版本，效果都完全相同，所以這裡屬於「可以放心省略依賴項」的例外情況。

### 實驗三：`Clock.jsx` — 簡易時鐘（`setInterval` + Cleanup）

```jsx
// src/components/Clock.jsx
function Clock() {
  const [now, setNow] = useState(() => new Date())
  const [running, setRunning] = useState(true)
  const [intervalMs, setIntervalMs] = useState(1000)

  useEffect(() => {
    if (!running) {
      return undefined
    }

    const timerId = setInterval(() => {
      setNow(new Date())
    }, intervalMs)

    return () => {
      clearInterval(timerId)
    }
  }, [running, intervalMs])

  // ……render 目前時間、暫停/啟動按鈕、更新頻率下拉選單
}
```

這裡的依賴陣列是 `[running, intervalMs]`：

- 點擊「暫停計時器」讓 `running` 變成 `false`：effect 重新執行，這次直接 `return`（不建立新計時器），但**前一次的清除函式仍然會先被呼叫**，把舊的計時器清掉——這就是為什麼暫停後時間真的會停止跳動，而不是背景偷偷還在跑。
- 切換更新頻率下拉選單讓 `intervalMs` 改變：一樣會先呼叫上一次的清除函式清掉舊計時器，再用新的頻率建立一個新計時器，兩個計時器不會同時存在。

試著把 `return () => clearInterval(timerId)` 整段刪掉重新整理頁面，再切換幾次更新頻率或暫停/啟動，會發現時間開始不正常地越跳越快——這就是最直觀的「忘記清除副作用」的後果，非常建議實際動手試一次來加深印象（測試完記得改回來）。

### 實驗四：`TodoApp.jsx` — 把 Day07 的手動同步改成 `useEffect`

回顧 Day07 的做法：每一個會修改 `todos` 的函式（`handleAdd`、`handleToggle`、`handleDelete`、`handleClearCompleted`）都要「記得」額外呼叫一次 `saveTodos(next)`，透過一個共用的 `updateTodos` 函式包起來，才不會漏寫：

```jsx
// Day07 的寫法（今天要升級的對象）
function updateTodos(nextTodos) {
  setTodos(nextTodos)
  saveTodos(nextTodos) // 每個操作都要「記得」呼叫這行
}
```

今天的 `TodoApp.jsx` 改成把「同步到 `localStorage`」這件事，集中寫在一個 `useEffect` 裡：

```jsx
// src/components/TodoApp.jsx
function TodoApp() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('all')

  // 只要 todos 改變，就自動同步寫入 localStorage，不用在每個 handler 裡手動呼叫
  useEffect(() => {
    saveTodos(todos)
  }, [todos])

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

  function handleClearCompleted() {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }

  // ……
}
```

現在每個 handler 都只需要專心「算出下一份 `todos`」並呼叫 `setTodos`，完全不需要知道、也不需要記得「還要同步到 `localStorage`」這件事——這件事已經被 `useEffect` 集中管理起來，`todos` 這個依賴項改變（不管是新增、切換、刪除、還是清除已完成造成的改變），這個 effect 就會自動重新執行一次。**這正是 `useEffect` 解決的實際問題：把「跟著某個 state 同步變化的副作用」集中、自動化，不用散落在每一處修改 state 的程式碼裡、也不怕漏寫。**

## 八、常見陷阱整理

| 陷阱 | 說明 | 對策 |
| --- | --- | --- |
| 忘記寫清除函式 | 計時器、事件監聽器、訂閱持續疊加，造成記憶體洩漏或行為異常（越跑越快、重複觸發） | 只要 effect「建立」了什麼，就在清除函式裡「收掉」它 |
| 依賴陣列缺漏 | effect 內用到某個 state／props，卻沒放進依賴陣列，effect 執行時讀到的是「當初建立時」的舊值（Stale Closure），而不是最新值 | 把 effect 內實際用到的每一個會變動的值都放進依賴陣列 |
| 依賴陣列放進物件／陣列／函式字面量 | 每次渲染都建立新的參照，導致 `Object.is` 永遠判定「不同」，effect 每次都重新執行 | 盡量只放原始型別 |
| 把「使用者互動觸發的邏輯」硬塞進 `useEffect` | 例如表單送出成功後想要跳轉頁面，寫成「送出後改變某個 state => 用 useEffect 監聽這個 state 跳轉」，反而讓資料流繞了一大圈、難以追蹤 | 這種「本來就是某個事件處理函式該做的事」，應該直接寫在 `onClick` / `onSubmit` 等事件處理函式裡，不需要透過 `useEffect` 轉一手（React 官方文件有專門一篇 [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) 說明這類情境，值得日後閱讀） |

## 執行方式

```bash
cd Day08/examples/day08-effect-lab
npm install
npm run dev
```

打開瀏覽器輸入網址 `http://localhost:5173/`，就可看到你的 React 畫面進行操作確認。也可以執行 `npm run build` 打包成正式版本，比較「開發模式下 effect 會多跑一次」與「正式建置後不會有這個現象」的差異。
