# Day 25｜狀態管理概念 & Redux 核心

## 一、複習與新問題：當 App 變成「多頁面」之後

### 1. 先複習：Day11、Day12 已經解決了什麼

Day11 用 Context 解決了 Props Drilling；Day12 用 `useReducer` 把「一堆彼此關聯的狀態、一堆 `handleXxx` 函式」收斂成一個純函式 `reducer`，並在第七節示範把兩者結合、拆成 `CounterStateContext` / `CounterDispatchContext`，做出「不需要安裝任何套件」的輕量級全域狀態管理。到目前為止，這套組合已經能做到：

- 任意深度的子孫元件都能直接取得資料、觸發更新，不需要一層層手動傳遞 props。
- 所有「狀態如何變化」的規則都集中在一個 `reducer` 函式裡，好維護、好測試。

### 2. Day22～Day24 之後出現的新麻煩：路由切換會「卸載」整個頁面

Day22 ～ Day24 學會了 React Router：不同網址對應不同的 page 元件，透過 `<Outlet />` 切換主要內容。這帶來一個 Day11、Day12 都還沒遇過的新問題，先想一下這個情境：

> 如果購物車的 `items` 狀態，是用 `useReducer` 放在 `ProductListPage`（商品列表頁）元件內部管理，使用者在商品列表頁按下「加入購物車」，商品確實被加進 `items` 裡；接著使用者點擊導覽列的購物車圖示，網址換成 `/cart`……**購物車頁面會看到剛剛加入的商品嗎？**

答案是不會。React Router 換頁的方式，是把符合舊網址的 page 元件整個**卸載（unmount）**，換上符合新網址的 page 元件；`ProductListPage` 卸載的同時，它內部用 `useReducer` 管理的 `items` 也跟著被銷毀，`CartPage`（購物車頁）是全新掛載的元件，完全不知道剛剛發生過什麼事。

換句話說：**只要狀態放在某一個「會隨路由切換而卸載」的 page 元件內部，它就無法跨頁面存活**。這正是這一週要學的全域狀態管理該出場的時機——把購物車這類「好幾個頁面都要讀取、修改」的資料，提升（lift）到一個**不會因為路由切換而卸載**的地方。

> 💡 這裡有個地方要特別澄清：解法不是「不能用 `useReducer`」，而是「`useReducer` 要放的位置要夠高」。回顧 Day22 ～ Day24 的 `RootLayout`：它包在 `<Outlet />` 外層，路由切換時只有 `<Outlet />` 裡面的內容會替換，`RootLayout` 本身**不會**卸載。如果把購物車的 `useReducer` + `useContext`（Day12）放在 `RootLayout` 這一層，一樣可以做到跨頁面存活——這其實就是 Day12 結尾說的「不需要額外套件的輕量級全域狀態管理」。Redux／Redux Toolkit 要解決的，是「這個方案繼續放大規模之後」會遇到的下一層問題，下一節會誠實列出來。

### 3. 全域狀態管理要解決的三件事

整理到目前為止看到的動機，全域狀態管理（不管是「Context + useReducer」還是「Redux」）主要解決三個問題：

1. **跨元件共享（尤其是跨路由／跨頁面）**：像購物車數量，需要同時顯示在 Header 的圖示、購物車頁面、結帳頁面——這幾個元件在元件樹上的位置可能離得很遠、甚至位於不同的路由頁面，資料必須放在一個大家都能存取、又不會被任何一個頁面的卸載影響的地方。
2. **避免 Props Drilling**：Day11 已經詳細說明過，不再重複。
3. **集中管理商業邏輯**：「加入購物車時，如果商品已存在就數量 +1，否則新增一筆」這類規則，只寫在同一個 `reducer` 裡一次；不管畫面上有幾個地方會觸發「加入購物車」（商品列表卡片、商品詳情頁按鈕……），呼叫的都是同一份邏輯，不會各自寫一份、寫出不一致的行為。

## 二、`useReducer` + `useContext` 已經很好用了，為什麼還需要 Redux？

### 1. Redux DevTools：不只是印 `console.log`

