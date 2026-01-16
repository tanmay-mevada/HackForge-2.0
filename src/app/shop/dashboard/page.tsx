'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Printer,
  CheckCircle,
  Clock,
  IndianRupee,
  FileText,
  Download,
  Eye,
  ShieldCheck,
} from 'lucide-react'
import LogoutButton from '@/components/logout-button'

export default function ShopDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [shopData, setShopData] = useState<{ id: string; name: string; location: string; bw_price: number; color_price: number; is_open: boolean } | null>(null)
  const [orders, setOrders] = useState<{ id: string; file_name: string; file_size: number; status: string; created_at: string; user_id: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [otp, setOtp] = useState('')

  const handleToggle = async () => {
    if (!shopData) return

    try {
      const newStatus = !shopData.is_open
      const { data, error } = await supabase
        .from('shops')
        .update({ is_open: newStatus })
        .eq('id', shopData.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setShopData(data)
    } catch (error) {
      console.error('Failed to toggle shop status:', error)
      alert('Failed to update shop status. Please try again.')
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }

        // Fetch user profile to verify role
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile?.role !== 'shopkeeper') {
          router.push('/dashboard')
          return
        }

        // Fetch shop data
        const { data: shop } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', authUser.id)
          .single()

        setShopData(shop)

        // Fetch orders for this shop
        if (shop) {
          setLoadingOrders(true)
          const { data: shopOrders } = await supabase
            .from('uploads')
            .select('id, file_name, file_size, status, created_at, user_id')
            .eq('shop_id', shop.id)
            .order('created_at', { ascending: false })
            .limit(20)

          setOrders(shopOrders || [])
          setLoadingOrders(false)
        }
      } catch (err) {
        console.error('Error loading shop dashboard:', err)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router, supabase])

  const handleRequest = async (uploadId: string, intent: 'view' | 'download') => {
    try {
      const response = await fetch('/api/orders/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, intent }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${intent} file`)
      }

      const data = await response.json()
      window.open(data.url, '_blank')

    } catch (error) {
      console.error(`${intent} error:`, error)
      alert(`Failed to ${intent} file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

    const handleDownload = (uploadId: string) => handleRequest(uploadId, 'download')

    const handleView = (uploadId: string) => handleRequest(uploadId, 'view')

  

    const handleUpdateStatus = async (uploadId: string, status: 'printing' | 'completed') => {

      try {

        const response = await fetch('/api/orders/update', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ uploadId, status }),

        })

  

        if (!response.ok) {

          const errorData = await response.json()

          throw new Error(errorData.error || 'Failed to update status')

        }

  

        // Update the local state to reflect the change immediately

        setOrders(currentOrders =>

          currentOrders.map(order =>

            order.id === uploadId ? { ...order, status: status } : order

          )

        )

      } catch (error) {

        console.error('Status update error:', error)

        alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`)

      }

    }

    const handleVerifyOtp = async () => {
        if (!selectedOrder || !otp) {
          alert('Please enter the OTP.')
          return
        }
    
        try {
          const response = await fetch('/api/orders/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uploadId: selectedOrder, otp }),
          })
    
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to verify OTP')
          }
    
          // Update the local state to reflect the change immediately
          setOrders(currentOrders =>
            currentOrders.map(order =>
              order.id === selectedOrder ? { ...order, status: 'done' } : order
            )
          )
    
          // Close the modal
          setShowOtpModal(false)
          setSelectedOrder(null)
          setOtp('')
        } catch (error) {
          console.error('OTP verification error:', error)
          alert(`Failed to verify OTP: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

  

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading shop dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingCount = orders.filter(o => o.status === 'pending_payment').length
  const completedCount = orders.filter(o => o.status === 'completed').length
  const doneCount = orders.filter(o => o.status === 'done').length
  return (
    <div className="min-h-screen bg-slate-50">
      {/* PROFESSIONAL HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {shopData?.name || 'Shop Dashboard'}
              </h1>
              <div className="flex items-center gap-2">
              <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    shopData?.is_open ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                ></span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    shopData?.is_open
                      ? 'text-green-700 bg-green-50'
                      : 'text-red-700 bg-red-50'
                  }`}
                >
                  {shopData?.is_open ? 'Shop Online' : 'Shop Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
          <button
              onClick={handleToggle}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                shopData?.is_open ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  shopData?.is_open ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Pending Orders"
            value={pendingCount.toString()}
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            bg="bg-orange-50"
          />
          <StatCard
            title="Ready for Pickup"
            value={completedCount.toString()}
            icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
            bg="bg-blue-50"
          />
           <StatCard
            title="Orders Done"
            value={doneCount.toString()}
            icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
            bg="bg-green-50"
          />
          <StatCard
            title="B/W Rate"
            value={`₹${shopData?.bw_price}/page` || 'N/A'}
            icon={<IndianRupee className="w-5 h-5 text-green-600" />}
            bg="bg-green-50"
          />
        </div>

        {/* ORDERS LIST */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Recent Orders
            <span className="text-sm font-normal text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              {orders.length} Total
            </span>
          </h2>
        </div>

        {/* ORDER LIST */}
        {loadingOrders ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Printer className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No orders yet</p>
            <p className="text-slate-500 text-sm">Orders placed for your shop will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-blue-300 transition-all"
              >
                {/* Left: Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {order.id.substring(0, 8)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" /> {order.file_name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Size: <span className="text-slate-900">{(order.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  </p>
                </div>

                {/* Middle: Status */}
                <div className="flex gap-4">
                  <span className={`px-3 py-1.5 rounded-md text-sm font-bold border ${
                    order.status === 'done' ? 'text-gray-700 bg-gray-50 border-gray-200' :
                    order.status === 'completed' ? 'text-green-700 bg-green-50 border-green-200' :
                    order.status === 'printing' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                    'text-yellow-700 bg-yellow-50 border-yellow-200'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <button
                    onClick={() => handleView(order.id)}
                    className="p-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
                    title="View & Print File"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(order.id)}
                    className="p-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
                    title="Download File"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  {order.status === 'pending_payment' ? (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'printing')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition flex items-center gap-2">
                      <Printer className="w-4 h-4" /> Start Printing
                    </button>
                  ) : order.status === 'printing' ? (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Mark Ready
                    </button>
                  ) : order.status === 'completed' ? (
                    <button
                        onClick={() => {
                        setSelectedOrder(order.id)
                        setShowOtpModal(true)
                        }}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-600/20 transition flex items-center gap-2"
                    >
                        <ShieldCheck className="w-4 h-4" /> Verify OTP
                    </button>
                  ) : (
                    <button 
                      disabled 
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition flex items-center gap-2 cursor-not-allowed opacity-70">
                      <CheckCircle className="w-4 h-4" /> Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
                <p className="text-slate-500 mb-6">Enter the OTP provided by the customer to complete the order.</p>
                <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                placeholder="Enter OTP"
                />
                <div className="flex justify-end gap-4">
                <button
                    onClick={() => setShowOtpModal(false)}
                    className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                    Cancel
                </button>
                <button
                    onClick={handleVerifyOtp}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                    Verify & Complete
                </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// --- SUBCOMPONENTS ---

function StatCard({
  title,
  value,
  icon,
  bg,
}: {
  title: string
  value: string
  icon: React.ReactNode
  bg: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
    </div>
  )
}
