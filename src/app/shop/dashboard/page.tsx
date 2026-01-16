'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'
import {
  Printer,
  CheckCircle,
  Clock,
  IndianRupee,
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Loader2,
  Power,
  Store,
  MapPin,
  Scroll,
  Layers
} from 'lucide-react'
import LogoutButton from '@/components/logout-button'

// 1. Interfaces
interface Order {
  id: string
  file_name: string
  file_size: number
  status: string
  created_at: string
  user_id: string
}

interface ShopData {
  id: string
  name: string
  location: string | null
  bw_price: number | null
  color_price: number | null
  spiral_price: number | null
  lamination_price: number | null
  is_open: boolean
}

export default function ShopDashboard() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  
  const [loading, setLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  
  // Modal & OTP
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [otp, setOtp] = useState('')

  // Sound Ref
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // --- AUDIO SETUP ---
  useEffect(() => {
    // Ensure you have a file named 'notification.mp3' in your public folder
    audioRef.current = new Audio('/notification.mp3')
  }, [])

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.log('Audio interaction required:', err))
    }
  }

  // --- TOGGLE LOGIC ---
  const handleToggle = async () => {
    if (!shopData || isToggling) return
    setIsToggling(true)
    const originalStatus = shopData.is_open

    try {
      // Optimistic Update
      setShopData(prev => prev ? { ...prev, is_open: !prev.is_open } : null)
      
      const { error } = await supabase
        .from('shops')
        .update({ is_open: !originalStatus })
        .eq('id', shopData.id)

      if (error) throw error
      
      toast.success(`Shop is now ${!originalStatus ? 'Online' : 'Offline'}`)

    } catch (error) {
      console.error('Toggle error:', error)
      setShopData(prev => prev ? { ...prev, is_open: originalStatus } : null)
      toast.error('Failed to update shop status')
    } finally {
      setIsToggling(false)
    }
  }

  // --- INITIAL FETCH ---
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) { router.push('/login'); return }

        // Role Check
        const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        if (profile?.role !== 'shopkeeper') { router.push('/dashboard'); return }

        // Fetch Shop (With new schema fields)
        const { data: shop } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', authUser.id)
          .single()

        setShopData(shop)

        if (shop) {
          setLoadingOrders(true)
          const { data: shopOrders } = await supabase
            .from('uploads')
            .select('*')
            .eq('shop_id', shop.id)
            .order('created_at', { ascending: false })
            .limit(50)

          setOrders(shopOrders || [])
          setLoadingOrders(false)
        }
      } catch (err) {
        console.error('Init error:', err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, supabase])

  // --- REAL-TIME SUBSCRIPTION ---
  useEffect(() => {
    if (!shopData?.id) return

    const channel = supabase
      .channel('shop-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public', 
          table: 'uploads', 
          filter: `shop_id=eq.${shopData.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // 1. Play Sound
            playSound()
            // 2. Show Toast
            toast.message('New Order Received!', {
              description: 'A student just uploaded a file.',
            })
            // 3. Update State
            setOrders((prev) => [payload.new as Order, ...prev])
          } 
          else if (payload.eventType === 'UPDATE') {
            setOrders((prev) => 
              prev.map((order) => 
                order.id === payload.new.id ? { ...order, ...payload.new } : order
              )
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shopData?.id, supabase])

  // --- ACTION HANDLERS ---

  const handleRequest = async (uploadId: string, intent: 'view' | 'download') => {
    try {
      const response = await fetch('/api/orders/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, intent }),
      })

      if (!response.ok) throw new Error()
      const data = await response.json()
      window.open(data.url, '_blank')
    } catch {
      toast.error(`Failed to ${intent} file`)
    }
  }

  const handleUpdateStatus = async (uploadId: string, status: 'printing' | 'completed') => {
    // Optimistic
    setOrders(prev => prev.map(o => o.id === uploadId ? { ...o, status } : o))
    
    try {
      const response = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, status }),
      })
      if (!response.ok) throw new Error()
      toast.success(`Order marked as ${status}`)
    } catch {
      toast.error('Failed to update status on server')
      // Revert if needed (omitted for brevity)
    }
  }

  const handleVerifyOtp = async () => {
    if (!selectedOrder || otp.length < 4) {
      toast.warning('Please enter a valid 4-digit OTP')
      return
    }

    try {
      const response = await fetch('/api/orders/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: selectedOrder, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle Invalid OTP gracefully
        toast.error(data.error || 'Invalid OTP. Please try again.')
        setOtp('') // Clear input on error
        return
      }

      // Success
      setOrders(prev => prev.map(o => o.id === selectedOrder ? { ...o, status: 'done' } : o))
      setShowOtpModal(false)
      setSelectedOrder(null)
      setOtp('')
      toast.success('Order completed successfully!')

    } catch (error) {
      toast.error('Network error. Please check connection.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  const pendingCount = orders.filter(o => o.status === 'pending_payment' || o.status === 'pending').length
  const completedCount = orders.filter(o => o.status === 'completed').length
  const doneCount = orders.filter(o => o.status === 'done').length

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Toaster position="top-right" richColors />

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">Partner Dashboard</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* --- 1. TOP SECTION: METRICS & CONTROLS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            
            {/* Toggle Card (Prominent) */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-sm transition-colors ${
              shopData?.is_open 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold uppercase tracking-wider text-sm ${shopData?.is_open ? 'text-green-800' : 'text-red-800'}`}>
                    Shop Status
                  </h3>
                  <Power className={`w-5 h-5 ${shopData?.is_open ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-4">
                  {shopData?.is_open ? 'ONLINE' : 'OFFLINE'}
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`w-full py-2 rounded-lg font-bold text-sm shadow-sm transition-all ${
                  shopData?.is_open 
                  ? 'bg-white text-green-700 hover:bg-green-100 border border-green-200' 
                  : 'bg-white text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                {isToggling ? 'Updating...' : shopData?.is_open ? 'Close Shop' : 'Open Shop'}
              </button>
            </div>

            {/* Metrics Cards */}
            <StatCard
              title="Pending"
              value={pendingCount.toString()}
              icon={<Clock className="w-5 h-5 text-orange-600" />}
              bg="bg-white"
            />
            <StatCard
              title="Ready to Pickup"
              value={completedCount.toString()}
              icon={<CheckCircle className="w-5 h-5 text-purple-600" />}
              bg="bg-white"
            />
            <StatCard
              title="Total Done"
              value={doneCount.toString()}
              icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
              bg="bg-white"
            />
        </div>

        {/* --- 2. MIDDLE SECTION: LIVE ORDERS --- */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
             <h2 className="text-xl font-bold text-slate-900">Live Queue</h2>
             {loadingOrders && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>

          {orders.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Printer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No active orders right now.</p>
                <p className="text-slate-400 text-sm">New orders will appear here automatically.</p>
             </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className={`bg-white rounded-xl border p-4 flex flex-col md:flex-row items-center gap-4 transition-all hover:shadow-md ${
                  order.status === 'pending_payment' ? 'border-blue-300 shadow-blue-100 shadow-sm' : 'border-slate-200'
                }`}>
                  {/* Icon & ID */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`p-3 rounded-lg ${order.file_name.endsWith('.pdf') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-mono">#{order.id.substring(0,6)}</p>
                      <h3 className="font-bold text-slate-900 truncate max-w-[200px]" title={order.file_name}>
                        {order.file_name}
                      </h3>
                      <p className="text-xs text-slate-500">{(order.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                     order.status === 'done' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                     order.status === 'completed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                     order.status === 'printing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                     'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <button onClick={() => handleRequest(order.id, 'view')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="View"><Eye className="w-5 h-5"/></button>
                    <button onClick={() => handleRequest(order.id, 'download')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Download"><Download className="w-5 h-5"/></button>
                    
                    <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>

                    {/* Logic for Action Buttons */}
                    {order.status === 'pending_payment' || order.status === 'pending' ? (
                      <button onClick={() => handleUpdateStatus(order.id, 'printing')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Print
                      </button>
                    ) : order.status === 'printing' ? (
                      <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </button>
                    ) : order.status === 'completed' ? (
                      <button onClick={() => { setSelectedOrder(order.id); setShowOtpModal(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Verify
                      </button>
                    ) : (
                      <button disabled className="bg-slate-100 text-slate-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 3. BOTTOM SECTION: SHOP DETAILS & PRICING --- */}
        <div className="border-t border-slate-200 pt-8 pb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Shop Configuration</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Info Column */}
             <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-slate-500" />
                  {shopData?.name}
                </h3>
                <div className="flex items-start gap-3 text-slate-600 mb-2">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{shopData?.location || 'No location set'}</p>
                </div>
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                  <span className="font-bold">ID:</span> {shopData?.id}
                </div>
             </div>

             {/* Pricing Column */}
             <div>
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Current Price List
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <PriceItem label="B/W Print" price={shopData?.bw_price} icon={<FileText className="w-4 h-4"/>} />
                  <PriceItem label="Color Print" price={shopData?.color_price} icon={<FileText className="w-4 h-4 text-purple-500"/>} />
                  <PriceItem label="Spiral Binding" price={shopData?.spiral_price} icon={<Scroll className="w-4 h-4 text-orange-500"/>} />
                  <PriceItem label="Lamination" price={shopData?.lamination_price} icon={<Layers className="w-4 h-4 text-blue-500"/>} />
                </div>
             </div>
          </div>
        </div>

      </main>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Verify OTP</h3>
                <p className="text-slate-500 text-sm mt-1">Ask student for the 4-digit code.</p>
              </div>

              <input 
                autoFocus
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-3 border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none mb-8"
                placeholder="••••"
              />

              <div className="space-y-3">
                <button onClick={handleVerifyOtp} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Complete Order
                </button>
                <button onClick={() => { setShowOtpModal(false); setOtp('') }} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

// --- SUBCOMPONENTS ---

function StatCard({ title, value, icon, bg }: { title: string, value: string, icon: React.ReactNode, bg: string }) {
  return (
    <div className={`${bg} p-6 rounded-2xl border border-slate-200 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        {icon}
      </div>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </div>
  )
}

function PriceItem({ label, price, icon }: { label: string, price: number | null | undefined, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
       <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
         {icon} {label}
       </div>
       <span className="font-bold text-slate-900">
         {price ? `₹${price}` : '-'}
       </span>
    </div>
  )
}