Redux 官方瀏覽器擴充套件 Redux DevTools，能記錄「每一個 dispatch 過的 action」與「每次 state 變化前後的完整內容（diff）」，甚至能「時間旅行（Time-Travel Debugging）」——直接跳回任何一個歷史時間點，重現當時畫面的樣子，對除錯非常有幫助。純手刻的 `useReducer` + `useContext` 沒有這種開箱即用的除錯工具。

### 2. Middleware：在 action 抵達 reducer 之前，插入額外邏輯

Redux 有一套標準化的 Middleware 機制，可以在 `dispatch(action)` 真正呼叫 reducer 之前，攔截並處理這個 action——例如記錄每一筆 action 的 log，或是 Day27 要學的 `createAsyncThunk`（讓一個操作可以先發送非同步 API 請求，等資料回來後才真正把結果送進 reducer）。`useReducer` 沒有對應的擴充點，要自己手刻攔截邏輯。

### 3. 更細顆粒度的重新渲染優化

Context 有個常被提到的限制（Day11 結尾也提過）：只要 `Provider` 的 `value` 改變，所有讀取這個 Context 的子孫元件都會重新渲染，就算拆成多個 Context，粒度也有限。Day26 會接觸到 `react-redux` 的 `useSelector`：每個元件可以只訂閱 state 裡「真正會用到的那一小塊」；若該 Selector 的結果沒有改變，這次 store 更新就不會因它而觸發該元件重新渲染，粒度比 Context 更細。

### 4. 不綁定 React

`useReducer`、`useContext` 是 React 內建的 Hook，離開 React 就無法使用。Redux 的 store 本身是一份純 JavaScript 邏輯，跟任何 UI 框架無關——`react-redux` 只是幫 Redux store 跟 React 元件之間搭一座橋。同一份用 Redux 設計出來的 state／reducer，理論上也能被 Vue、Angular，甚至完全不用前端框架的專案重複使用。

### 5. 標準化與團隊協作

Redux Toolkit 的 `createSlice`（Day26 會學到）提供一套業界公認的檔案結構與命名慣例：一個 slice 一個檔案，`state`、`action`、`reducer` 分工清楚。大型專案、多人協作時，任何人看到一個新的 slice 都能用同一套心智模型快速上手；純手刻的 Context + useReducer，每個專案、每個人習慣的組織方式都可能不一樣。

### 小結：什麼時候該用哪一種？

老實說：**規模小的專案，Day12 學過的「`useReducer` + `useContext`」已經很夠用，不需要為了「業界都在用 Redux」就每個專案都套上它**——這跟 Day11 提醒過的「不要為了怕以後變複雜而過早引入 Context」是同一個道理，多一層套件、多一層抽象，就是多一份維護與學習成本。但當專案逐漸出現「需要除錯工具回放歷史狀態」「大量非同步請求需要統一管理 pending／fulfilled／rejected」「團隊人數變多、需要一致的程式碼組織慣例」這些情境時，Redux／Redux Toolkit 提供的標準化解法就能派上用場——這也是為什麼 30 天計畫安排在第四週、學完 React Router 之後才教 Redux Toolkit：先體會清楚「手刻方案」的極限，再學「業界標準方案」多解決了哪些問題。

## 三、Redux 是什麼：從 Flux 到「可預測的狀態容器」

### 1. 一句話認識 Redux

Redux 官方文件把自己定義為一個 **Predictable State Container**（可預測的狀態容器）——「可預測」的意思是：只要知道目前的 state 跟收到的 action，就能百分之百確定下一份 state 會長什麼樣子，不會有「隨機」或「不知道哪裡偷偷改了資料」的情況。這個特性直接來自第五節要介紹的三大核心原則。

歷史脈絡簡單交代一下：Facebook 在 2014 年提出一套「資料單向流動」的應用程式架構模式，稱為 **Flux**；隔年（2015 年），Dan Abramov 在 Flux 的概念基礎上做了大幅簡化——拿掉 Flux 原本「多個 Store」「Dispatcher」等角色，只保留一個 Store、用純函式 reducer 描述狀態變化——這個簡化版本就是 **Redux**，因此比原始 Flux 更簡單、更容易理解與測試。

### 2. Redux 核心資料流

不管畫面多複雜，Redux 的資料永遠只沿著同一個方向流動，可以畫成這樣一張圖：

