# Day05 - event-playground

一個整合六種常見事件處理情境的小型 Playground，對應教學文件 [`Day05/README.md`](../../../Day05/README.md)，示範 React 合成事件（SyntheticEvent）的核心觀念。

## 使用方式

```powershell
npm install
npm run dev
```

## 重點對照

- `src/components/ClickCounter.jsx`：
  - `onClick={(event) => handleVote('like', event)}` 用 **inline arrow function** 包一層，除了拿到 React 自動帶入的合成事件，還能多夾帶一個自訂參數。
  - 從 `event.type`、`event.currentTarget`、`event.nativeEvent.isTrusted` 觀察合成事件物件實際擁有哪些欄位。
- `src/components/LiveEcho.jsx`：今天練習的主角。`<textarea>` 的 `value` 綁定 `text` state，搭配 `onChange` 取得 `event.target.value` 更新 state，是**受控元件（Controlled Component）**最基本的雛型。
- `src/components/HoverCard.jsx`：`onMouseEnter` / `onMouseLeave` 只在滑鼠進入／離開元素本身時觸發一次，不會像 `onMouseOver` / `onMouseOut` 一樣因為子元素而重複觸發。
- `src/components/KeydownNotes.jsx`：`onKeyDown` 搭配 `event.key` 判斷按下的按鍵，`Enter` 新增筆記、`Escape` 清空輸入框。
- `src/components/SignupPreview.jsx`：`onSubmit` 搭配 `event.preventDefault()` 阻止瀏覽器預設的整頁重新整理，並示範多欄位表單用同一個 state 物件 + `event.target.name` 動態 key 更新。
- `src/components/BubblingDemo.jsx`：巢狀 `<div>` 示範事件冒泡（Bubbling）順序，勾選核取方塊後可比較呼叫 `event.stopPropagation()` 前後的差異。
