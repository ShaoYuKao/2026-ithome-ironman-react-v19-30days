// Day18 表單驗證工具函式。
// 刻意沿用 Day09 examples/day09-form-lab/src/utils/validators.js 幾乎一模一樣的邏輯，
// 呼應「用 useActionState 重寫 Day9 註冊表單」這個練習目標——欄位驗證規則本身沒有變，
// 改變的只是「這段邏輯現在被誰呼叫、什麼時候呼叫」。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

/**
 * 驗證會員註冊表單，回傳「欄位名稱 -> 錯誤訊息」的物件。
 * 這段是「不需要問伺服器就能立刻判斷」的快速檢查，會在 registerAction 裡
 * 先同步跑一次；沒問題才會接著送出真正的網路請求（見 RegistrationForm.jsx）。
 */
export function validateRegisterForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = '請輸入姓名'
  }

  if (!values.email.trim()) {
    errors.email = '請輸入 Email'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Email 格式不正確，請確認是否包含 @ 與網域'
  }

  if (!values.password) {
    errors.password = '請輸入密碼'
  } else if (values.password.length < 8) {
    errors.password = '密碼長度至少需要 8 個字元'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = '請再輸入一次密碼'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
  }

  if (!values.gender) {
    errors.gender = '請選擇性別'
  }

  if (!values.city) {
    errors.city = '請選擇居住城市'
  }

  return errors
}
