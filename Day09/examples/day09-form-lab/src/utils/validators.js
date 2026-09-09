// Day09 表單驗證工具函式
// 統一放在這裡，讓 RegisterForm.jsx 只需要呼叫 validateRegisterForm(formData)，
// 就能拿到一份「欄位名稱 -> 錯誤訊息」的物件，不用把驗證邏輯散落在元件裡。

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 居住城市、性別下拉選單的選項，讓 RegisterForm.jsx 與驗證邏輯共用同一份清單，
// 避免「選項清單」跟「合法值判斷」分散在兩個地方、日後改選項時漏改。
export const GENDER_OPTIONS = [
  { value: 'female', label: '女性' },
  { value: 'male', label: '男性' },
  { value: 'other', label: '不透露 / 其他' },
]

export const CITY_OPTIONS = [
  { value: 'taipei', label: '臺北市' },
  { value: 'new-taipei', label: '新北市' },
  { value: 'taoyuan', label: '桃園市' },
  { value: 'taichung', label: '臺中市' },
  { value: 'tainan', label: '臺南市' },
  { value: 'kaohsiung', label: '高雄市' },
  { value: 'other', label: '其他縣市' },
]

// 初始表單狀態：單一 state 物件，所有欄位集中管理。
export const initialRegisterFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '',
  city: '',
  subscribeNewsletter: false,
}

/**
 * 驗證會員註冊表單，回傳「欄位名稱 -> 錯誤訊息」的物件。
 * 沒有錯誤的欄位不會出現在回傳物件的 key 裡，
 * 所以只要 Object.keys(errors).length === 0，就代表全部欄位都通過驗證。
 */
export function validateRegisterForm(formData) {
  const errors = {}

  if (!formData.name.trim()) {
    errors.name = '請輸入姓名'
  }

  if (!formData.email.trim()) {
    errors.email = '請輸入 Email'
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    errors.email = 'Email 格式不正確，請確認是否包含 @ 與網域'
  }

  if (!formData.password) {
    errors.password = '請輸入密碼'
  } else if (formData.password.length < 8) {
    errors.password = '密碼長度至少需要 8 個字元'
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = '請再輸入一次密碼'
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
  }

  if (!formData.gender) {
    errors.gender = '請選擇性別'
  }

  if (!formData.city) {
    errors.city = '請選擇居住城市'
  }

  return errors
}
