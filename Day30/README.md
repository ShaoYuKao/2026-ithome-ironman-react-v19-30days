# Day 30｜專案整合與部署上線

- 今日範例程式碼(連結)：[`Day29\examples\day29-quality-testing-lab`](https://github.com/ShaoYuKao/2026-ithome-ironman-react-v19-30days/tree/master/Day30/examples/day30-deploy-showcase)

## 一、今天是最後一哩路：從「能動」到「能上線」

從 Day01 到 Day29，每天輸入 `npm run dev`，畫面就會出現在 `http://localhost:5173`——但這個網址只有「自己的電腦」看得到。想讓其他人也能打開瀏覽器直接看到成果，中間還缺兩件事：

1. **打包（Build）**：把一堆 `.jsx`／`.css` 原始檔案，轉換、壓縮成瀏覽器能直接執行、檔案數量更少的正式版本。
2. **部署（Deploy）**：把打包出來的檔案放到一台「隨時開著、有網址」的伺服器上，讓任何人都能連進去。

這兩件事合起來，就是今天的主題。也因為是課程最後一天，範例（`day30-deploy-showcase`）刻意不再新增任何 React 功能，而是把前 29 天教過的東西（React Router、`useLocalStorage` 自訂 Hook……）拿來蓋一個「30 天學習歷程展示牆」，把心力全部放在「怎麼正確打包、設定、上線」這件事本身。

> 💡 **給想知道更多背景的讀者**：`npm run dev` 啟動的開發伺服器，內部用的是瀏覽器原生的 ES Modules（`<script type="module">`）搭配 Vite 自己的 HMR（Hot Module Replacement，模組熱替換）協定，每個檔案幾乎是「即時、未打包」直接送給瀏覽器解析，這也是 Vite 開發伺服器啟動速度飛快的原因；但這種「一個檔案一個請求」的方式並不適合正式環境——正式站台的使用者可能網速不佳，瀏覽器需要下載數十甚至數百個未合併的檔案會拖慢首次載入速度，這正是為什麼需要另一套「打包」流程來產生正式版本。不熟悉模組系統細節也沒關係，只要記得一個原則：**`npm run dev` 是為了開發時「改了馬上看到」，`npm run build` 是為了正式環境「使用者載入越快越好」，兩者的最佳化方向完全不同，因此不能直接把開發伺服器當成正式站台使用。**

## 二、`npm run build` 到底做了什麼：認識 Vite 的正式建置

在 `day30-deploy-showcase` 專案資料夾執行：

```bash
npm run build
```

Vite 會呼叫底層的 Rollup（打包工具）進行建置，實際執行後會看到類似這樣的輸出（這是本篇範例實際建置的結果）：

```
vite v8.2.2 building client environment for production...
transforming...
✓ 89 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.69 kB │ gzip:  1.12 kB
dist/assets/index-BLGIz4VX.css    5.89 kB │ gzip:  1.79 kB
dist/assets/index-kZ3MNusZ.js   292.55 kB │ gzip: 93.67 kB

✓ built in 343ms
```

打包完成後，專案資料夾會多出一個 `dist/` 資料夾（`.gitignore` 一律會排除它——它是「建置產物」，不需要放進版本控制，每次部署前重新 `npm run build` 就能重新產生一份）。這個過程實際上做了四件事：

| 步驟 | 做了什麼 | 為什麼重要 |
| --- | --- | --- |
| **轉譯（Transform）** | 把 JSX、`import.meta.env` 這類語法轉換成瀏覽器看得懂的純 JavaScript | 瀏覽器原生不認識 JSX，一定要先轉換才能執行 |
| **Tree-shaking** | 分析程式碼的 `import`／`export` 關係，把「有 import 但實際上沒用到」的程式碼刪掉 | 沒用到的程式碼不需要讓使用者下載，減少檔案大小 |
| **程式碼分割（Code Splitting）** | 把程式碼拆成多個檔案（例如把很少變動的第三方套件跟自己寫的程式碼分開），瀏覽器可以個別快取 | 之後只改自己的程式碼時，使用者不需要重新下載沒變動的第三方套件 |
| **檔名加雜湊（Hash）** | 把檔案內容算出一組雜湊值（例如 `index-BLGIz4VX.js` 裡的 `BLGIz4VX`），當作檔名的一部分 | 只要檔案內容改變，雜湊值就會跟著變，瀏覽器／CDN 才知道「這是新檔案」該重新下載，而不會誤用瀏覽器裡的舊快取版本 |

> 🔍 **給想深入了解打包器運作原理的讀者**：Vite 在開發模式（`npm run dev`）用的是瀏覽器原生 ESM + esbuild（只做語法轉譯、不做完整打包，所以啟動極快）；但正式建置（`npm run build`）改用 Rollup，是因為 Rollup 對「靜態 `import`／`export`」的分析特別完整，能產出比較小、分割得比較細緻的正式檔案——這是刻意的取捨：開發時要「快」，正式環境要「小」，兩個階段用不同工具各自最佳化。不需要記住 Rollup 或 esbuild 的實作細節，只要知道**這一切都是 `npm run build` 這行指令自動幫你做完的，不需要手動設定任何打包規則**，這也是選擇 Vite 這類現代建置工具的主要好處。

實際打開 `dist/index.html`，會看到內容跟開發時的 `index.html` 差異很大：

```html
<script type="module" crossorigin src="/assets/index-kZ3MNusZ.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-BLGIz4VX.css">
```

開發時的 `index.html` 引用的是 `/src/main.jsx`（原始檔案，未打包）；正式建置後，變成引用 `dist/assets/` 底下這兩個雜湊檔名的檔案——這也直接關係到下一節要談的「部署到子路徑」問題：如果網站不是部署在網域的根目錄，這裡的 `/assets/...` 路徑就會抓錯位置，整頁變成空白。

## 三、環境變數管理：`.env` 系列檔案與 `import.meta.env`

### 1. Vite 的 `.env` 檔案家族

| 檔名 | 套用時機 | 本專案用途 |
| --- | --- | --- |
| `.env` | 所有模式都會套用（最基礎的預設值） | `VITE_APP_TITLE`、`VITE_GITHUB_REPO_URL`、`VITE_BASE_PATH` |
| `.env.development` | 只有 `npm run dev`（development 模式）套用，會覆蓋 `.env` 的同名變數 | `VITE_APP_ENV_LABEL=開發環境（本機 npm run dev）` |
| `.env.production` | 只有 `npm run build`（production 模式）套用，會覆蓋 `.env` 的同名變數 | `VITE_APP_ENV_LABEL=正式環境（npm run build 打包結果）` |
| `.env.local`／`.env.*.local` | 只在自己電腦上生效；`.gitignore` 內建的 `*.local` 規則會自動排除，不會被提交 | 本專案沒有建立，但這是放「這台電腦專屬、不該進版本控制」設定值的正確位置 |

實際內容（節錄自本專案）：

```bash
# .env（所有模式共用）
VITE_APP_TITLE=React 30 天學習筆記
VITE_GITHUB_REPO_URL=https://github.com/<your-github-account>/React_30Day_Note
VITE_BASE_PATH=/
```

```bash
# .env.development（只在 npm run dev 套用，覆蓋上面的預設值）
VITE_APP_ENV_LABEL=開發環境（本機 npm run dev）
```

```bash
# .env.production（只在 npm run build 套用，覆蓋上面的預設值）
VITE_APP_ENV_LABEL=正式環境（npm run build 打包結果）
```

### 2. `VITE_` 前綴規則與安全性

Vite 預設**只會**把檔名以 `VITE_` 開頭的變數打包進前端程式碼，讓 `import.meta.env.VITE_XXX` 讀得到；沒有這個前綴的變數，只有 `vite.config.js` 這類「建置時」在 Node.js 環境執行的腳本讀得到，不會出現在瀏覽器下載的任何檔案裡。

> ⚠️ **安全性警告：`VITE_` 開頭的變數會被打包進公開的 JavaScript 檔案，任何人打開瀏覽器開發者工具、或直接檢視 `dist/assets/*.js` 的原始碼都看得到明文內容。** 因此像 API 金鑰、資料庫密碼這類機密資料，**絕對不能**加上 `VITE_` 前綴放進 `.env`。真正需要用到機密資料的邏輯，必須寫在後端 API（例如 Day20、Day28 的 Express 伺服器）裡，前端只透過 API 呼叫取得結果，機密內容永遠不會出現在瀏覽器可以看到的任何檔案裡。

### 3. `import.meta.env`：程式碼裡怎麼讀環境變數

除了自訂的 `VITE_XXX` 變數，Vite 還內建了幾個隨時可以讀取的變數：

| 變數 | 說明 |
| --- | --- |
| `import.meta.env.MODE` | 目前的執行模式字串，例如 `"development"` 或 `"production"` |
| `import.meta.env.DEV` | 布林值，是否為開發模式（`npm run dev`） |
| `import.meta.env.PROD` | 布林值，是否為正式建置（`npm run build`） |
| `import.meta.env.BASE_URL` | 對照 `vite.config.js` 設定的 `base`（見第五節），本篇範例的 `router.jsx` 會直接用到這個值 |

本篇範例的 `AboutPage.jsx` 把這幾個值連同自訂變數一起即時印在畫面上：

```jsx
const ENV_ROWS = [
  { label: 'import.meta.env.MODE', value: import.meta.env.MODE, desc: '目前執行模式（development／production）' },
  { label: 'import.meta.env.DEV', value: String(import.meta.env.DEV), desc: '是否為開發模式（dev server）' },
  { label: 'import.meta.env.PROD', value: String(import.meta.env.PROD), desc: '是否為正式建置（build）' },
  { label: 'import.meta.env.BASE_URL', value: import.meta.env.BASE_URL, desc: '對照 vite.config.js 設定的 base 路徑' },
  { label: 'VITE_APP_TITLE', value: import.meta.env.VITE_APP_TITLE, desc: '來自 .env，所有模式共用' },
  { label: 'VITE_APP_ENV_LABEL', value: import.meta.env.VITE_APP_ENV_LABEL, desc: '來自 .env.development／.env.production，兩種模式的值不同' },
]
```

用 `npm run dev` 打開 `/about` 頁面看一次，再用 `npm run build` + `npm run preview` 打開一次，會發現 `MODE`／`DEV`／`PROD`／`VITE_APP_ENV_LABEL` 這幾欄的值完全不同——這比死記文件更容易記住「環境變數真的會因為執行的指令而改變」這件事。

## 四、靜態託管平台怎麼選

打包出來的 `dist/` 資料夾，內容從頭到尾只有 HTML／CSS／JS／圖片這些「靜態檔案」，不需要任何伺服器端程式語言執行環境，這代表可以放到任何「靜態網站託管」平台上。幾個最常見的免費選擇比較如下：

| 平台 | 免費方案 | 自訂網域 | Git 推送自動部署 | 內建 SPA Fallback | 特色 |
| --- | --- | --- | --- | --- | --- |
| **GitHub Pages** | ✅ 公開 repo 完全免費 | ✅ 支援 | 需自行設定 GitHub Actions，或用 `gh-pages` 套件手動推送 | ❌ 沒有，需自己實作 404.html 技巧（見第六節） | 跟 GitHub repo 綁在一起，最適合開源專案、學習作品集，本篇範例採用 |
| **Vercel** | ✅ 個人使用免費 | ✅ 支援 | ✅ 連上 GitHub repo 後自動偵測框架、自動部署 | ✅ 內建，SPA 直接可用 | 由 Next.js 團隊維護，對前端框架的支援度最完整 |
| **Netlify** | ✅ 個人使用免費 | ✅ 支援 | ✅ 連上 GitHub repo 後自動偵測、自動部署 | ✅ 內建（或用 `_redirects` 檔案手動設定） | 介面簡單、`_redirects`／`netlify.toml` 設定彈性高 |
| **Cloudflare Pages** | ✅ 個人使用免費 | ✅ 支援 | ✅ 連上 GitHub repo 後自動偵測、自動部署 | ✅ 內建 | 背後是 Cloudflare 全球 CDN，速度與流量額度都相當充足 |

可以發現 Vercel／Netlify／Cloudflare Pages 這幾個平台「開箱即用」，連 SPA 路由重新整理的問題都內建解決了，實務上要快速上線一個專案，這幾個平台通常更省事；但正因為它們把問題都處理掉了，反而少了一次搞懂「SPA 部署到靜態伺服器到底會遇到什麼問題」的機會。本篇選擇 **GitHub Pages** 當教學範例，正是因為它「什麼都不幫你做」——需要自己設定 `base`、自己解決 404 問題，走過一次之後，未來即使改用其他平台，也能清楚知道背後省略掉的步驟到底是什麼。

## 五、讓打包結果「找得到自己」：`vite.config.js` 的 `base` 設定

GitHub Pages 的「專案頁」（Project Page）預設會部署在 `https://帳號.github.io/repo名稱/` 這種**子路徑**下，而不是網域根目錄。如果打包出來的 `index.html` 裡，資源路徑寫死是 `/assets/index-xxx.js`（也就是從網域根目錄找），瀏覽器實際上會去 `https://帳號.github.io/assets/index-xxx.js` 找檔案——但檔案其實在 `https://帳號.github.io/repo名稱/assets/index-xxx.js`，結果就是整頁空白，開發者工具的 Network 分頁會看到一堆資源回傳 404。

解法是設定 Vite 的 `base` 選項，本篇範例的 `vite.config.js`：

```js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 這裡改用「函式形式」的 defineConfig，因為要讀取 .env 系列檔案裡的
// VITE_BASE_PATH，決定部署時的 base 路徑。vite.config.js 本身執行在
// Node.js 建置階段，不會經過 Vite 的用戶端轉譯，所以不能像元件程式碼
// 那樣直接寫 import.meta.env.VITE_BASE_PATH，必須改用 Vite 官方提供的
// loadEnv() 手動載入同一批 .env 檔案。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // base：打包後所有資源（.js／.css／圖片）的路徑前綴。
    // - 部署到 GitHub Pages「專案頁」時，必須設成 '/repo名稱/'，
    //   否則畫面會整個空白（開發者工具的 Network 分頁會看到 404）。
    // - 部署到 Vercel／Netlify，或 GitHub Pages 使用者頁時，維持 '/' 即可。
    base: env.VITE_BASE_PATH || '/',
  }
})
```

> 🔍 **為什麼不能直接寫 `import.meta.env.VITE_BASE_PATH`？** `import.meta.env` 是 Vite 在「轉譯用戶端程式碼」時才會注入的語法糖，只有 `.jsx`／`.js` 這種會被送進瀏覽器執行的檔案能用；但 `vite.config.js` 是設定檔本身，執行在 Node.js 建置階段，並不會經過這層轉譯。因此 Vite 額外提供 `loadEnv(mode, envDir, prefix)` 這個一般函式，讓設定檔可以「用手動的方式」讀取同一批 `.env` 檔案內容——兩者殊途同歸，只是用在不同執行環境。

實測（本篇範例已驗證）：`loadEnv` 除了讀 `.env*` 檔案，也會讀到真正的殼層環境變數覆蓋值，例如：

```bash
$env:VITE_BASE_PATH = "/test-repo/"
npm run build
Remove-Item Env:\VITE_BASE_PATH
```

執行後 `dist/index.html` 裡的資源路徑會正確變成 `/test-repo/assets/...`，代表無論是改 `.env.production`、或是在 CI 環境用環境變數覆蓋（第九節 GitHub Actions 就是這樣做的），Vite 都能正確讀到。

## 六、SPA 遇上 GitHub Pages：路由重新整理會 404 的經典問題

`base` 設定正確之後，首頁能正常打開了，但如果使用者**直接**在網址列輸入（或重新整理）一個像 `/days/5` 這種由 React Router 在瀏覽器端處理的路徑，會發生什麼事？

### 1. 問題根源：GitHub Pages 是純靜態伺服器

Day22 提過，React Router 的多頁面其實只有一份 `index.html`，`/days/5` 這種網址是瀏覽器端 JavaScript（History API）憑空「生出來」的，伺服器上根本沒有對應的實體檔案。開發時用 `vite preview` 或 `npm run dev` 都感覺不到問題，是因為這兩者背後的開發伺服器都內建「找不到檔案就自動回傳 `index.html`」的 SPA Fallback 機制；但 GitHub Pages 是純粹的靜態檔案伺服器，只認得實體路徑——使用者直接載入或重新整理 `/days/5` 時，GitHub Pages 找不到 `days/5/index.html` 這個檔案，就會回傳一個**真正的 HTTP 404**。

### 2. 解法：`spa-github-pages` 的重新導向技巧

本篇範例採用社群廣泛使用的開源解法（[rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages)，MIT License），原理是「借用 GitHub Pages 自訂 404 頁面的機制，把使用者導回首頁，再由前端程式碼把網址悄悄還原」，共分兩個檔案：

**`public/404.html`**（GitHub Pages 找不到實體檔案時，會回傳這支自訂 404 頁面）：

```html
<script type="text/javascript">
  // pathSegmentsToKeep：要保留幾層路徑當作「repo 名稱」。
  // - 部署到 GitHub Pages「專案頁」（帳號.github.io/repo名稱/）：設成 1。
  // - 部署到 GitHub Pages「使用者／組織頁」（帳號.github.io）：設成 0。
  var pathSegmentsToKeep = 1

  var l = window.location
  l.replace(
    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') +
      '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash,
  )
</script>
```

**`index.html`（`<head>` 內的還原腳本）**：

```html
<script type="text/javascript">
  ;(function (l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function (s) {
        return s.replace(/~and~/g, '&')
      }).join('?')
      window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash)
    }
  })(window.location)
</script>
```

完整流程如下：

1. 使用者直接在網址列輸入（或重新整理）`/days/5`。
2. GitHub Pages 找不到對應實體檔案，回傳 `404.html`。
3. `404.html` 的腳本把 `/days/5` 轉換成查詢字串格式（例如 `/?/days/5`），並導回網站根目錄。
4. 瀏覽器載入真正的 `index.html`；`<head>` 裡的還原腳本會在 React 掛載**之前**先執行，用 `history.replaceState` 把網址悄悄「還原」成 `/days/5`（畫面不會閃爍、網址列也不會出現查詢字串的痕跡）。
5. `main.jsx` 執行、`createBrowserRouter` 讀到正確的 `pathname`，正確渲染出 Day 5 的頁面。

> 💡 **想在部署前，先在本機驗證這個技巧有沒有生效？** 千萬別用 `npm run preview` 測試——`vite preview` 內建的伺服器一樣有 SPA Fallback，重新整理 `/days/5` 永遠會直接顯示正確頁面，**不會**重現 GitHub Pages 真正的 404 問題，等於白測。改用不內建 Fallback 的靜態伺服器，例如 `npx serve -l 5000 dist`（**不要**加 `-s`／`--single` 參數），才會真正回傳 404 並命中 `404.html`，準確模擬 GitHub Pages 的行為。本篇範例已經用這個方法實測過，詳見第十四節「驗證清單」。

## 七、React Router 的 `basename`：讓路由跟 `base` 保持同步

設定好 `vite.config.js` 的 `base` 之後，還有最後一塊拼圖：`router.jsx` 也要知道「這個 App 被放在網址的哪個子路徑下」，不然 `<Link>`／`<NavLink>` 產生的連結會對不上實際部署的路徑。本篇範例的 `router.jsx`：

```jsx
import { createBrowserRouter } from 'react-router'

export const router = createBrowserRouter(
  [
    { path: '/', element: <Layout><HomePage /></Layout> },
    { path: '/days/:dayNumber', element: <Layout><DayDetailPage /></Layout> },
    { path: '/about', element: <Layout><AboutPage /></Layout> },
    { path: '*', element: <Layout><NotFoundPage /></Layout> },
  ],
  { basename: import.meta.env.BASE_URL },
)
```

`import.meta.env.BASE_URL` 是 Vite 內建的環境變數（見第三節），值永遠等於 `vite.config.js` 設定的 `base`。這樣一來，`base` 跟 `basename` 只需要維護同一份設定（`VITE_BASE_PATH`），兩邊不會忘記同步——如果只改了 `base` 卻忘記給 `createBrowserRouter` 加上 `basename`，實際現象會是：首頁本身能正常打開，但點擊 `<Link to="/about">` 之後，React Router 比對到的路徑會是「整個網域下的 `/about`」，而不是「repo 子路徑底下的 `/about`」，導覽會失效或跳轉到錯誤網址。

## 八、手動部署：`gh-pages` npm 套件

`gh-pages` 是一個小工具，能把指定資料夾（這裡是 `dist/`）的內容直接推送到 Git repo 的 `gh-pages` 分支——GitHub Pages 可以設定成直接拿這個分支的內容當作網站內容。

本篇範例的 `package.json` 已經設定好對應指令：

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.3.0"
  }
}
```

`predeploy` 是 npm 的慣例命名（`npm run deploy` 執行前，npm 會自動先執行同名的 `pre` 開頭指令），所以只要執行一行指令：

```bash
npm run deploy
```

就會自動先 `npm run build` 產生最新的 `dist/`，再用 `gh-pages` 套件把整個 `dist/` 資料夾推上 `gh-pages` 分支。實際要讓網站上線，還需要：

1. 這個專案資料夾本身位於一個已經 `git init` 且設定好 GitHub remote（`git remote add origin ...`）的 repo。
2. 修改 `.env` 裡的 `VITE_GITHUB_REPO_URL`、`VITE_BASE_PATH` 為自己實際的 GitHub 帳號與 repo 名稱。
3. 到 GitHub repo 的 **Settings → Pages → Source**，選擇 `gh-pages` 分支、根目錄，儲存。
4. 等待約一分鐘，即可透過 `https://帳號.github.io/repo名稱/` 看到成果。

