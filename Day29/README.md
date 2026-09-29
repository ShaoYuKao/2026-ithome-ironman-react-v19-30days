# Day 29｜程式碼品質與測試基礎

- 今日範例程式碼：[`Day29\examples\day29-quality-testing-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day29/examples/day29-quality-testing-lab)

## 一、為什麼收尾週才談「程式碼品質」與「測試」？

從 Day01 到 Day28，每一天的重點都是「做出一個會動的功能」：待辦清單、表單驗證、路由切換、Redux 全域狀態……但完全沒有談過兩個問題：

1. **程式碼「長得好不好」**：三個人一起寫同一份程式碼，有人用單引號、有人用雙引號，有人加分號、有人不加，Code Review 時光是為了這些小事情就能吵半天，卻沒有真正檢查邏輯對不對。
2. **功能「還動不動」**：Day27、Day28 的驗證清單裡，都是靠人手動點過一遍畫面。專案還小的時候這樣做沒問題，但當元件愈拆愈多、Redux slice 愈長，每次改完程式碼都要重新手動點一遍全部功能，會變得非常耗時，而且很容易漏掉某個角落。

這兩個問題分別對應今天要學的兩件事：

- **程式碼品質工具**（Linter + Formatter）：把「風格」跟「潛在錯誤」的檢查交給工具自動判斷，人只需要專心討論邏輯設計。
- **自動化測試**：把「這個功能還正常嗎」寫成程式碼留在專案裡，之後不管改多少次程式碼，執行一個指令（`npm run test`）就能重新驗證一次，形成一張安全網，讓你敢放心重構。

這也是為什麼這兩件事被排在「收尾週」：功能都做出來之後，才有東西可以被檢查、被測試；學會之後，未來每一天寫的新程式碼，都可以套用今天學到的習慣。

## 二、程式碼品質三兄弟：Linter、Formatter、測試框架

| 角色 | 解決的問題 | 這系列範例用的工具 | 常見執行時機 |
| --- | --- | --- | --- |
| **Linter（靜態分析）** | 抓出「可能有問題」的寫法：用了未宣告的變數、違反 React Hooks 規則、忘記處理的邊界情況…… | `oxlint` | 編輯器存檔時、`npm run lint`、CI |
| **Formatter（格式化）** | 統一縮排、引號、分號、換行等「純視覺」風格，讓所有人寫出來的程式碼長得一樣 | `Prettier`（今天新增） | 編輯器存檔時、`npm run format`、CI |
| **測試框架** | 驗證「功能的行為」是否符合預期，反映的是執行結果而不是外觀 | `Vitest` + `React Testing Library`（今天新增） | 開發中（`npm run test:watch`）、`npm run test`、CI |

用一句話理解三者的分工：**Linter 管「這樣寫會不會有問題」，Formatter 管「這樣寫好不好看」，測試框架管「這樣寫對不對」**。三者互相獨立、也互相補位——Linter 抓得再仔細，也抓不出「使用者點兩下加入購物車，數量有沒有正確累加」這種行為層級的錯誤；測試寫得再完整，也不會提醒你「這一行少了一個空白」。

## 三、真實案例：從 [GitHub React](https://github.com/react/react) 的正式設定檔認識 ESLint 與 Prettier

ESLint 是一套「規則可以自訂」的 JavaScript 靜態分析工具，設定檔通常由三個部分組成：

- **`plugins`**：載入額外的規則集合，例如專門檢查 React 用法的 `eslint-plugin-react`。
- **`extends`**：直接繼承別人已經寫好的一整組規則，例如 `extends: ['prettier']` 代表「關掉所有會跟 Prettier 排版風格打架的規則」。
- **`rules`**：一條一條設定「這個規則要不要開、開的話是警告（`warn`）還是錯誤（`error`）」。

這份從 GitHub React [.eslintrc.js](https://github.com/react/react/blob/main/.eslintrc.js) 設定告訴 ESLint「幫我檢查程式碼裡有沒有偷用了沒宣告的變數、字串要一律用單引號、React 元件要遵守哪些寫法規則」；而 `extends: ['prettier']` 那一行則是在說「排版風格的事全部交給 Prettier，ESLint 你不要管」——這正是上一節表格裡「Linter 管對不對、Formatter 管好不好看」的具體實踐。

再看看同一個專案的 `prettier.config.js`：

```js
module.exports = {
  bracketSpacing: false,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',
  printWidth: 80,
  arrowParens: 'avoid',
};
```

Prettier 的設定簡單非常多，因為它「不做邏輯判斷，只管格式」：`singleQuote: true` 表示字串一律用單引號、`printWidth: 80` 表示單行超過 80 字元就自動換行、`trailingComma: 'es5'` 表示陣列／物件最後一項的逗號要不要保留。這也再次呼應：**Prettier 的設定選項幾乎都是「長怎樣」，ESLint 的規則幾乎都是「對不對」**。

### oxlint：本系列範例一直在用、相容 ESLint 規則的 Rust 版 linter

從 Day01 開始，每一天用 `npm create vite@latest` 建立的範例，都會看到一個 `.oxlintrc.json` 檔案與 `npm run lint` 指令——執行的其實不是 ESLint，而是 **oxlint**：一個用 Rust 寫成、目標是「相容大多數 ESLint 規則、但快非常多」的新一代 linter，也是目前 Vite 官方 React 範本預設採用的 linter。它的設定語法跟 ESLint 的 `rules` 區塊很相似：

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

可以記住這個對照關係：**oxlint 在這個系列扮演的角色，就是 GitHub React 那份 `.eslintrc.js` 裡 ESLint 扮演的角色**——負責抓程式碼裡「可能有問題」的寫法，只是換了一套更快的實作。今天的範例會沿用既有的 oxlint 當 linter，額外把 Prettier 加進來負責格式化，因為 oxlint 目前的格式化能力還很有限。

## 四、幫範例專案加上 Prettier（搭配既有的 oxlint）

### 1. 安裝

```bash
npm install -D prettier
```

### 2. 建立 `.prettierrc.json`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

| 選項 | 意思 |
| --- | --- |
| `semi: false` | 陳述式結尾不加分號（本系列範例一直以來的寫法） |
| `singleQuote: true` | 字串用單引號 `'...'`，不用雙引號 |
| `trailingComma: "all"` | 陣列／物件／函式參數的最後一項後面也加逗號，減少之後新增項目時的 diff 雜訊 |
| `printWidth: 100` | 單行超過 100 字元就自動換行 |
| `tabWidth: 2` | 縮排使用 2 個空白 |

### 3. 建立 `.prettierignore`

```
dist
coverage
node_modules
package-lock.json
```

跟 `.gitignore` 的邏輯一樣：這些是建置產物或別人產生的檔案，不需要（也不應該）被 Prettier 重新排版。

### 4. `package.json` 新增 `format` / `format:check` 指令

```json
"scripts": {
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

`format` 會直接修改檔案；`format:check` 只檢查、不修改，適合放進 CI——如果有人提交了沒格式化的程式碼，CI 就會顯示失敗，提醒對方先跑一次 `format`。

### 5. 實際跑一次，體會 Prettier 做了什麼

在還沒建立 `.prettierrc.json` 之前，先跑 `npm run format:check`，會看到類似這樣的結果：

```
Checking formatting...
[warn] src/components/AddToCartButton.jsx
[warn] src/components/ProductCard.jsx
[warn] src/store/cartSlice.js
...
Code style issues found in 14 files. Run Prettier with --write to fix.
```

再跑 `npm run format`，Prettier 會自動重新排版這些檔案（例如把太長的 JSX 屬性拆成多行、統一縮排與引號），完成後再跑一次 `npm run format:check`，就會看到：

```
Checking formatting...
All matched files use Prettier code style!
```

> 💡 oxlint 跟 Prettier 不是二選一：**oxlint 負責「這段邏輯有沒有問題」，Prettier 負責「這段程式碼長什麼樣子」**。實務上兩者會一起裝：編輯器存檔時自動用 Prettier 格式化，`npm run lint` 再用 oxlint 抓潛在的邏輯錯誤，兩個指令彼此獨立、互不衝突。

## 五、測試的基本觀念：為什麼要測試、RTL 的哲學

Day20、Day27、Day28 的驗證清單裡，都曾經額外安裝 Playwright、寫自動化腳本操作瀏覽器驗證行為，但驗證完就把腳本刪除，沒有留在專案裡。今天是這個系列第一次把測試「寫成程式碼、留在專案裡」——之後不管改了多少次程式碼，只要執行 `npm run test`，就能重新確認所有已經寫過測試的行為是否還正常，不必每次都重新手動點一遍畫面。

### 1. 測試金字塔：三種測試的定位

| 類型 | 測試範圍 | 速度 | 今天範例對應 |
| --- | --- | --- | --- |
| 單元測試（Unit Test） | 只測一小塊邏輯或一個獨立元件 | 最快、數量最多 | `QuantityStepper.test.jsx`、`AddToCartButton.test.jsx` |
| 整合測試（Integration Test） | 測多個部分組合起來的行為（例如元件 + Redux store） | 中等 | `ProductCard.test.jsx` |
| E2E 測試（End-to-End Test） | 用真的瀏覽器操作整個網站 | 最慢、數量最少 | Day20／Day27／Day28 用手動驗證的方式，概念上屬於這一層 |

一般會建議「單元測試最多、整合測試次之、E2E 測試最少」（外型像金字塔，因此稱為測試金字塔），因為愈上層的測試愈慢、愈脆弱（畫面改一點點顏色都可能讓 E2E 腳本失敗），但也愈能模擬真實使用情境；愈下層的測試愈快、愈穩定，適合大量覆蓋各種邊界情況。

### 2. React Testing Library（RTL）的核心哲學

RTL 官方文件開宗明義的「Guiding Principles」是：

> The more your tests resemble the way your software is used, the more confidence they can give you.
> （你的測試方式越接近使用者實際使用軟體的方式，就越能帶給你信心。）

白話來說：**不要測試「這個元件內部呼叫了幾次 `useState`」，而要測試「使用者按下這個按鈕之後，畫面上看到了什麼」**。這也是為什麼 RTL 完全不提供「用 class name 找元素」的 API——它刻意引導開發者用「使用者（包含使用螢幕閱讀器的使用者）實際找得到這個元素的方式」去查詢畫面，第七節會示範實際的查詢優先順序。

### 3. Vitest 是什麼

Vitest 是 Vite 官方推出的測試框架，API 幾乎與 Jest 一模一樣（`describe`／`it`／`expect`／`vi.fn()`），最大優勢是直接重用 Vite 既有的轉譯管線（transform pipeline），啟動速度快很多；設定也可以直接寫在專案已經有的 `vite.config.js` 裡，不需要另外學一套建置工具。

## 六、安裝與設定 Vitest + React Testing Library

### 1. 安裝套件

```powershell
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

| 套件 | 用途 |
| --- | --- |
| `vitest` | 測試框架本身，提供 `describe`／`it`／`expect`／`vi.fn()` 等 API |
| `jsdom` | 在 Node.js 環境模擬瀏覽器的 DOM（`document`、`window`），元件才有地方可以「渲染」 |
| `@testing-library/react` | 提供 `render()`、`screen` 等 API，把 React 元件渲染進 jsdom |
| `@testing-library/jest-dom` | 擴充 `expect`，新增 `toBeInTheDocument()`、`toBeDisabled()`、`toHaveValue()` 這類跟 DOM 有關的斷言 |
| `@testing-library/user-event` | 模擬更貼近真實使用者的互動（點擊、輸入），比原生的 `fireEvent` 更接近瀏覽器實際行為 |

### 2. 在 `vite.config.js` 設定測試環境

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
```

Vitest 會自動讀取同一份 `vite.config.js` 裡的 `test` 欄位，不需要另外建立設定檔：

- `environment: 'jsdom'`：Vitest 預設用 Node.js 環境執行（沒有 `document`），這裡改成用 jsdom 模擬瀏覽器環境。
- `setupFiles`：每個測試檔案執行「之前」，都會先載入這裡指定的檔案。

### 3. 建立測試環境設定檔 `src/test/setup.js`

```js
// src/test/setup.js
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

- `import '@testing-library/jest-dom/vitest'`：把 `toBeInTheDocument()` 這類 matcher 掛到 Vitest 的 `expect` 上。
- `afterEach(() => cleanup())`：每個測試結束後，把上一個測試 render 出來的 DOM 清乾淨。React Testing Library 官方文件會建議開啟 `test.globals: true` 讓這件事自動發生；但這個範例刻意**不開全域變數**（保留 `describe`／`it`／`expect` 都要自己 `import` 的明確寫法），所以需要在這裡手動註冊一次。

### 4. `package.json` 新增測試指令

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

`vitest run` 執行一次就結束（適合 CI）；`vitest`（不加 `run`）會進入互動式的 watch 模式，檔案一存檔就自動重跑相關測試，很適合開發時開著。

## 七、寫出你的第一組測試：渲染測試與互動測試

### 1. 用 AAA 三步驟拆解一個測試

任何一個測試案例都可以拆成三個步驟，簡稱 **AAA**：

1. **Arrange（準備）**：把要測試的元件渲染出來，準備好需要的 props／假資料。
2. **Act（行動）**：模擬使用者的操作（點擊、輸入文字……）；如果只是要驗證「一開始畫面長什麼樣」，這個步驟可以省略。
3. **Assert（斷言）**：用 `expect(...)` 檢查結果是否符合預期。

以範例裡 `QuantityStepper.test.jsx` 的第一個測試為例，這是只有 Arrange + Assert 的**渲染測試（Render Test）**——只驗證「給定這些 props，畫面長什麼樣」：

```js
it('會把目前的 qty 顯示在輸入框內', () => {
  render(<QuantityStepper qty={3} onChange={() => {}} />) // Arrange：渲染元件，帶入 qty=3
  expect(screen.getByLabelText('購買數量')).toHaveValue(3) // Assert：輸入框的值要是 3
})
```

再看第二個測試，多了 Act 這一步，變成**互動測試（Interaction Test）**：

```js
it('點擊「+」按鈕時，會呼叫 onChange 並帶入 qty + 1', async () => {
  const user = userEvent.setup()
  const handleChange = vi.fn() // Arrange：準備一個「假函式」記錄呼叫紀錄
  render(<QuantityStepper qty={2} onChange={handleChange} />) // Arrange：渲染元件

  await user.click(screen.getByRole('button', { name: '增加數量' })) // Act：模擬使用者點擊「+」

  expect(handleChange).toHaveBeenCalledTimes(1) // Assert：onChange 恰好被呼叫一次
  expect(handleChange).toHaveBeenCalledWith(3) // Assert：帶入的參數是 2 + 1 = 3
})
```

`vi.fn()` 是 Vitest 提供的「假函式（mock function）」，本身不做任何事，但會記錄「被呼叫了幾次、每次帶了什麼參數」，很適合用來驗證「事件有沒有被正確觸發」，不需要真的接一個會改變畫面的 state 才能測試。

### 2. 查詢元素的優先順序：優先用「使用者找得到」的方式

React Testing Library 鼓勵用「使用者（包含用螢幕閱讀器的使用者）實際找得到這個元素的方式」來查詢畫面，常見優先順序由高到低：

1. **`getByRole`**：用元素的無障礙角色（`button`、`textbox`、`heading`…）與 accessible name 尋找，最貼近「使用者怎麼找到它」，例如今天用的 `getByRole('button', { name: '增加數量' })`。
2. **`getByLabelText`**：用表單欄位對應的 `<label>` 或 `aria-label` 尋找，例如 `getByLabelText('購買數量')`。
3. **`getByText`**：直接用畫面上顯示的文字尋找。
4. **`getByTestId`**：用 `data-testid` 屬性尋找，只有在前面幾種都不適用時才當最後手段——因為 `data-testid` 是使用者完全看不到、螢幕閱讀器也讀不到的東西。

今天的三個測試檔案都只用了 `getByRole` 與 `getByLabelText`，這不是巧合：因為 `QuantityStepper`／`AddToCartButton` 的按鈕都乖乖標上了 `aria-label`，這樣寫測試的同時，也順便確認了元件本身有沒有做好基本的無障礙（a11y）支援。

### 3. `userEvent` vs `fireEvent`：為什麼要 `await`

`@testing-library/react` 內建的 `fireEvent.click(...)` 只會觸發單一個 DOM 事件；而 `@testing-library/user-event` 的 `user.click(...)` 會模擬瀏覽器實際發生的一連串事件（`pointerdown` → `mousedown` → `focus` → `pointerup` → `mouseup` → `click`），更接近真實使用者的操作方式，官方文件也建議優先使用 `userEvent`。因為這一整串事件是非同步排程的，每個 `userEvent` 方法都要搭配 `await`：

```js
const user = userEvent.setup() // 每個測試各自建立一份 user，彼此不共用設定
await user.click(button)
```

## 八、今日範例：`day29-quality-testing-lab`

### 1. 範例總覽

延續 Day26／Day28 的購物車情境，把其中最核心的兩個 UI 元件——**數量調整（`QuantityStepper`）**與**加入購物車按鈕（`AddToCartButton`）**——抽出來，重新設計成一個更小、更適合示範測試的獨立專案：

- **展示型元件（Presentational Component）**：`QuantityStepper`、`AddToCartButton`，完全不知道 Redux 存在，只靠 props 決定畫面長相與 callback，是最容易測試的元件。
- **容器元件（Container Component）**：`ProductCard`（串接 Redux，加入購物車）、`CartSummary`（只讀 store，顯示小計），負責把「使用者操作」轉成 `dispatch`，把 Redux store 的資料轉成 props 傳給展示型元件。
- 3 個核心元件各自有對應的 `*.test.jsx`，合計 **9 個測試案例**，執行 `npm run test` 即可全部驗證。

這個範例刻意**沒有**串接後端 API、也**沒有**用 React Router 做多頁面——今天的重點是「程式碼品質工具」與「測試」，畫面越單純，越能把篇幅留給怎麼寫測試。

### 2. 專案結構

```
day29-quality-testing-lab/
├── .oxlintrc.json          # oxlint 規則設定（沿用 Vite 範本預設）
├── .prettierrc.json        # Prettier 格式設定（今天新增）
├── .prettierignore         # Prettier 忽略清單（今天新增）
├── vite.config.js          # 新增 test 欄位：environment、setupFiles
├── src/
│   ├── data/
│   │   └── products.js               # 假商品資料（沒有後端 API）
│   ├── store/
│   │   ├── cartSlice.js              # 沿用 Day26／Day28 的購物車 slice，多一個 selector
│   │   └── store.js                  # createAppStore() 工廠函式，方便測試建立獨立 store
│   ├── components/
│   │   ├── QuantityStepper.jsx       # 展示型元件：數量調整
│   │   ├── QuantityStepper.test.jsx  # 4 個測試
│   │   ├── AddToCartButton.jsx       # 展示型元件：加入購物車按鈕
│   │   ├── AddToCartButton.test.jsx  # 3 個測試
│   │   ├── ProductCard.jsx           # 容器元件：組合以上兩者 + 連接 Redux
│   │   ├── ProductCard.test.jsx      # 2 個整合測試
│   │   └── CartSummary.jsx           # 容器元件：只讀 store，顯示購物車小計
│   ├── test/
│   │   ├── setup.js                  # Vitest 環境設定（jest-dom、cleanup）
│   │   └── test-utils.jsx            # renderWithStore()：包一層 <Provider> 的共用工具
│   ├── App.jsx / App.css / index.css
│   └── main.jsx
```

### 3. 展示型元件（一）：`QuantityStepper` 與它的測試

```jsx
// src/components/QuantityStepper.jsx
function QuantityStepper({ qty, min = 1, max = 99, onChange, label = '購買數量' }) {
  function clamp(nextQty) {
    return Math.min(Math.max(nextQty, min), max)
  }

  return (
    <div className="qty-stepper">
      <button
        type="button"
        onClick={() => onChange(clamp(qty - 1))}
        disabled={qty <= min}
        aria-label="減少數量"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={qty}
        onChange={(event) => onChange(clamp(Number(event.target.value) || min))}
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(qty + 1))}
        disabled={qty >= max}
        aria-label="增加數量"
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
```

這個元件**沒有自己的 state**——目前的數量 `qty` 完全來自 props，使用者點擊 +/− 或直接輸入數字時，都是呼叫 `onChange(新的數量)` 交給外層決定要不要接受這個值（這是「受控元件」的觀念，Day09 教過的原則同樣適用在自訂元件上）。

對應的測試（`QuantityStepper.test.jsx`）：

```js
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuantityStepper from './QuantityStepper.jsx'

describe('QuantityStepper（數量調整元件）', () => {
  it('會把目前的 qty 顯示在輸入框內', () => {
    render(<QuantityStepper qty={3} onChange={() => {}} />)
    expect(screen.getByLabelText('購買數量')).toHaveValue(3)
  })

  it('點擊「+」按鈕時，會呼叫 onChange 並帶入 qty + 1', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<QuantityStepper qty={2} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: '增加數量' }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(3)
  })

  it('qty 已經等於 min 時，「−」按鈕要是 disabled，不能再往下減少', () => {
    render(<QuantityStepper qty={1} min={1} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '減少數量' })).toBeDisabled()
  })

  it('qty 已經等於 max 時，「+」按鈕要是 disabled，不能再往上加（庫存上限情境）', () => {
    render(<QuantityStepper qty={5} max={5} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '增加數量' })).toBeDisabled()
  })
})
```

四個測試分別驗證：初始渲染值正確、點擊「+」會通知外層正確的新數量、下限時「−」鍵停用、上限時「+」鍵停用（模擬「庫存只剩 5 件，不能選第 6 件」的情境）。

### 4. 展示型元件（二）：`AddToCartButton` 與它的測試

```jsx
// src/components/AddToCartButton.jsx
function AddToCartButton({ disabled = false, inCart = false, onAdd }) {
  const label = disabled ? '已售完' : inCart ? '✓ 已加入購物車（再加 1 件）' : '🛒 加入購物車'

  return (
    <button type="button" className="primary-btn" onClick={onAdd} disabled={disabled}>
      {label}
    </button>
  )
}