```text
(1) 使用者操作 UI（例如按下「加入購物車」按鈕）
        │
        ▼
(2) dispatch({ type: 'cart/addItem', payload: { id, name, price } })
        │
        ▼
(3) Redux Store 收到這個 action，呼叫 reducer(目前的 state, action)
        │            （reducer 是純函式：同樣的輸入，永遠得到同樣的輸出）
        ▼
(4) reducer 回傳「一份全新的 state」（不修改原本的 state，延續 Day04、Day12 的不可變更新原則）
        │
        ▼
(5) Store 用這份新的 state，取代原本存放的舊 state
        │
        ▼
(6) Store 通知所有「訂閱（subscribe）」了它的元件：state 換新了
        │
        ▼
(7) 訂閱的元件（Header 購物車圖示、購物車頁面……）重新渲染，畫面顯示最新資料
```

整個循環走完一圈之後，又回到步驟(1)，等待使用者下一次操作——這就是為什麼常聽到「Redux 資料是單向流動（Unidirectional Data Flow）」的說法：資料只會照著 (1) => (7) 這個固定方向走，不會有「畫面直接反過來偷改 state」的情況（這正是第五節「State 唯讀」原則要保證的事）。

> 對照著看：這張圖跟 Day12 的 `useReducer` 資料流其實一模一樣，只是把「元件內部的 state」換成「整個 App 共用的 store」、把「元件的 `dispatch`」換成「`store.dispatch`」。如果先跳過這一段直接看程式碼，會發現 Redux 的 `createStore`（或 Redux Toolkit 的 `configureStore`）內部運作，用最精簡的方式描述大致是：`state` 一開始是初始值；每呼叫一次 `dispatch(action)`，就把「目前的 `state`」與收到的 `action` 一起丟給 `reducer`，用回傳值整個換掉 `state`，再逐一通知所有訂閱者。市面上甚至有教學會直接秀出一份僅十幾行、從零手刻 `createStore` 的程式碼，用意就是證明 Redux 的核心其實非常單純，複雜的是它周邊的生態系（Middleware、DevTools、`react-redux` 綁定）。如果覺得這段還太抽象，不需要糾結，只要記得上面那張 (1) => (7) 的圖就足夠應付接下來的學習。

### 3. Redux Toolkit 是什麼？跟 Redux 的關係

早期單純使用 Redux（不加 Redux Toolkit）時，需要手寫大量重複的樣板程式碼（action type 常數、action creator 函式、手動用展開運算符做不可變更新……），社群長期詬病「boilerplate 太多」。**Redux Toolkit**（`@reduxjs/toolkit`）是 Redux 官方團隊之後推出、現在官方唯一推薦的寫法，內建：

- `configureStore`：一行程式碼建好 store，自動接上 Redux DevTools、內建常用的 Middleware。
- `createSlice`：把某一塊 state 的初始值、reducer 邏輯、對應的 action creator 一次生成好，不需要再手寫 action type 字串常數。
- 內建 **Immer** 函式庫：讓 reducer 可以用「看起來像直接修改（mutate）state」的寫法（例如 `state.items.push(newItem)`），Immer 會在背後自動轉換成正確的不可變更新，兼顧「寫起來直覺」與「Redux 要求的不可變更新原則」。
- `createAsyncThunk`（Day27 會學到）：標準化「先發送非同步請求，等結果回來後再送進 reducer」這整套流程。

Day26 開始安裝與使用的，就是 `@reduxjs/toolkit` + `react-redux`，而不是最原始、需要手寫大量樣板程式碼的 Redux——但不管用不用 Redux Toolkit，前面介紹的「三大核心原則」與「①→⑦ 資料流」完全不會改變，Redux Toolkit 只是讓「寫起來更方便」，沒有改變 Redux 的核心概念。

## 四、對照表：`useReducer` vs Redux

Day12 已經列過一份基礎對照表，這裡把它延伸完整：

