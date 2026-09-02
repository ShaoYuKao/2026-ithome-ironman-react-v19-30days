# Day02 - profile-dynamic

延續 Day01 的個人簡介頁面，改用 JavaScript 資料物件 + JSX 表達式 `{}` 動態渲染姓名、年齡、興趣清單，對應教學文件 [`Books/Day02/README.md`](../../../Books/Day02/README.md) 的實作練習。

## 使用方式

```powershell
npm install
npm run dev
```

## 重點對照

- `src/App.jsx` 的 `profile` 物件：把姓名、出生年、興趣（陣列）、技能（陣列）等資料集中管理
- `age`：用 `新年份 - 出生年份` 的運算式即時算出，而不是寫死的數字
- `profile.hobbies`：用三元運算子 + `.join('、')` 組成句子
- `profile.skills.map(...)`：把陣列渲染成 `<li>` 列表（`key` 的完整原理在 Day 6 說明）
- `htmlFor` / 自我封閉的 `<input />`：JSX 與 HTML 語法差異示範
