import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/logout-button'
import { UploadCloud, User, Mail, Shield, Calendar, Printer } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Welcome, {userProfile?.full_name || 'User'}!</h2>
          <p className="text-slate-600">Manage your printing orders and account settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Quick Action Button */}
          <Link href="/upload" className="block">
            <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div className="bg-white/20 p-3 rounded-lg w-fit mb-4 group-hover:bg-white/30 transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Document</h3>
              <p className="text-blue-100 text-sm">Start printing now</p>
            </div>
          </Link>

          {/* Stats Card 1 */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="bg-amber-50 p-3 rounded-lg w-fit mb-4">
              <Printer className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">Total Prints</h3>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-slate-500 text-xs mt-2">No orders yet</p>
          </div>

          {/* Stats Card 2 */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="bg-green-50 p-3 rounded-lg w-fit mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">Account Status</h3>
            <p className="text-2xl font-bold text-slate-900">Active</p>
            <p className="text-slate-500 text-xs mt-2">All systems operational</p>
          </div>

        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" /> 
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-slate-600 font-semibold mb-1">Full Name</p>
              <p className="text-lg font-bold text-slate-900">{userProfile?.full_name || 'Not provided'}</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-600 font-semibold mb-1">Email Address</p>
              </div>
              <p className="text-lg font-bold text-slate-900 break-all">{user.email}</p>
              {/* hey */}
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-slate-600 font-semibold mb-1">Role</p>
              <p className="text-lg font-bold text-slate-900 capitalize">{userProfile?.role || 'Not specified'}</p>
            </div>

            {userProfile?.phone && (
              <div className="border-l-4 border-blue-600 pl-6">
                <p className="text-sm text-slate-600 font-semibold mb-1">Phone Number</p>
                <p className="text-lg font-bold text-slate-900">{userProfile.phone}</p>
              </div>
            )}

            <div className="border-l-4 border-blue-600 pl-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-600 font-semibold mb-1">Member Since</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-slate-600 font-semibold mb-1">Account ID</p>
              <p className="text-sm font-mono text-slate-900 break-all">{user.id.substring(0, 12)}...</p>
            </div>

          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-blue-600" /> 
            Recent Orders
          </h3>
          
          <div className="flex flex-col items-center justify-center py-12">
            <Printer className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium mb-2">No orders yet</p>
            <p className="text-slate-500 text-sm mb-6">Start by uploading your first document</p>
            <Link href="/upload">
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-lg shadow-blue-600/20">
                Upload Your First Document
              </button>
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}