| 概念 | `useReducer`（React 內建） | Redux／Redux Toolkit |
| --- | --- | --- |
| 存放狀態的地方 | 元件內部的 `state` | 整個 App 共用、獨立於元件樹之外的 `store` |
| 描述「發生了什麼事」 | `action` 物件 `{ type, payload }` | 同樣是 `action` 物件 `{ type, payload }`，命名慣例幾乎一致 |
| 決定「如何更新」的純函式 | `reducer`：`(state, action) => newState` | 同樣是 `reducer`，一樣要求純函式、不可變更新 |
| 觸發更新的方式 | 呼叫 `dispatch(action)` | 呼叫 `store.dispatch(action)` |
| 適用範圍 | 通常是單一元件（或搭配 Context 之後的一個子樹） | 整個 App，`Provider` 包在 Router 外層就能跨任何路由存活 |
| 路由切換會不會消失 | 會，除非把 Context 的 `Provider` 放在夠高、不會卸載的位置（見第一節） | 但整頁重新載入時會重新建立，除非另外做持久化 |
| 多個 reducer 如何組合 | 通常各自獨立呼叫 `useReducer`，或自己手動整合 | `configureStore({ reducer: { cart, products, user } })` 自動把多個 slice 的 reducer 組合成一個 |
| 除錯工具 | 沒有內建，只能自己加 `console.log` | Redux DevTools：完整 action 歷史記錄、狀態 diff、時間旅行除錯 |
| 非同步邏輯 | 沒有標準做法，通常在元件的 `useEffect` 裡處理後再 `dispatch` | `createAsyncThunk` 標準化 pending／fulfilled／rejected 三種狀態 |
| 重新渲染的顆粒度 | 受限於 Context 機制，`value` 改變則所有訂閱者重新渲染 | `useSelector` 可以只訂閱用得到的那一小塊 state |
| 是否綁定 React | 是，React 內建 Hook | 否，`store` 是純 JavaScript，`react-redux` 只是綁定層 |
| 需不需要額外套件 | 不需要 | 需要安裝 `@reduxjs/toolkit`、`react-redux` |

再次強調：這張表不是要說「`useReducer` 不好、Redux 比較好」，而是誠實列出兩者「能做到」與「做不到」的地方，讓你能依照專案規模與需求，判斷該選哪一種。

## 五、Redux 三大核心原則

### 1. 單一資料來源（Single Source of Truth）

> 整個 App 的全域狀態，存放在單一一個 store 裡的一棵物件樹中。

好處：

- **除錯與檢視方便**：任何時刻，只要呼叫 `store.getState()`，就能拿到整個 App「目前所有全域資料」的完整快照，不需要跑遍各個元件去找散落各處的 state。
- **相同資料不會有兩種版本**：如果購物車的商品數量，同時被存成 Header 元件自己的一份 state、又存成 CartPage 自己的另一份 state，這兩份資料完全有可能「兜不起來」（例如其中一份忘記同步更新）。單一資料來源保證「購物車商品數量」永遠只有一份真正的答案，其他地方都只是「讀取」這份答案，不會各自維護一份副本。

> ⚠️ 這裡有個常見誤解要先澄清：「單一資料來源」不代表「整個 App 只能有一個 `useState`」，也不是叫你把每一個元件內部的 UI 狀態（例如某個 Modal 目前開著還是關著、輸入框現在的文字）都硬塞進 Redux。只有真正需要「跨元件、跨頁面共享」的資料，才需要放進這個「單一資料來源」；純粹屬於某個元件自己內部、其他地方完全不需要知道的 UI 狀態，繼續用 `useState` 就好——第七節的常見陷阱整理會再提一次。

### 2. State 唯讀（State is Read-Only）

> 改變 state 的唯一方法，就是 dispatch 一個描述「發生了什麼事」的 action；除此之外，任何地方都不可以直接修改 state。

好處：

- **所有變化都經過同一個關卡、依照嚴格的順序一筆一筆發生**，不會有「畫面 A 跟畫面 B 同時偷偷改同一份資料」造成的競態問題（Race Condition）。
- **action 是普通物件，可以被記錄、序列化、儲存、之後重新播放**——這正是 Redux DevTools「時間旅行除錯」背後的原理：只要把所有 dispatch 過的 action 依序記錄下來，隨時都能從初始 state 開始，重新照順序 dispatch 一次，重現任何一個時間點的畫面。

具體來說，元件裡永遠不會看到這樣的程式碼：

```js
// ❌ 違反「State 唯讀」原則：直接修改 state
store.getState().cart.items.push(newItem)
```

只會看到：

```js
// ✅ 一律透過 dispatch 一個 action，表達「希望發生這件事」，
// 至於「state 實際上要怎麼變」，交給 reducer 決定
store.dispatch({ type: 'cart/addItem', payload: newItem })
```

