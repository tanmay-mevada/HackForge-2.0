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
  Loader,
} from 'lucide-react'
import LogoutButton from '@/components/logout-button'

export default function ShopDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [shopData, setShopData] = useState<{ id: string; name: string; location: string; bw_price: number; color_price: number } | null>(null)
  const [orders, setOrders] = useState<{ id: string; file_name: string; file_size: number; status: string; created_at: string; user_id: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }

        setUser(authUser as { id: string; email?: string })

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

  const handleDownload = async (uploadId: string, fileName: string) => {
    try {
      const response = await fetch('/api/orders/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      })

      if (!response.ok) throw new Error('Failed to generate download link')

      const data = await response.json()
      const link = document.createElement('a')
      link.href = data.url
      link.download = data.fileName || fileName
      link.click()
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
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
  const totalPages = orders.reduce((sum, order) => sum + Math.ceil(order.file_size / 100000), 0)
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
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  Shop Online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            title="Completed"
            value={completedCount.toString()}
            icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
            bg="bg-blue-50"
          />
          <StatCard
            title="Shop Location"
            value={shopData?.location || 'N/A'}
            icon={<FileText className="w-5 h-5 text-slate-600" />}
            bg="bg-slate-100"
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
                    onClick={() => handleDownload(order.id, order.file_name)}
                    className="p-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
                    title="Download File"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  {order.status === 'pending_payment' ? (
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition flex items-center gap-2">
                      <Printer className="w-4 h-4" /> Start Printing
                    </button>
                  ) : order.status === 'printing' ? (
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Mark Ready
                    </button>
                  ) : (
                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-600/20 transition flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
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
  icon: any
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
