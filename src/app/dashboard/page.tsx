'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'
import { 
  UploadCloud, 
  User, 
  Mail, 
  CalendarDays, 
  Printer, 
  CreditCard,
  FileText,
  MapPin,
  Store,
  Loader2,
  CheckCircle2,
  History,
  LogOut
} from 'lucide-react'

// --- Types ---
interface Shop {
  id: string
  name: string
  location: string
  bw_price: number
  color_price: number
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

export default function StudentDashboard() {
  const router = useRouter()
  const supabase = createClient()

  // --- State ---
  const [user, setUser] = useState<{ id: string; email?: string; created_at?: string } | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [shops, setShops] = useState<Shop[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  
  // Interaction State
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // --- Init ---
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Auth Check
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) { router.push('/login'); return }
        setUser(authUser)

        // 2. Load Data Parallelly
        const [profileRes, shopsRes, ordersRes] = await Promise.all([
           supabase.from('users').select('*').eq('id', authUser.id).single(),
           supabase.from('shops').select('*').order('name'),
           supabase.from('uploads').select('id, file_name, file_size, status, created_at').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(10)
        ])

        setUserProfile(profileRes.data)
        setShops(shopsRes.data || [])
        setOrders(ordersRes.data || [])

      } catch (err) {
        console.error(err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, supabase])

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validation
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large (Max 10MB)')
      return
    }
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Use PDF, Word, or Excel.')
      return
    }

    setFile(selectedFile)
    toast.success('File attached successfully')
  }

  const handleUpload = async () => {
    if (!file || !selectedShop) {
      toast.warning('Please select a shop and a file first')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('shopId', selectedShop.id)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Upload failed')

      toast.success('File uploaded! Redirecting...')
      router.push(`/print-settings?uploadId=${data.uploadId}&shopId=${selectedShop.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Toaster position="top-center" richColors />

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{greeting},</span>
            <h1 className="text-lg font-bold text-slate-900">{userProfile?.full_name || 'Student'}</h1>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-red-600 transition" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8">

        {/* --- SECTION 1: ACTION AREA (Important Stuff) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Shop Selector */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg"><Store className="w-5 h-5 text-blue-600" /></div>
              <h2 className="text-xl font-bold text-slate-900">1. Select a Shop</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShop(shop)}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative group ${
                    selectedShop?.id === shop.id
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{shop.name}</h3>
                    {selectedShop?.id === shop.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> <span className="truncate">{shop.location}</span>
                  </div>
                  <div className="flex gap-2 text-xs font-medium">
                     <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">B/W: ₹{shop.bw_price}</span>
                     <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Color: ₹{shop.color_price}</span>
                  </div>
                </button>
              ))}
              {shops.length === 0 && <p className="text-slate-500">No shops available.</p>}
            </div>
          </div>

          {/* File Upload */}
          <div className="lg:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg"><UploadCloud className="w-5 h-5 text-indigo-600" /></div>
                <h2 className="text-xl font-bold text-slate-900">2. Upload File</h2>
             </div>

             <div className={`bg-white rounded-2xl border-2 border-dashed p-6 text-center transition-all h-[calc(100%-3rem)] flex flex-col justify-center ${
               !selectedShop ? 'border-slate-200 opacity-60 cursor-not-allowed' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50/30'
             }`}>
                {!file ? (
                  <label className={`cursor-pointer ${!selectedShop && 'pointer-events-none'}`}>
                    <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <FileText className="w-7 h-7 text-indigo-600" />
                    </div>
                    <span className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all inline-block">
                      {selectedShop ? 'Browse Document' : 'Select Shop First'}
                    </span>
                    <input type="file" className="hidden" onChange={handleFileChange} disabled={!selectedShop} accept=".pdf,.doc,.docx,.xls,.xlsx"/>
                    <p className="mt-4 text-xs text-slate-400">PDF, Word, Excel (Max 10MB)</p>
                  </label>
                ) : (
                  <div className="animate-in zoom-in-95 duration-200">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="font-bold text-slate-900 truncate px-2">{file.name}</p>
                    <p className="text-xs text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    
                    <div className="space-y-2">
                       <button onClick={handleUpload} disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                          {uploading && <Loader2 className="w-4 h-4 animate-spin"/>}
                          {uploading ? 'Uploading...' : 'Continue to Print'}
                       </button>
                       <button onClick={() => setFile(null)} disabled={uploading} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-all">
                          Change File
                       </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* --- SECTION 2: INFORMATION AREA (Extra Stuff) --- */}
        <div className="border-t border-slate-200 pt-8 pb-12">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Account & History</h3>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Profile Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                       {userProfile?.full_name.charAt(0)}
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900 text-lg">{userProfile?.full_name}</h4>
                       <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase font-bold tracking-wide">Student</span>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <InfoRow icon={<Mail className="w-4 h-4"/>} label="Email" value={user?.email || ''} />
                    <InfoRow icon={<CreditCard className="w-4 h-4"/>} label="ID" value={user?.id.substring(0, 8) + '...'} />
                    <InfoRow icon={<CalendarDays className="w-4 h-4"/>} label="Joined" value={new Date(user?.created_at || '').toLocaleDateString()} />
                 </div>
              </div>

              {/* Order History Table */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                       <History className="w-4 h-4 text-slate-400" /> Recent Prints
                    </h4>
                 </div>
                 
                 {orders.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">No print history yet.</div>
                 ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-6 py-3 font-medium">File Name</th>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {orders.map(order => (
                             <tr key={order.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-3 font-medium text-slate-900 flex items-center gap-2">
                                   <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                   <span className="truncate max-w-[150px]">{order.file_name}</span>
                                </td>
                                <td className="px-6 py-3 text-slate-500">
                                   {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-3">
                                   <StatusBadge status={order.status} />
                                </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}

// --- Subcomponents ---

function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
   return (
      <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
         <div className="flex items-center gap-2 text-slate-500 text-sm">
            {icon} <span>{label}</span>
         </div>
         <span className="text-sm font-medium text-slate-900">{value}</span>
      </div>
   )
}

function StatusBadge({ status }: { status: string }) {
   const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      printing: 'bg-blue-100 text-blue-700',
      default: 'bg-slate-100 text-slate-600'
   }
   const style = styles[status as keyof typeof styles] || styles.default
   
   return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${style}`}>
         {status.replace('_', ' ')}
      </span>
   )
}