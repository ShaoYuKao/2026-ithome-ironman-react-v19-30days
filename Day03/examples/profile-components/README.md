# Day03 - profile-components

延續 Day02 的個人簡介頁面，這次不改資料、不改外觀，而是把原本擠在同一個 `App.jsx` 裡的畫面，拆成 `ProfileCard`、`SkillList`、`ContactInfo` 三個元件，對應教學文件 [`Day03/README.md`](../../../Day03/README.md) 的實作練習。

## 使用方式

```powershell
npm install
npm run dev
```

## 重點對照

- `src/App.jsx`：父元件，負責準備 `profile` 資料、把資料透過 props 傳給 `ProfileCard`，並把 `SkillList`、`ContactInfo`、`<section className="newsletter">` 寫成 `<ProfileCard>` 的 children。
- `src/components/ProfileCard.jsx`：用解構賦值 `{ name, jobTitle, age, avatarSeed, bio, hobbies, children }` 取出 props；`{children}` 示範元件如何當「容器」使用。
- `src/components/SkillList.jsx`：`{ title = '技能', skills }` 示範用 ES6 預設參數（Default Parameter）取代已被 React 19 移除的 Function Component `defaultProps`。
- `src/components/ContactInfo.jsx`：故意不解構、直接使用 `props.email`、`props.github`，跟其他兩個元件的解構寫法做對照。
- 元件命名皆為大寫開頭（`ProfileCard`、`SkillList`、`ContactInfo`），這是 JSX 判斷「這是自訂元件」而不是「HTML 原生標籤」的依據。
