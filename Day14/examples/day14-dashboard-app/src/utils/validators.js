// validators.js：延續 Day09 的做法，把「欄位驗證邏輯」集中放在這裡，
// 元件只需要呼叫 validateXxxForm(formData)，就能拿到一份「欄位名稱 -> 錯誤訊息」的物件，
// 沒有錯誤的欄位不會出現在回傳物件裡，Object.keys(errors).length === 0 代表全部通過。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9()+\-\s]{7,}$/

export const PRIORITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

export const initialTaskFormData = {
  title: '',
  priority: 'medium',
}

export function validateTaskForm(formData) {
  const errors = {}

  if (!formData.title.trim()) {
    errors.title = '請輸入任務名稱'
  }

  return errors
}

export const initialContactFormData = {
  name: '',
  email: '',
  phone: '',
}

export function validateContactForm(formData) {
  const errors = {}

  if (!formData.name.trim()) {
    errors.name = '請輸入姓名'
  }

  if (!formData.email.trim()) {
    errors.email = '請輸入 Email'
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    errors.email = 'Email 格式不正確，請確認是否包含 @ 與網域'
  }

  if (formData.phone.trim() && !PHONE_PATTERN.test(formData.phone.trim())) {
    errors.phone = '電話格式不正確，請只輸入數字、空白或 -()+ 符號'
  }

  return errors
}

export const initialNoteFormData = {
  title: '',
  content: '',
}

export function validateNoteForm(formData) {
  const errors = {}

  if (!formData.title.trim()) {
    errors.title = '請輸入筆記標題'
  }

  if (!formData.content.trim()) {
    errors.content = '請輸入筆記內容'
  }

  return errors
}
