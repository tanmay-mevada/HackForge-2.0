'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  UploadCloud, 
  Store, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  X, 
  Loader2,
  Clock,
  CheckCircle
} from 'lucide-react'

// Define interfaces for better type safety
interface Shop {
  id: string
  name: string
  location: string
  bw_price: number
  color_price: number
  is_open: boolean
}

interface Order {
  id: string
  file_name: string
  file_size: number
  status: string
  created_at: string
}

interface UserProfile {
  full_name: string
  role: string
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Order states
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Upload states
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Shop selection states
  const [shops, setShops] = useState<Shop[]>([])
  const [loadingShops, setLoadingShops] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Check Auth
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }
        setUser(authUser)

        // 2. Fetch Profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUserProfile(profile)

        // 3. Fetch Orders
        setLoadingOrders(true)
        const { data: userOrders } = await supabase
          .from('uploads')
          .select('id, file_name, file_size, status, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
        setOrders(userOrders || [])
        setLoadingOrders(false)

        // 4. Fetch Shops
        setLoadingShops(true)
        const { data: allShops } = await supabase
          .from('shops')
          .select('*')
          .order('name')
        setShops(allShops || [])
        setLoadingShops(false)

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
      // 10MB Limit
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError('File too large. Max 10MB allowed.')
        return
      }

      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.ms-excel'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadError('Invalid file type. Only PDF, Word, and Excel documents allowed.')
        return
      }

      setUploadError(null)
      setFile(selectedFile)
      setUploadSuccess(false)
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
        throw new Error(data.error || 'Upload failed')
      }

      // After successful upload, redirect user to Print Settings step
      // passing uploadId and shopId as query params.
      setFile(null)
      setUploadSuccess(true)
      
      // Refresh orders immediately
      const { data: updatedOrders } = await supabase
        .from('uploads')
        .select('id, file_name, file_size, status, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      
      setOrders(updatedOrders || [])

    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSelectShop = (shop: Shop) => {
    // Optional: Prevent selection if closed
    // if (!shop.is_open) return 
    setSelectedShop(shop)
    setUploadError(null)
  }

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Top Decoration Background */}
      <div className="absolute top-0 left-0 w-full h-72 bg-slate-900 -z-0" />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12 relative z-10">
        
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Actions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Shop Selection */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <Store className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">1. Select a Print Shop</h2>
              </div>
              
              {loadingShops ? (
                 <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => handleSelectShop(shop)}
                      disabled={!shop.is_open}
                      className={`p-4 rounded-xl border-2 transition-all text-left relative group ${
                        selectedShop?.id === shop.id
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'
                      } ${!shop.is_open ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900">{shop.name}</h3>
                        {selectedShop?.id === shop.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                        <MapPin className="w-3 h-3" /> {shop.location}
                      </div>
                      <div className="flex gap-3 text-xs font-medium text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded">BW: ₹{shop.bw_price}</span>
                        <span className="bg-slate-100 px-2 py-1 rounded">Color: ₹{shop.color_price}</span>
                      </div>
                      {!shop.is_open && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Closed</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Upload Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <UploadCloud className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">2. Upload Document</h2>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center transition-colors hover:border-blue-400 bg-slate-50/50">
                {!file ? (
                  <>
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors inline-block shadow-lg shadow-blue-600/20">
                        Browse Files
                      </span>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </label>
                    <p className="mt-4 text-sm text-slate-500">Supported: PDF, Word, Excel (Max 10MB)</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <p className="font-medium text-slate-900 text-lg">{file.name}</p>
                    <p className="text-slate-500 text-sm mb-6">{formatBytes(file.size)}</p>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { setFile(null); setUploadSuccess(false); }}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                      >
                        Remove
                      </button>
                      <button 
                        onClick={handleUpload}
                        disabled={uploading || !selectedShop}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        {uploading ? 'Uploading...' : 'Send to Print'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {uploadError && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Upload Successful!</p>
                    <p className="text-sm">Your document has been sent to {selectedShop?.name}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 h-full">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Recent Orders
              </h3>

              {loadingOrders ? (
                <div className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No recent orders found.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm truncate mb-1" title={order.file_name}>
                        {order.file_name}
                      </h4>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{formatBytes(order.file_size)}</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}