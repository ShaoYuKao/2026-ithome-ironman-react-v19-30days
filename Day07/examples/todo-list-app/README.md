# Day07 - todo-list-app

第一週的複習小專案：一個完整、可正常運作的待辦清單（Todo List）App，對應教學文件 [`Day07/README.md`](../../../Day07/README.md)，統整 Day01-06 所學的元件拆分、Props 傳遞、State 管理、事件處理、條件渲染與列表渲染，並額外加上 `localStorage` 持久化資料。

## 使用方式

```powershell
npm install
npm run dev
```

## 重點對照

- `src/utils/storage.js`：`loadTodos()` / `saveTodos()` 兩個原生 `localStorage` 工具函式，不依賴 `useEffect`（那是 Day08 才會學到的 Hook）。
- `src/components/TodoApp.jsx`：
  - `useState(loadTodos)` 用 **Lazy Initializer**（Day04）在元件掛載時讀取一次 `localStorage`。
  - `updateTodos(nextTodos)` 集中處理「更新 state + 寫回 localStorage」，新增、切換完成、刪除、清除已完成都透過它，示範不可變更新（Day04）與單向資料流（狀態集中管理於父層）。
- `src/components/TodoInput.jsx`：受控輸入框 + `onSubmit`／`preventDefault()`／提早 return 擋空白輸入（Day05、Day06）。
- `src/components/FilterBar.jsx`：三元運算子切換按鈕樣式與摘要文字、`&&` 顯示「清除已完成」按鈕（Day06）。
- `src/components/TodoList.jsx` + `TodoItem.jsx`：提早 return（空清單）、`.map()` + `key={todo.id}`、`&&` 顯示已完成徽章（Day06）。

打開 `http://localhost:5173/`，實際操作新增、勾選完成、刪除、切換篩選、清除已完成，接著重新整理頁面（或關掉分頁再打開），確認資料仍然保留在畫面上。
