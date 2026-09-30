# Day30 部署展示：30 天學習歷程展示牆

> 這份 README 本身就是「Day30 產出」要求的範例：一份能讓別人（面試官、其他學習者）
> 5 分鐘內看懂「這是什麼、用了什麼技術、我學到什麼」的專案說明文件。
> 部署自己的作品時，建議直接照抄這份 README 的段落結構，把內容換成自己的專案。

## 專案簡介

把 [`plan03.md`](../../../../plan03.md) 規劃的 30 天 React 學習課程，做成一個可以打包、
部署到任何靜態託管平台的小型 SPA：

- 依「週次」分組列出全部 30 天的主題，可以勾選「已回顧」記錄複習進度（存在瀏覽器 `localStorage`，
  重新整理頁面、關閉分頁後再打開都不會遺失）。
- 每一天都有獨立的詳情頁（`/days/:dayNumber`），提供上一天／下一天導覽，
  並附上直接連到 GitHub 上完整教學文件的連結。
- 「關於這個專案」頁面即時顯示目前套用的環境變數與建置資訊，
  用 `npm run dev` 和 `npm run build` + `npm run preview` 分別打開會看到不同的值。

**線上預覽**：`<部署完成後，把 GitHub Pages / Vercel / Netlify 的網址貼在這裡>`

## 技術棧

| 類別 | 使用技術 |
| --- | --- |
| 前端框架 | React 19 |
| 建置工具 | Vite 8（開發伺服器、正式建置、環境變數管理） |
| 路由 | React Router 8（`createBrowserRouter` + `basename`） |
| 狀態持久化 | 自訂 Hook `useLocalStorage` |
| 程式碼品質 | oxlint |
| 部署 | GitHub Pages（`gh-pages` 套件 手動部署 ／ GitHub Actions 自動部署二選一） |

## 功能列表

- [x] 依週次分組顯示 30 天課程主題
- [x] 勾選「已回顧」並持久化進度（`localStorage`）
- [x] 進度條即時顯示完成百分比
- [x] 每日詳情頁（動態路由）+ 上一天／下一天導覽
- [x] 連結到 GitHub 上對應天數的完整教學文件（由環境變數組成）
- [x] 「關於」頁面展示環境變數與建置模式差異
- [x] 404 找不到頁面
- [x] 支援部署到 GitHub Pages 子路徑（`base` + React Router `basename`）
- [x] SPA 用戶端路由的 GitHub Pages 404 重新整理問題（`public/404.html`）

## 本機執行方式

```powershell
npm install
npm run dev       # http://localhost:5173
```

## 建置與預覽

```powershell
npm run build      # 產出 dist/
npm run preview     # 用正式建置結果本機預覽，http://localhost:4173
```

## 部署到 GitHub Pages

1. 修改 `.env` 裡的 `VITE_GITHUB_REPO_URL` 為自己的 GitHub 帳號與 repo 名稱。
2. 依照部署目標調整 `VITE_BASE_PATH`（GitHub Pages 專案頁需要 `/repo名稱/`）。
3. 方式一（手動）：`npm run deploy`（內部會先 `npm run build`，再用 `gh-pages` 套件把
   `dist/` 推上 `gh-pages` 分支），需要這個資料夾本身位於一個已設定 GitHub remote 的 git repo。
4. 方式二（自動化）：把 `.github/workflows/deploy.yml` 放到 repo 根目錄的
   `.github/workflows/` 下，推送到 `main` 分支後由 GitHub Actions 自動建置並部署，
   記得到 repo 設定的 **Settings → Pages → Source** 選擇 "GitHub Actions"。

完整說明請見教學文件：[`Books/Day30/README.md`](../../README.md)。

## 學習心得（範例，請換成自己的內容）

30 天走完 React 的基礎、Hooks、效能優化、路由與 Redux Toolkit 全域狀態管理，
最大的收穫是理解「元件、狀態、副作用」這三個概念是怎麼互相搭配運作的；
最後這兩天（Day29 測試、Day30 部署）補上品質與上線流程，才真正體會到
「寫得出來」跟「能穩定上線給別人使用」中間還有一段距離——環境變數、
`base` 路徑、SPA 路由在靜態託管上的行為，都是實際部署後才會踩到的細節。
