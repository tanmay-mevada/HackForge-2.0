'use client'

import { useActionState } from 'react'
import { login } from '@/app/auth/actions'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, { error: '' })

  return (
    <form action={action} className="flex flex-col gap-4 p-4 max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold">Welcome Back</h1>
      
      {state?.error && (
        <p className="bg-red-100 text-red-600 p-2 rounded text-sm">{state.error}</p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email">Email</label>
        <input 
          id="email"
          name="email" 
          type="email" 
          required 
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password">Password</label>
        <input 
          id="password"
          name="password" 
          type="password" 
          required 
          className="border p-2 rounded"
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition disabled:opacity-50"
      >
        {isPending ? 'Logging in...' : 'Log In'}
      </button>
      
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-blue-600 font-semibold hover:underline">
          Sign Up
        </a>
      </p>
    </form>
  )
}