### 3. Pure Function Reducer（用純函式描述狀態如何變化）

> 描述「state 該如何被 action 轉換」的函式，必須是純函式（Pure Function）。

這條原則跟 Day12 提過的「`reducer` 函式的兩條鐵則」完全一致，這裡直接沿用：

- **輸入同樣的 `(state, action)`，永遠得算出同樣的結果**：reducer 內部不能呼叫 `fetch`、不能讀寫 `localStorage`、不能使用 `Math.random()` 或 `Date.now()` 這類每次呼叫結果都不同的東西——這些「副作用（Side Effect）」一律要挪到 reducer 之外處理。
- **不能修改（mutate）傳進來的 `state`，必須回傳一份新的 state**：延續 Day04 開始一路強調的不可變更新（Immutability）原則。

> 💡 前面提過 Redux Toolkit 內建的 Immer，讓 `createSlice` 裡的 reducer「看起來像」在直接修改 state（例如 `state.items.push(newItem)`），這是不是違反了「必須回傳新的 state」？並不會——Immer 在背後偷偷把這些「看起來像 mutate」的操作，轉換成正確的不可變更新，最終產生的仍然是一份全新的 state；Immer 只是讓「寫法」變得直覺，沒有違反 Redux 的原則本身。這部分等 Day26 實際寫 `createSlice` 時會更清楚地看到。

## 六、動手設計購物車的 action／reducer／state（今日主練習）

### 1. 練習情境與目標

為 Day26～Day28 規劃的產出，是一個「多頁面電商購物車 App」：首頁、商品列表、商品詳情、購物車、結帳。今天的練習，是先把其中「購物車（Cart）」這一塊的資料流**用文字與表格設計清楚**——不安裝任何套件、不開任何專案、不寫一行程式碼，只需要紙筆或文字編輯器。Day26 會直接照著這裡設計出的規格，用 `createSlice` 實作成真正能執行的程式碼。

建議照著底下五個步驟先動手設計一次（可以先蓋住「參考設計」的部分），最後再對照本文提供的參考設計，看看有沒有考慮不到的地方。

### 2. Step 1：先畫一張「資料流動圖」，確認有哪些角色參與

在設計 state 形狀跟 action 之前，先花幾分鐘想清楚：這個功能牽涉到「哪些畫面」「哪些操作」。購物車功能至少會牽涉到：

```text
【商品列表頁 /products】── 每張商品卡片有「加入購物車」按鈕
【商品詳情頁 /products/:id】── 也有「加入購物車」按鈕（可能還能選數量）
【Header（在 RootLayout，所有頁面共用）】── 購物車圖示，要顯示「目前購物車裡有幾件商品」
【購物車頁 /cart】── 列出所有已加入的商品、可調整數量、可移除、顯示小計／應付金額
【結帳頁 /checkout】── 需要讀取購物車內容來顯示訂單摘要，結帳完成後要清空購物車
```

把這張圖畫出來（或用文字列出來）的用意是：確認購物車資料**真的**需要跨越好幾個不同的路由頁面被讀取／修改，驗證第一節的判斷——這正是需要「全域狀態」而不是某個 page 元件自己 `useState` 就能解決的情境。

### 3. Step 2：設計 State Shape（狀態形狀）

先決定「購物車這塊資料，應該長什麼樣子」。參考設計：

```js
// state.cart 的形狀（design-only：這是設計文件，不是可執行的程式碼）
cart: {
  items: [
    { id: 'p01', name: '無線滑鼠',   price: 590,  image: '/images/p01.png', qty: 2 },
    { id: 'p02', name: '機械式鍵盤', price: 1990, image: '/images/p02.png', qty: 1 },
  ]
}
```

設計這份 state 形狀時，有兩個值得特別停下來想清楚的決策點：

