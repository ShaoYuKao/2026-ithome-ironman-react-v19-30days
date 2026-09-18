import { useFormStatus } from 'react-dom'

/**
 * SubmitButton：故意獨立成一個元件，而不是直接寫在 RegistrationForm／
 * CommentBoard 裡面——這是使用 useFormStatus 的必要條件：它只看得到
 * 「父層 <form>」的提交狀態，父層 <form> 指的是在 React 元素樹上包住它的
 * <form>，所以呼叫 useFormStatus() 的元件，必須是被渲染在 <form> 標籤
 * 「裡面」的一個獨立元件實例，而不能是渲染出 <form> 標籤的那個元件本身。
 *
 * 只要它被放在某個 <form action={...}> 裡面，不管那個 action 是不是用
 * useActionState 包出來的，都能正確讀到 pending 狀態——這也是本檔案能被
 * RegistrationForm、CommentBoard 兩個 Demo 共用的原因。
 */
function SubmitButton({ children, pendingLabel = '送出中...' }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn btn--primary" disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  )
}

export default SubmitButton