## 九、自動化部署：GitHub Actions CI/CD

手動部署每次都要記得下指令；如果希望「每次推送程式碼到 `main` 分支，就自動重新建置並上線」，可以改用 GitHub Actions。本篇範例附上一份參考設定 `.github/workflows/deploy.yml`：

```yaml
name: Deploy day30-deploy-showcase to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'Day30/examples/day30-deploy-showcase/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Day30/examples/day30-deploy-showcase
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: Day30/examples/day30-deploy-showcase/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          # 用 GitHub Actions 內建變數自動組出 base 路徑（/repo名稱/），
          # 不需要在 .env.production 裡手動寫死 repo 名稱。
          VITE_BASE_PATH: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: Day30/examples/day30-deploy-showcase/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

幾個重點：

- `permissions` 裡的 `pages: write`／`id-token: write` 是官方 `actions/deploy-pages` 這個動作要求的權限，缺少會直接部署失敗。
- `build` 階段的 `VITE_BASE_PATH` 直接用 `${{ github.event.repository.name }}` 動態組出來，不必手動維護 `.env.production`，也不怕忘記跟實際 repo 名稱同步。
- `paths` 限定只有這個範例資料夾內的檔案變動才會觸發部署，避免改了 `Books/` 裡其他天的內容也跟著誤觸發。

> ⚠️ **重要（monorepo 特有的注意事項）**：GitHub Actions 只會讀取「repository 根目錄」底下的 `.github/workflows/*.yml`。本篇範例整個資料夾放在 `Books/Day30/examples/day30-deploy-showcase/` 裡，如果要讓這份 workflow 真正生效，必須把它「搬到」`Books/` 這個 git repo 根目錄的 `.github/workflows/` 下（保留上面的 `working-directory` 設定），Actions 才抓得到它；同時要到 repo 設定的 **Settings → Pages → Source** 選擇 "GitHub Actions"（而不是「Deploy from a branch」）。

手動部署（第八節）跟自動化部署（本節）該怎麼選？單人練習、想立刻看到結果，用 `npm run deploy` 最快；多人協作、或希望「養成推送程式碼就是唯一部署動作」的習慣，GitHub Actions 更適合——這也是目前業界專案的主流做法。

## 十、今日範例：`day30-deploy-showcase`

### 1. 為什麼今天的範例沒有後端 API

Day20、Day28 的範例都搭配了 Node.js/Express 後端；但今天的主題是「部署到靜態託管平台」，GitHub Pages／Vercel／Netlify 這類平台本質上只能存放靜態檔案，沒辦法常駐執行一個 Node.js 伺服器。因此最貼近實際情境的做法，就是選一個「純前端也能完整運作」的題材：把 30 天課程資料直接寫成 `src/data/learningDays.js` 陣列打包進前端程式碼，搭配 `localStorage` 保存複習進度，完全不需要後端 API。

### 2. 專案結構

```
day30-deploy-showcase/
├── .env / .env.development / .env.production   # 第三節：環境變數
├── .github/workflows/deploy.yml                 # 第九節：GitHub Actions
├── index.html                                    # 還原網址腳本（第六節）
├── public/404.html                               # SPA 404 重新導向（第六節）
├── vite.config.js                                # base 設定（第五節）
├── package.json                                  # predeploy／deploy 指令（第八節）
└── src/
    ├── data/learningDays.js     # 30 天課程資料 + buildDayReadmeUrl()
    ├── hooks/useLocalStorage.js # 沿用 Day13／21／22，保存複習進度
    ├── components/
    │   ├── NavBar.jsx           # 首頁／關於 兩個導覽連結
    │   └── Layout.jsx           # 共用外殼（NavBar + Footer）
    ├── pages/
    │   ├── HomePage.jsx         # 依週次分組列出 30 天 + 進度條
    │   ├── DayDetailPage.jsx    # /days/:dayNumber，上一天／下一天導覽
    │   ├── AboutPage.jsx        # 技術棧 + 即時環境變數表格
    │   └── NotFoundPage.jsx     # 萬用路由 404 頁面
    └── router.jsx                # basename 設定（第七節）
```

### 3. 首頁：分組列表 + 進度追蹤

`HomePage.jsx` 用 `reduce` 把 30 天資料依 `week` 欄位分組，並用 `useLocalStorage('day30-progress', {})` 記錄「哪些天數已勾選為已回顧」：

```jsx
function groupByWeek(days) {
  return days.reduce((groups, item) => {
    const list = groups[item.week] ?? []
    list.push(item)
    groups[item.week] = list
    return groups
  }, {})
}

function HomePage() {
  const [progress, setProgress] = useLocalStorage('day30-progress', {})
  const completedCount = Object.values(progress).filter(Boolean).length
  const percent = Math.round((completedCount / learningDays.length) * 100)

  function toggleDay(day) {
    setProgress((prev) => ({ ...prev, [day]: !prev[day] }))
  }
  // ...依 grouped 渲染每週的 day-card，每張卡片都有勾選框與連到詳情頁的標題
}
```

進度只存在瀏覽器的 `localStorage`，重新整理頁面、切到詳情頁再切回來都不會遺失，但**不會**跨裝置或跨瀏覽器同步——這是刻意的設計範圍，跟 Day28 購物車「重新整理後預期會清空」是類似的取捨說明方式。

### 4. 詳情頁：動態路由 + 環境變數組出的外部連結

`DayDetailPage.jsx` 用 Day23 教過的 `useParams()` 取出網址上的 `:dayNumber`，並用 `buildDayReadmeUrl()` 組出連到 GitHub 上該天教學文件的連結：

```js
export function buildDayReadmeUrl(day) {
  const repoUrl = (import.meta.env.VITE_GITHUB_REPO_URL || '').replace(/\/+$/, '')
  return `${repoUrl}/blob/main/Books/Day${formatDayNumber(day)}/README.md`
}
```

這是第三節「環境變數」的具體應用：同一份打包結果，只要 `.env` 裡的 `VITE_GITHUB_REPO_URL` 換成不同帳號，連結就會自動指向正確位置，不需要改任何一行 JavaScript 程式碼。找不到對應天數時（例如網址被手動改成 `/days/999`），頁面不會整個跳轉到 404，而是用 Day06 教過的條件渲染，在同一個頁面顯示「找不到 Day 999」的提示，並保留連回首頁的按鈕。

### 5. 關於頁：把環境變數「秀出來」

`AboutPage.jsx` 把技術棧列表與 `import.meta.env` 的即時值都印在畫面上（見第三節程式碼），讓讀者不需要打開 DevTools，就能直接在畫面上比較 `npm run dev` 與 `npm run build` + `npm run preview` 兩種情境下環境變數的差異。

## 十一、撰寫一份「像樣」的專案 README

專案的 `README.md` 是軟體專案的說明書與門面。當大家打開專案或點進 GitHub 頁面時，第一眼就會看到它。它能用來快速介紹專案的目的、安裝方法、使用方式與貢獻規則。

### README 的主要內容

- **專案概述**：說明這是在做什麼、解決什麼問題、使用什麼語言。
- **安裝步驟**：告訴大家如何下載、設定環境與安裝需要的套件。
- **使用說明**：提供簡單的程式碼範例或操作截圖。
- **其他資訊**：包含版權聲明、常見問題或聯絡方式。

本篇範例的 [`examples/day30-deploy-showcase/README.md`](examples/day30-deploy-showcase/README.md) 本身就是這份的示範，段落結構可以參考或直接套用到自己未來的任何專案：

| 段落                  | 內容                                         | 目的                                             |
|-----------------------|----------------------------------------------|--------------------------------------------------|
| 專案簡介              | 一兩句話說明這是什麼、解決什麼問題           | 讓別人 10 秒內知道要不要繼續往下看               |
| 技術棧（表格）        | 前端框架、建置工具、路由、狀態管理、部署方式 | 面試官／協作者快速掃過技術範圍                   |
| 功能列表（checklist） | 逐條列出實際做到的功能                       | 比一段流水帳文字更容易掃視                       |
| 本機執行方式          | `npm install` + `npm run dev`                | 別人要接手或參考程式碼時，馬上知道怎麼跑起來     |
| 建置與預覽            | `npm run build` + `npm run preview`          | 說明怎麼產生、預覽正式版本                       |
| 部署到 GitHub Pages   | 環境變數要改哪裡、手動／自動部署二選一的步驟 | 讓別人（或未來的自己）能重複部署流程             |
| 學習心得              | 這個專案讓自己學到、卡關過的地方             | 對面試或求職特別有幫助，展現思考過程而不只是成果 |

撰寫時建議掌握一個原則：**假設讀者只有 5 分鐘，且完全不認識你**——技術棧用表格而不是長段落、功能用打勾清單而不是流水帳，是為了讓對方能「掃視」而不是「精讀」就抓到重點。

## 十二、常見陷阱整理

| 陷阱 | 說明 | 正確理解 |
| --- | --- | --- |
| 部署到 GitHub Pages 專案頁後整頁空白，Console 出現一堆資源 404 | `vite.config.js` 的 `base` 沒設定或設錯 | 必須設成 `/repo名稱/`（注意前後都要有斜線，且大小寫要跟實際 repo 名稱一致） |
| `base` 設定正確，但點擊站內連結後畫面跳轉錯誤或空白 | 忘記幫 `createBrowserRouter` 加上 `basename` | 用 `import.meta.env.BASE_URL` 讓 React Router 跟 `base` 保持同步（見第七節） |
| 首次部署一切正常，但重新整理某個子頁面、或直接分享連結給別人打開變成 GitHub 404 | GitHub Pages 沒有內建 SPA Fallback | 需要 `public/404.html` + `index.html` 還原腳本（見第六節） |
| 用 `npm run preview` 測試 404.html 的效果，怎麼測都是正常畫面 | `vite preview` 內建 SPA Fallback，跟 GitHub Pages 的真實行為不同，反而掩蓋了問題 | 改用 `npx serve -l 5000 dist`（不加 `-s`）在本機更真實模擬 |
| 把 API 金鑰、密碼寫進 `.env` 並加上 `VITE_` 前綴 | 前端 bundle 內容完全公開，等於把機密資料公告天下 | 機密資料只能放在後端環境變數，前端一律透過 API 呼叫取得結果 |
| 以為 `.env.production` 的值只有部署後才會生效 | 搞混「模式（mode）」跟「有沒有部署」的關係 | `npm run dev` 對應 `development` 模式、`npm run build`／`npm run preview` 對應 `production` 模式，在本機執行 `npm run build` 就已經套用 `.env.production` |
| `npm run deploy` 執行後，GitHub Pages 網站還是顯示舊內容或 404 | Repo 的 **Settings => Pages => Source** 沒有指向正確的分支（`gh-pages`）或資料夾 | 手動部署要確認來源設定為 `gh-pages` 分支；用 GitHub Actions 部署則要選 "GitHub Actions" |
| GitHub Actions 設定了 `deploy.yml` 卻完全沒有觸發 | Workflow 檔案放在範例資料夾裡，而不是 repo 根目錄的 `.github/workflows/` | GitHub 只讀取 repo 根目錄下的 `.github/workflows/*.yml`，monorepo 情境要搬到最外層 |

## 十三、如何在本機執行範例

這個範例沒有後端 API，只需要一個終端機視窗：

```bash
cd Books/Day30/examples/day30-deploy-showcase
npm install

npm run dev        # 開發伺服器：http://localhost:5173
npm run build       # 打包正式版本，產出 dist/
npm run preview     # 預覽打包後的結果：http://localhost:4173
npm run lint         # oxlint 靜態分析

# 想更真實模擬 GitHub Pages（沒有 SPA Fallback）的行為，
# 可以改用不內建 Fallback 的靜態伺服器（見第六節）：
npx serve -l 5000 dist

# 部署（需要這個資料夾本身位於已設定 GitHub remote 的 git repo）：
npm run deploy
```

## 十五、30 天學習旅程回顧

走到這裡，30 天學習正式告一段落：第一週打好 JSX／元件／State／事件的基礎，第二週學會 Hooks 核心與表單處理，第三週深入效能優化與 React 19 新特性、練出一套自訂 Hook 函式庫，第四週用 React Router 串起多頁面、Redux Toolkit 管理全域狀態，做出一個完整的電商購物車 App，收尾週則補上程式碼品質、測試與今天的部署上線——從「寫得出來」到「能穩定上線給別人使用」，最後這兩天補的正是這段差距。

如果想繼續往下走，也整理了幾個延伸方向：TypeScript（型別安全的元件與 Hooks）、Server-Side Rendering／Next.js（SEO 與首屏效能）、React Query／TanStack Query（更完整的伺服器資料快取方案）、Storybook／Tailwind CSS 這類元件庫與設計系統，以及效能監控與無障礙（a11y）的深化——這些都建立在這 30 天打下的基礎之上，不需要從頭再學一次 React。

## 十六、延伸閱讀

- [Vite 官方文件：Building for Production](https://vite.dev/guide/build.html)
- [Vite 官方文件：Env Variables and Modes](https://vite.dev/guide/env-and-mode.html)
- [GitHub Pages 官方文件](https://docs.github.com/pages)
- [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages)（MIT License，本篇第六節 SPA 404 解法的原始出處）
- [gh-pages npm 套件文件](https://www.npmjs.com/package/gh-pages)
- [GitHub Actions：official actions/deploy-pages](https://github.com/actions/deploy-pages)
- [Vercel 官方文件](https://vercel.com/docs)、[Netlify 官方文件](https://docs.netlify.com/)、[Cloudflare Pages 官方文件](https://developers.cloudflare.com/pages/)
