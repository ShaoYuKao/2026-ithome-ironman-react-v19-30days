const FIRST_NAMES = [
  '志明',
  '春嬌',
  '雅婷',
  '家豪',
  '怡君',
  '建宏',
  '淑芬',
  '俊傑',
  '佳穎',
  '柏宇',
]
const LAST_NAMES = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊']
const CITIES = [
  '台北市',
  '新北市',
  '桃園市',
  '台中市',
  '台南市',
  '高雄市',
  '新竹市',
  '基隆市',
]
const DEPARTMENTS = ['業務部', '技術部', '行銷部', '財務部', '人資部', '客服部']

/**
 * 產生指定數量的假聯絡人資料，模擬「一份大型通訊錄」的情境。
 * 跟 Day15 的 generateProducts 一樣，只會在 TransitionDeferredLab
 * 掛載時被呼叫「一次」（搭配 useState 的惰性初始化），
 * 避免每次重新渲染都重新產生一份新的假資料。
 */
export function generateContacts(count) {
  const contacts = []
  for (let i = 0; i < count; i++) {
    const lastName = LAST_NAMES[i % LAST_NAMES.length]
    const firstName = FIRST_NAMES[(i * 3 + 1) % FIRST_NAMES.length]
    const city = CITIES[i % CITIES.length]
    const department = DEPARTMENTS[(i * 5 + 2) % DEPARTMENTS.length]
    contacts.push({
      id: i + 1,
      name: `${lastName}${firstName}`,
      email: `user${String(i + 1).padStart(5, '0')}@example.com`,
      city,
      department,
      note: `${city} ${department} 第 ${i + 1} 號聯絡人`,
    })
  }
  return contacts
}