- **`items` 該存「完整商品資訊」還是「只存 `id` + `qty`」？** 兩種做法都看得到：只存 `id` + `qty`，之後要顯示名稱／價格時，得回頭去「商品清單」那份資料裡查表；存完整資訊（名稱、價格、圖片一起存進購物車），畫面渲染時不需要再查表，但如果之後商品價格調整了，購物車裡「已經加入」的商品，價格該不該跟著變動？這其實是真實電商都要面對的商業邏輯決策（多數電商選擇「保留加入當下的價格」，不會因為之後調價而變動使用者購物車裡的金額）——今天的參考設計選擇後者（存完整資訊），原因正是要保留「加入當下的價格」。
- **絕對不要把「算得出來的值」也存成 state 的一個欄位！** 例如「購物車總金額」「購物車總件數」，這兩個值**不應該**額外存成 `cart.totalPrice`、`cart.totalCount` 這樣的欄位——它們永遠可以由 `items` 陣列即時計算出來。如果多存一份，就會面臨「修改了 `qty`，卻忘記同步更新 `totalPrice`」的風險，這正是 Day12 提醒過的「多個狀態需要同時、一致地更新」的翻版，也直接違反第五節「單一資料來源」原則——`totalPrice` 應該永遠只有一個真正的來源（`items`），而不是自己維護一份可能兜不起來的副本。這類「算出來的值」正確的做法是寫成 **Selector**（見 Step 5）。

### 4. Step 3：設計 Action 清單

「加入商品、移除商品、修改數量、計算總金額」，設計出以下 action 清單（type 命名採用 `slice 名稱/操作名稱` 的慣例，這也剛好是 Day26 用 `createSlice({ name: 'cart', reducers: {...} })` 時，Redux Toolkit 會自動幫每個 reducer 產生的 action type 字串格式，不需要手動另外定義）：

| Action Type | Payload | 說明 | 觸發時機／位置 |
| --- | --- | --- | --- |
| `cart/addItem` | `{ id, name, price, image }` | 把商品加入購物車；若購物車已有相同 `id` 的商品，只把該項目的 `qty` 加 1，不會新增重複的項目 | 商品列表頁的商品卡片、商品詳情頁的「加入購物車」按鈕 |
| `cart/removeItem` | `{ id }` | 依 `id` 把整個項目從 `items` 移除（不論目前 `qty` 是多少） | 購物車頁面每個項目旁的「移除」按鈕 |
| `cart/changeQty` | `{ id, qty }` | 把指定 `id` 項目的 `qty` 更新為傳入的數值 | 購物車頁面的數量輸入框、`+`／`-` 按鈕 |
| `cart/clearCart` | 無 | 清空 `items`（重設為空陣列） | 購物車頁面的「清空購物車」按鈕；結帳完成後 |

> 這裡也是一個「先設計、再實作」很有價值的地方：如果之後（實際動手時）發現還需要別的操作，例如「一次調整多筆商品的數量」，隨時可以回來補上新的 action——設計文件不需要一次就完美，重點是先把「目前想得到的操作」列清楚。

### 5. Step 4：用文字描述每個 action 的 reducer 邏輯

針對 Step 3 列出的每一個 action，用文字（或 pseudo-code）描述「reducer 收到這個 action 之後，該怎麼算出下一份 state」，並確認每一條都遵守 Day12 提過的兩條鐵則（純函式、回傳新的 state，不可以 mutate）：

- **`cart/addItem`**：先在目前的 `items` 裡尋找有沒有 `id` 相同的項目。
  - 如果找到了：回傳一份新的 `items` 陣列，把該項目的 `qty` 加 1，其餘項目原封不動（用 `map` 建立新陣列，不能直接對原本的物件做 `item.qty++`）。
  - 如果沒找到：回傳「原本的 `items` 陣列 + 一筆新項目 `{ ...payload, qty: 1 }`」（用展開運算符建立新陣列，不能用 `items.push(...)` 直接修改原陣列）。
- **`cart/removeItem`**：回傳一份新的 `items` 陣列，內容是「原本的 `items` 裡，`id` 不等於 `payload.id` 的項目」（也就是 `items.filter(...)` 的結果）。
- **`cart/changeQty`**：回傳一份新的 `items` 陣列，把 `id` 等於 `payload.id` 的項目，其 `qty` 換成 `payload.qty`，其餘項目不變（`map` 建立新陣列）。
  - **設計決策點**：如果 `payload.qty` 被改成 `0` 或負數，該怎麼辦？至少有兩種合理設計——(a) 直接視為「移除該項目」（許多電商 App 的實際做法：使用者一路按「-」按鈕減到 0，直接從清單消失，符合直覺）；(b) 限制 `qty` 最小只能是 `1`，不允許減到 0 以下，使用者必須改按「移除」按鈕才能刪除。今天的參考設計選擇 (a)，因為它讓「減少數量」與「移除商品」共用同一個操作入口，使用者體驗更直覺；實際專案兩種做法都合理，重點是**要在設計階段就把這個 edge case 想清楚並明確記錄下來**，而不是留到寫程式時才隨便決定。
