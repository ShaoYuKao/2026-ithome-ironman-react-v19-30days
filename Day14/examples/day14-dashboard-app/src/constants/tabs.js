// TABS：整個 App 只有這一份分頁清單，TabBar（顯示按鈕）與 TabPanel（決定渲染哪個面板）
// 都從這裡讀取，避免「分頁有哪些」這件事分散在兩個地方、日後新增/刪除分頁時漏改。
export const TABS = [
  { id: 'tasks', label: '任務', icon: '✅' },
  { id: 'contacts', label: '聯絡人', icon: '👤' },
  { id: 'notes', label: '筆記', icon: '📝' },
]