export default AddToCartButton
```

這個按鈕的文字完全由 `disabled`／`inCart` 兩個 props 決定，本身不含條件判斷以外的邏輯。對應的測試：

```js
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddToCartButton from './AddToCartButton.jsx'

describe('AddToCartButton（加入購物車按鈕）', () => {
  it('預設狀態顯示「加入購物車」，點擊會呼叫 onAdd 一次', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn()
    render(<AddToCartButton onAdd={handleAdd} />)

    await user.click(screen.getByRole('button', { name: '🛒 加入購物車' }))

    expect(handleAdd).toHaveBeenCalledTimes(1)
  })

  it('disabled 為 true（沒有庫存）時顯示「已售完」，且點擊不會呼叫 onAdd', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn()
    render(<AddToCartButton disabled onAdd={handleAdd} />)

    const button = screen.getByRole('button', { name: '已售完' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleAdd).not.toHaveBeenCalled()
  })

  it('inCart 為 true 時，文字要換成「已加入購物車」的提示', () => {
    render(<AddToCartButton inCart onAdd={() => {}} />)
    expect(screen.getByRole('button', { name: /已加入購物車/ })).toBeInTheDocument()
  })
})
```

第二個測試特別值得注意：瀏覽器本身就不會對 `disabled` 的按鈕觸發 `click` 事件，`userEvent.click` 也遵循同樣的行為，所以 `await user.click(button)` 執行後，`handleAdd` 理應完全沒被呼叫——這個測試同時驗證了「畫面正確停用」與「停用時真的點不動」兩件事。

### 5. 容器元件：`ProductCard` 與整合測試

```jsx
// src/components/ProductCard.jsx
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import QuantityStepper from './QuantityStepper.jsx'
import AddToCartButton from './AddToCartButton.jsx'
import { addItem, selectCartItemById } from '../store/cartSlice.js'