- **`cart/clearCart`**：不需要參考目前的 `state`，直接回傳 `{ items: [] }`——注意如果之後 `cart` 這個 slice 還有其他欄位（例如挑戰任務要設計的 `couponCode`），清空購物車時要記得**一次把所有相關欄位一起重設**，不能只清空 `items`、忘記重設優惠碼，這正是 Day12 第四節「一次改好幾個彼此關聯的欄位」提醒過的教訓。

### 6. Step 5：設計 Selector——「算出來的值」該怎麼處理

延續 Step 2 提過的原則：「購物車小計」「購物車總件數」不存進 state，而是設計成 **Selector**——一個「輸入目前的 state，回傳算好的衍生資料」的函式。這是 Day26、Day27 會實際用 `useSelector` 呼叫的東西，今天先設計它的行為：

| Selector 名稱 | 輸入 | 回傳內容 | 計算方式（文字描述） |
| --- | --- | --- | --- |
| `selectCartItems` | state | 購物車的商品陣列 | 直接回傳 `state.cart.items` |
| `selectCartTotalCount` | state | 購物車總件數（顯示在 Header 圖示上的數字） | 把 `items` 裡每一項的 `qty` 加總 |
| `selectCartTotalPrice` | state | 購物車應付金額（小計） | 把 `items` 裡每一項的 `price × qty` 加總 |

把「計算邏輯」設計成 Selector 而不是存進 state 的好處：不管 `items` 怎麼變化（加入、移除、調整數量），`selectCartTotalCount`／`selectCartTotalPrice` 每次都是**即時、正確地**從最新的 `items` 算出來，永遠不會有「忘記同步更新」的問題——這正是「單一資料來源」原則落實到實際設計上的具體樣子。

### 7. 完整走一次資料流：「加入購物車」範例

把 Step 2 ～ 5 的設計串起來，具體走一次「使用者在商品列表頁，把一件商品加入購物車」會發生的完整過程：

```text
使用者在 /products 頁面，看到「無線滑鼠」商品卡片，按下「加入購物車」
        │
        ▼
商品卡片的 onClick 呼叫：
dispatch({ type: 'cart/addItem', payload: { id: 'p01', name: '無線滑鼠', price: 590, image: '/images/p01.png' } })
        │
        ▼
cartReducer 收到這個 action：目前 items 裡沒有 id 為 'p01' 的項目
        │
        ▼
回傳新的 state：{ items: [...原本的 items, { id: 'p01', name: '無線滑鼠', price: 590, image: '/images/p01.png', qty: 1 }] }
        │
        ▼
Store 更新完成，通知所有訂閱者
        │
        ├──▶ Header（位於 RootLayout，所有頁面共用、不會因換頁而卸載）
        │     訂閱了 selectCartTotalCount，算出新結果「1」，購物車圖示的數字從「0」變成「1」
        │
        └──▶ 使用者接著點擊購物車圖示，網址換成 /cart，CartPage 重新掛載
              CartPage 用 selectCartItems 讀取 state.cart.items，
              直接就能看到「無線滑鼠 × 1」──即使 CartPage 是剛剛才掛載的全新元件，
              資料仍然完整，因為它讀的是「Store 裡的資料」，不是任何一個 page 元件自己的 state
```

對照第一節「購物車放在 `ProductListPage` 自己的 `useReducer` 會怎麼樣」的情境，這裡的關鍵差異一目了然：因為購物車資料放在 Store（獨立於任何 page 元件之外），不管使用者在哪個路由頁面之間切換，資料都完整保留。

### 8. 挑戰任務（可選、加分）：套用優惠碼

