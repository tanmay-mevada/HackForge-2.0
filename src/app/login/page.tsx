'use client'

import { useActionState } from 'react'
import { LogIn } from 'lucide-react'
import { login } from '@/app/auth/actions'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, { error: '' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          </div>
          
          {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium text-sm">{state.error}</p>
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input 
                id="email"
                name="email" 
                type="email" 
                placeholder="you@example.com"
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                id="password"
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <p className="text-center text-slate-600 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
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