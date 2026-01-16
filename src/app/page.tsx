import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center gap-8 p-8 text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          Welcome to HackForge
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Your ultimate platform for creating, sharing, and collaborating on amazing projects.
        </p>
        <div className="flex gap-4 mt-6">
          <Link
            href="/signup"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Log In
          </Link>
        </div>
      </main>
    </div>
  )
}