function ProductCard({ product }) {
  const dispatch = useDispatch()
  const cartItem = useSelector(selectCartItemById(product.id))
  const [qty, setQty] = useState(1)

  function handleAdd() {
    dispatch(addItem({ id: product.id, name: product.name, price: product.price, image: product.image, qty }))
  }

  return (
    <li className="product-card">
      {/* ...省略商品資訊... */}
      <QuantityStepper qty={qty} min={1} max={Math.max(product.stock, 1)} onChange={setQty} />
      <AddToCartButton disabled={product.stock === 0} inCart={Boolean(cartItem)} onAdd={handleAdd} />
    </li>
  )
}
```

`ProductCard` 身兼二職：一邊用 `useState` 管理「目前選擇的數量」（純 UI 狀態，不需要放進 Redux），一邊用 `useSelector(selectCartItemById(product.id))` 讀取「這件商品是否已經在購物車裡」，再把這兩份資料轉成 props 傳給兩個展示型元件。

> 這種「展示型元件 + 容器元件」的分工，是讓 UI 元件容易測試的常見作法：`QuantityStepper`／`AddToCartButton` 可以完全不靠 Redux 就測試互動行為；`ProductCard` 則因為連接了 Redux，測試時需要多包一層 `<Provider>`，屬於「整合測試」。

因為它連接了 Redux，不能直接 `render()`，`src/test/test-utils.jsx` 準備了一個共用工具：

```jsx
// src/test/test-utils.jsx
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import { createAppStore } from '../store/store.js'

