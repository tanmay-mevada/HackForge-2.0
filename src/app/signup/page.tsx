'use client' // <--- Required for hooks

import { useActionState } from 'react' // React 19 hook (formerly useFormState)
// Ensure that 'signup' is exported from '@/app/auth/actions'
import { signup } from '@/app/auth/actions'

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, { error: '', success: false })

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
        className="bg-blue-600 text-white p-2 rounded disabled:opacity-50 hover:bg-blue-700 transition"
      >
        {isPending ? 'Creating Account...' : 'Sign Up'}
      </button>
      
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 font-semibold hover:underline">
          Log In
        </a>
      </p>
    </form>
  )
}