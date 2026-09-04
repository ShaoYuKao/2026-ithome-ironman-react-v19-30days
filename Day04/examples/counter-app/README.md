# Day04 - counter-app

一個簡單的計數器（Counter）元件，對應教學文件 [`Day04/README.md`](../../README.md) 的實作練習，示範 `useState` 的核心觀念。

## 使用方式

```powershell
npm install
npm run dev
```

## 重點對照

- `src/components/Counter.jsx`：
  - `const [count, setCount] = useState(0)`：宣告 `count` 狀態，`+1`／`-1`／「重設」三個按鈕分別呼叫 `setCount` 更新它。
  - `const [history, setHistory] = useState(createInitialHistory)`：用 **Lazy Initializer**（傳函式而不是直接呼叫）示範初始值只在 State 初始化時採用、重新渲染不會再呼叫。但因為 `createInitialHistory` 用 `nextHistoryId++` 修改了外部變數，不是純函式，開發環境啟用 `<StrictMode>` 時 React 可能刻意呼叫它兩次來檢查純粹性，可打開瀏覽器 Console 觀察 `createInitialHistory()` 的 log 很可能印出兩次。
  - `addHistory` 一律用展開運算符 `[...prevHistory, newItem]` 建立新陣列，示範陣列狀態的**不可變更新（Immutability）**，絕不對 `prevHistory` 呼叫 `push()`。
  - 「連續 +3」的兩個按鈕，實際點擊比較「直接設值」（`setCount(count + 1)` 呼叫三次，結果只 `+1`）跟「函式式更新」（`setCount(prev => prev + 1)` 呼叫三次，結果正確 `+3`）的差異，對應教學文件「函式式更新 vs 直接設值」段落。
- `src/App.jsx`：只負責掛載 `<Counter />`，今天的重點單純聚焦在 `useState`。
