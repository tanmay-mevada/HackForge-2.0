'use client' // <--- Required for hooks

import { useActionState } from 'react' // React 19 hook (formerly useFormState)
import { signup } from '@/app/auth/actions'

export default function SignupPage() {
  // state contains the return value from your action (e.g., error messages)
  // isPending tells you if the form is currently submitting
  const [state, action, isPending] = useActionState(signup, { error: null as string | null, success: false })

  return (
    <form action={action} className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Create Account</h1>
      
      {/* Show Error Message if exists */}
      {state.error && (
        <p className="bg-red-100 text-red-600 p-2 rounded">{state.error}</p>
      )}

      <input name="email" type="email" placeholder="Email" required className="border p-2" />
      <input name="password" type="password" placeholder="Password" required className="border p-2" />
      <input name="full_name" type="text" placeholder="Full Name" required className="border p-2" />
      <input name="phone" type="tel" placeholder="Phone Number" className="border p-2" />
      
      <select name="role" required className="border p-2">
        <option value="student">Student</option>
        <option value="shopkeeper">Shopkeeper</option>
      </select>

      <button 
        type="submit" 
        disabled={isPending}
        className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {isPending ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  )
}