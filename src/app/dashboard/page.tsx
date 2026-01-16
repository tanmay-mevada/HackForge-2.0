import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/logout-button'

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Get the Auth User
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch your custom profile data
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HackForge Dashboard</h1>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome, {userProfile?.full_name || 'User'}!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Email</p>
              <p className="text-lg text-gray-900 dark:text-white mt-2">{user.email}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Role</p>
              <p className="text-lg text-gray-900 dark:text-white mt-2 capitalize">{userProfile?.role || 'Not specified'}</p>
            </div>
            
            {userProfile?.phone && (
              <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Phone</p>
                <p className="text-lg text-gray-900 dark:text-white mt-2">{userProfile.phone}</p>
              </div>
            )}
            
            <div className="bg-orange-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Member Since</p>
              <p className="text-lg text-gray-900 dark:text-white mt-2">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow">
              Create Project
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow">
              Browse Projects
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow">
              View Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}