如果想多練習，可以延續 Day12 第四節「購物車套用優惠碼」的情境，把 `couponCode`、`discountRate` 兩個欄位也一併設計進今天的 `cart` state，並設計對應的 action（例如 `cart/applyCoupon`，payload 為 `{ code }`）與它的 reducer 邏輯（提示：跟 Day12 一樣，套用優惠碼要同時更新 `couponCode` 與 `discountRate` 兩個欄位；別忘了 `cart/clearCart` 也要一起重設這兩個欄位）；以及一個新的 Selector `selectCartFinalPrice`（回傳「小計 × (1 − discountRate)」算出的最終應付金額）。這部分不是 Day26 明確要求的內容，純粹是額外練習「設計思考」的機會。

## 七、常見誤解與陷阱整理

| 誤解／陷阱 | 說明 | 正確理解 |
| --- | --- | --- |
| 以為任何 state 都該放進 Redux | 把每個 Modal 開關、每個輸入框的文字都塞進全域 store，會讓 store 變得又肥又難懂，也讓元件之間產生不必要的耦合 | 只有「跨元件、跨頁面共享」的資料才需要放進 Redux；純粹屬於單一元件內部的 UI 狀態，繼續用 `useState` 就好（第五節第 1 小節提過） |
| 把「算出來的值」也存進 state | 例如把 `totalPrice` 存成 `cart.totalPrice`，之後容易忘記在某次 `changeQty` 時同步更新，導致畫面顯示的金額跟實際商品不一致 | 算得出來的衍生資料，一律設計成 Selector（Step 5），永遠即時從原始資料算出來，不另外存一份 |
| 以為 Redux 是 React 專屬的技術 | Redux 的 `store`／`reducer` 本身是純 JavaScript，跟任何前端框架無關 | `react-redux` 只是 Redux 與 React 之間的綁定層；同樣的 Redux 邏輯理論上也能被其他框架使用 |
| 以為 reducer 可以直接呼叫 API | reducer 必須是純函式，`fetch` 這類非同步、有副作用的操作放進 reducer，會讓「同樣輸入卻不一定得到同樣輸出」，違反 Pure Function Reducer 原則 | 非同步邏輯要獨立處理，之後會學到標準做法 `createAsyncThunk` |
| 以為 state 一定要是一個扁平、單層的大物件 | 誤以為所有欄位都要攤平在最外層，導致設計 state 形狀時綁手綁腳 | Redux Toolkit 用 `configureStore({ reducer: { cart, products, user } })` 的方式，把多個獨立的 slice 組合成一棵物件樹，各自的欄位可以巢狀存在自己的 slice 底下 |
| 誤以為忘記清空的 state 是 Redux 的責任 | 例如結帳完成後，如果忘記 dispatch `cart/clearCart`，購物車資料不會自動清空 | State 唯讀原則只保證「不能繞過 dispatch 亂改」，但「什麼時候該 dispatch 哪個 action」仍然要由開發者自己在正確的時間點呼叫，Redux 不會幫你自動決定 |

## 八、Day26 之後的預告：這份設計會怎麼被實作

今天設計出來的東西，會在接下來幾天直接變成程式碼：

- **Day26**：安裝 `@reduxjs/toolkit`、`react-redux`，用 `configureStore` 建立 store，用 `createSlice({ name: 'cart', initialState, reducers: {...} })` 把今天 Step 3、Step 4 設計的 action／reducer 邏輯寫成真正的程式碼——今天表格裡的每一列 action，都會對應 `reducers` 物件裡的一個函式；元件則改用 `useSelector`（讀取，對應 Step 5 的 Selector 設計）與 `useDispatch`（觸發，對應 Step 3 的 action）存取購物車。
- **Day27**：學習 `createAsyncThunk`，把 Day20 「文章列表」串接 API 的邏輯，改成用 Redux Toolkit 管理，體會「非同步資料」跟今天「同步的購物車操作」在 reducer 設計上的差異（會多出 `pending`／`fulfilled`／`rejected` 三種狀態）。
- **Day28**：整合 React Router 的多頁面（首頁、商品列表、商品詳情、購物車、結帳）與 Redux Toolkit 的全域狀態（購物車、使用者、商品資料），這時候 store 裡會出現不只一個 slice，今天第四節對照表提過的 `configureStore({ reducer: { cart, products, user } })` 就會真正派上用場。

## 十、延伸閱讀

- [Three Principles | Redux](https://redux.js.org/understanding/thinking-in-redux/three-principles)
- [Quick Start | Redux Toolkit](https://redux-toolkit.js.org/tutorials/quick-start)
