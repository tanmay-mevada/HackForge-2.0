'use client'

import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
'use client' // <--- Required for hooks

import { useActionState } from 'react' // React 19 hook (formerly useFormState)
// Ensure that 'signup' is exported from '@/app/auth/actions'
import { signup } from '@/app/auth/actions'

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, { error: '', success: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          </div>
          
          {state.error && (
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

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input 
                id="full_name"
                name="full_name" 
                type="text" 
                placeholder="John Doe"
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input 
                id="phone"
                name="phone" 
                type="tel" 
                placeholder="+91 9876543210"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
              <select 
                id="role"
                name="role" 
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="student">Student</option>
                <option value="shopkeeper">Shopkeeper</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="text-center text-slate-600 text-sm mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
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