export function renderWithStore(ui, { preloadedState, store = createAppStore(preloadedState) } = {}) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper }) }
}
```

`store.js` 也特意設計成「工廠函式」而不是單一個共用實例：

```js
// src/store/store.js
export function createAppStore(preloadedState) {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState,
  })
}

export const store = createAppStore() // App 實際執行時用這一份
```

這樣每個測試都能呼叫 `createAppStore()` 拿到一份全新、乾淨的 store，彼此不會共用同一份全域狀態、不會互相汙染。有了這個工具，`ProductCard.test.jsx` 就能寫出兩個整合測試：

```js
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from './ProductCard.jsx'
import { renderWithStore } from '../test/test-utils.jsx'
import { selectCartItems } from '../store/cartSlice.js'

const product = { id: 'p1', name: '機械鍵盤', price: 2280, image: '⌨️', stock: 5 }

describe('ProductCard（連接 Redux 的容器元件）', () => {
  it('把數量調整成 2 後按下加入購物車，store 裡的購物車項目數量要正確更新為 2', async () => {
    const user = userEvent.setup()
    const { store } = renderWithStore(<ProductCard product={product} />)

    await user.click(screen.getByRole('button', { name: '增加數量' }))
    await user.click(screen.getByRole('button', { name: '🛒 加入購物車' }))

    expect(selectCartItems(store.getState())).toEqual([
      { id: 'p1', name: '機械鍵盤', price: 2280, image: '⌨️', qty: 2 },
    ])
  })

  it('商品已經在購物車裡時（preloadedState 帶入初始資料），畫面要顯示「已加入購物車」提示', () => {
    renderWithStore(<ProductCard product={product} />, {
      preloadedState: {
        cart: { items: [{ id: 'p1', name: '機械鍵盤', price: 2280, image: '⌨️', qty: 1 }] },
      },
    })

    expect(screen.getByRole('button', { name: /已加入購物車/ })).toBeInTheDocument()
  })
})
```

第一個測試驗證「操作畫面 → Redux store 資料正確更新」，斷言的對象是 `store.getState()` 而不是畫面文字，這是整合測試常見的寫法；第二個測試示範用 `preloadedState` 直接指定「一開始購物車裡就有這件商品」的情境，不需要真的操作畫面就能測試「已加入」狀態的顯示邏輯。

### 6. `cartSlice.js`：沿用 Day26／Day28 的設計，額外多一個 selector

今天的 `cartSlice.js` 跟 Day26／Day28 的規格完全相同（`addItem`／`removeItem`／`changeQty`／`clearCart` 四個 action），只多了一個 `selectCartItemById(id)`，讓 `ProductCard` 判斷「這件商品是不是已經加過了」：

```js
export const selectCartItemById = (id) => (state) => state.cart.items.find((item) => item.id === id)
```

這是一個「回傳 selector 的函式」（selector factory），跟 Day28 `selectProductById(productId)` 是同一個套路，所有 reducer 也都維持單純的同步函式——這正是今天選擇拿購物車當練習素材的原因：不需要任何 mock，Vitest 就能直接呼叫測試。

## 九、常見陷阱整理

| 陷阱 | 說明 | 正確理解 |
| --- | --- | --- |
| 忘記在 `user.click(...)` 前面加 `await` | `userEvent` 的每個方法都回傳 Promise，沒加 `await` 可能斷言先跑完，動作卻還沒真的觸發 | `userEvent` 的方法一律要 `await`，測試函式也要宣告成 `async` |
| 測試「元件內部用了什麼 state、呼叫了幾次某個函式」而不是「使用者看到什麼」 | 這種測試只要重構實作（不影響外部行為）就會壞掉，變成阻礙重構的絆腳石 | 優先用 `getByRole`／`getByLabelText`／`getByText` 這種「使用者也看得到」的查詢方式，斷言畫面上真正呈現的內容 |
| 濫用 `getByTestId` | `data-testid` 是使用者看不到、螢幕閱讀器也讀不到的屬性，過度依賴代表元件本身可能缺乏無障礙屬性 | 只有在真的找不到合適的 role／label 時，才把 `getByTestId` 當最後手段 |
| 沒有在測試環境設定檔呼叫 `cleanup()` | 沒開 `test.globals` 時，RTL 不會自動清理上一個測試殘留的 DOM，可能讓下一個測試找到「重複」的元素而誤判 | 在 `setupFiles` 指定的檔案裡手動 `afterEach(() => cleanup())`，或者乾脆開啟 `test.globals: true` |
| 每個測試共用同一個 Redux store 實例 | 前一個測試 dispatch 過的資料會殘留到下一個測試，測試結果互相影響、難以定位問題 | 用工廠函式（`createAppStore`）讓每個測試都拿到全新的 store，測試之間互不影響 |
| 以為 `oxlint` 能取代 Prettier | oxlint 目前只做「有限的格式檢查」，不會像 Prettier 一樣重新排版整份程式碼 | Linter 抓邏輯問題、Formatter 統一格式，兩者要一起裝，不能只裝一個就期待兩種效果都有 |
| 點擊 `disabled` 的按鈕還期待事件被觸發 | 瀏覽器本身就不會對 disabled 的表單元素觸發 `click` 事件 | 這其實是正確行為，測試時應該斷言 callback 沒有被呼叫，而不是想辦法讓它觸發 |

## 十、如何在本機執行範例

這個範例沒有後端 API，只需要一個終端機視窗：

```bash
cd Day29/examples/day29-quality-testing-lab
npm install

npm run test          # 執行一次全部測試（適合 CI）
npm run test:watch    # 開發時的互動模式，檔案變動自動重跑

npm run lint           # oxlint 靜態分析
npm run format:check   # 只檢查格式，不修改檔案
npm run format          # 自動修正格式

npm run dev             # 開發伺服器：http://localhost:5173
npm run build           # 打包正式版本
npm run preview         # 預覽打包後的結果：http://localhost:4173
```

## 十二、延伸閱讀

- [Vitest 官方文件](https://vitest.dev/)
- [React Testing Library 官方文件](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library：Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Prettier 官方文件](https://prettier.io/docs/en/index.html)
- [oxlint 官方文件](https://oxc.rs/docs/guide/usage/linter.html)
- [ESLint 官方文件](https://eslint.org/docs/latest/)
