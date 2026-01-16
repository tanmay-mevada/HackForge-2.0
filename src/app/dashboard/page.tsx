'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  UploadCloud, 
  User, 
  Mail, 
  ShieldCheck, 
  CalendarDays, 
  Printer, 
  CreditCard,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  Store,
  X,
  MapPin,
  Upload
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string; created_at?: string } | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<{ id: string; file_name: string; file_size: number; status: string; created_at: string }[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Upload states
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Shop selection states
  const [shops, setShops] = useState<{ id: string; name: string; location: string; bw_price: number; color_price: number }[]>([])
  const [loadingShops, setLoadingShops] = useState(false)
  const [selectedShop, setSelectedShop] = useState<{ id: string; name: string; location: string; bw_price: number; color_price: number } | null>(null)

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }

        setUser(authUser)

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        setUserProfile(profile)

        // Fetch user's orders
        setLoadingOrders(true)
        const { data: userOrders } = await supabase
          .from('uploads')
          .select('id, file_name, file_size, status, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        setOrders(userOrders || [])
        setLoadingOrders(false)
        loadShops()
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError('File too large. Max 10MB allowed.')
        return
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel']
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadError('Invalid file type. Only PDF, Word, and Excel documents allowed.')
        return
      }

      setUploadError(null)
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first')
      return
    }

    if (!selectedShop) {
      setUploadError('Please select a shop first')
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('shopId', selectedShop.id)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setUploadError(data.error || 'Upload failed')
        setUploading(false)
        return
      }

      setFile(null)
      setUploadSuccess(true)
      // Refresh orders
      const { data: userOrders } = await supabase
        .from('uploads')
        .select('id, file_name, file_size, status, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      setOrders(userOrders || [])

    } catch (err) {
      setUploadError('Failed to upload file. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const loadShops = async () => {
    setLoadingShops(true)
    try {
      const { data: allShops } = await supabase
        .from('shops')
        .select('*')
        .order('name')

      setShops(allShops || [])
    } catch (err) {
      setUploadError('Failed to load shops. Please try again.')
      console.error(err)
    } finally {
      setLoadingShops(false)
    }
  }

  const handleSelectShop = (shop: { id: string; name: string; location: string; bw_price: number; color_price: number }) => {
    setSelectedShop(shop)
<<<<<<< HEAD
=======
  }

  const handleProceedToPrintSettings = () => {
    if (!selectedShop || !uploadId) return
    router.push(`/print-settings?uploadId=${uploadId}&shopId=${selectedShop.id}`)
  }

  const resetUpload = () => {
    setFile(null)
>>>>>>> ff1d5b70949bf1ee80a6c4c47c3145e78024ee5b
    setUploadSuccess(false)
    setUploadError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Helper for greeting based on server time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'


  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* Top Decoration Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 -z-10" />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 text-white">
          <div>
            <p className="text-blue-200 font-medium mb-1">{greeting},</p>
            <h1 className="text-4xl font-bold">{userProfile?.full_name || 'Student'}</h1>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-white">System Operational</span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8 bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          {/* Shop Selection */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">1. Select a Shop</h2>
            </div>
            {loadingShops ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600 mt-3">Loading shops...</p>
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No shops available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => handleSelectShop(shop)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedShop?.id === shop.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-slate-900">{shop.name}</h3>
                      {selectedShop?.id === shop.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      {shop.location}
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>B/W: ₹{shop.bw_price}/page</p>
                      <p>Color: ₹{shop.color_price}/page</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
<<<<<<< HEAD
=======

            {selectedShop && (
              <button
                onClick={handleProceedToPrintSettings}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg shadow-blue-600/20"
              >
                Proceed to Payment
              </button>
            )}
>>>>>>> ff1d5b70949bf1ee80a6c4c47c3145e78024ee5b
          </div>

          {/* Upload Area */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <UploadCloud className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">2. Upload Document</h2>
            </div>
            
            <div className={`transition-opacity duration-500 ${!selectedShop ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="mb-6">
                <label className="block">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center ${!selectedShop ? 'border-slate-300' : 'border-blue-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300'}`}>
                    <Upload className={`w-12 h-12 mx-auto mb-3 ${!selectedShop ? 'text-slate-400' : 'text-blue-500'}`} />
                    <p className={`text-lg font-semibold mb-1 ${!selectedShop ? 'text-slate-500' : 'text-slate-900'}`}>
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-slate-600">
                      PDF, Word (.doc, .docx), or Excel (.xls, .xlsx) - Max 10 MB
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    disabled={!selectedShop}
                  />
                </label>
              </div>

              {/* Selected File */}
              {file && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm px-3 py-1 bg-white text-slate-700 rounded hover:bg-slate-100 transition"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700 text-sm">Upload successful! Your order has been placed and is now visible in your recent orders.</p>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || !selectedShop || uploading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-lg shadow-blue-600/20"
              >
                {uploading ? 'Uploading...' : 'Upload & Place Order'}
              </button>
            </div>
          </div>
        </div>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Stats Column */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stat: Total Prints */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Prints</p>
                <p className="text-3xl font-bold text-slate-900">{orders.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Printer className="h-6 w-6 text-amber-500" />
              </div>
            </div>

            {/* Stat: Wallet / Status */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Account Status</p>
                <p className="text-xl font-bold text-green-600">Active</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>

          </div>
        </div>

        {/* --- LOWER SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Recent Orders (Takes up 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" /> Recent Orders
              </h3>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>
            
            {/* Orders List or Empty State */}
            {loadingOrders ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-600 text-sm">Loading orders...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Printer className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-900 font-semibold mb-1">No orders placed yet</h4>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                  Your print history will appear here once you upload your first document.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">File Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900 truncate">{order.file_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {(order.file_size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'printing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Profile Card (Takes up 1/3) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-slate-900">Profile</h3>
              <button className="p-2 hover:bg-slate-100 rounded-full transition">
                <Settings className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-3">
                {userProfile?.full_name?.charAt(0) || <User />}
              </div>
              <h4 className="text-lg font-bold text-slate-900">{userProfile?.full_name}</h4>
              <p className="text-sm text-slate-500 capitalize">{userProfile?.role || 'Student'}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-5 h-5 text-slate-400" />
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 font-medium uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">User ID</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono">
                    {user?.id?.substring(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CalendarDays className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Joined</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
          </div>

        </div>

      </main>
    </div>
  )
}