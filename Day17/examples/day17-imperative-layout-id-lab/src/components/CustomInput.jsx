import { forwardRef, useId, useImperativeHandle, useRef } from 'react'

/**
 * CustomInput：一個「看起來」只是 label + input + 錯誤訊息的欄位元件，
 * 但額外用 useImperativeHandle 暴露 focus()／clear()／getValue()／shake()
 * 四個方法，讓拿著 ref 的父層元件可以在需要的時候「命令式」呼叫它們，
 * 而不需要知道這個元件內部到底用了哪個 DOM 節點、結構長怎樣。
 *
 * 對照 Hook_Info/Hook.md「三、Ref Hooks」：
 * 「自訂父元件透過 ref 取得子元件時所暴露的 instance 內容，
 *   可隱藏內部實作細節、只暴露必要方法」。
 */
const CustomInput = forwardRef(function CustomInput(
  { label, hint, error, type = 'text', ...inputProps },
  ref,
) {
  // 內部仍然用 useRef 拿到真正的 DOM 節點，這是 useImperativeHandle
  // 唯一能操作 DOM 的管道——它只是換了一層「對外暴露什麼」的包裝。
  const inputRef = useRef(null)

  // 用 useId 產生這個元件「這一個實例」專屬的 id，
  // 讓 label 的 htmlFor 永遠精準對應到自己的 input，
  // 即使 RegistrationForm 之外還有別的地方重複使用 CustomInput 也不會撞名。
  const inputId = useId()
  const hintId = useId()
  const errorId = useId()

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        inputRef.current?.focus()
      },
      clear() {
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      },
      getValue() {
        return inputRef.current?.value ?? ''
      },
      // 額外暴露一個「抖動」的命令式動作：驗證失敗時用來吸引使用者注意，
      // 純粹是操作 DOM 的 class（動畫效果），完全不透過 state／CSS 條件渲染。
      shake() {
        const node = inputRef.current
        if (!node) return
        node.classList.remove('shake')
        // 強制觸發一次 reflow，讓同一個 class 可以連續加上去都還能重新播放動畫。
        // eslint-disable-next-line no-unused-expressions
        void node.offsetWidth
        node.classList.add('shake')
      },
    }),
    // 空依賴陣列：這個 handle 物件裡的每個方法都只透過 inputRef.current
    // 讀取「當下最新」的 DOM 節點，不依賴任何會隨渲染改變的外部變數，
    // 所以不需要因為任何 props／state 改變就重新建立這個物件。
    [],
  )

  const describedBy =
    [hint && !error ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className="field">
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input
        {...inputProps}
        id={inputId}
        ref={inputRef}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={error ? 'field-input field-input--error' : 'field-input'}
      />
      {hint && !error && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

export default CustomInput
