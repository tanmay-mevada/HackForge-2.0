'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Printer, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface PrintSettings {
  color: 'bw' | 'color'
  sides: 'single' | 'double'
  copies: number
  binding: 'none' | 'staple' | 'spiral'
}

interface ShopData {
  name: string
  location: string
  bw_price: number
  color_price: number
}

export default function PrintSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const uploadId = searchParams.get('uploadId')
  const shopId = searchParams.get('shopId')

  const [settings, setSettings] = useState<PrintSettings>({
    color: 'bw',
    sides: 'single',
    copies: 1,
    binding: 'none',
  })

  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const loadShopData = async () => {
      try {
        if (!shopId) {
          router.push('/dashboard')
          return
        }

        const { data: shop } = await supabase
          .from('shops')
          .select('name, location, bw_price, color_price')
          .eq('id', shopId)
          .single()

        if (shop) {
          setShopData(shop)
        } else {
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Error loading shop data:', err)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadShopData()
  }, [shopId, router, supabase])

  const handleContinue = async () => {
    if (!uploadId || !shopId) return

    setProcessing(true)

    try {
      // Redirect to payment with all parameters
      router.push(
        `/payment?uploadId=${uploadId}&shopId=${shopId}&printColor=${settings.color}&printSides=${settings.sides}&printCopies=${settings.copies}&printBinding=${settings.binding}`
      )
    } catch (err) {
      console.error('Error continuing to payment:', err)
      alert('Failed to continue to payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading print settings...</p>
        </div>
      </div>
    )
  }

  const basePrice = settings.color === 'bw' ? shopData?.bw_price || 0 : shopData?.color_price || 0
  const totalPrice = basePrice * settings.copies
  const bindingPrice =
    settings.binding === 'staple' ? 5 : settings.binding === 'spiral' ? 25 : 0
  const estimatedTotal = totalPrice + bindingPrice

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 -z-10" />

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <Printer className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Print Settings</h1>
          </div>

          {/* Shop Info */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
              Selected Shop
            </h2>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-lg font-bold text-slate-900">{shopData?.name}</p>
              <p className="text-sm text-slate-600">{shopData?.location}</p>
            </div>
          </div>

          {/* Print Settings Form */}
          <div className="space-y-8 mb-8">
            {/* Print Color */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Print Color</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, color: 'bw' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    settings.color === 'bw'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-16 h-16 bg-gradient-to-b from-white to-black rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <div className="text-2xl">⚫</div>
                  </div>
                  <p className="font-semibold text-slate-900">Black & White</p>
                  <p className="text-sm text-slate-600 mt-1">
                    ₹{shopData?.bw_price}/page
                  </p>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, color: 'color' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    settings.color === 'color'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <div className="text-2xl">🌈</div>
                  </div>
                  <p className="font-semibold text-slate-900">Color</p>
                  <p className="text-sm text-slate-600 mt-1">
                    ₹{shopData?.color_price}/page
                  </p>
                </button>
              </div>
            </div>

            {/* Print Sides */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Print Sides</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, sides: 'single' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    settings.sides === 'single'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-3xl mb-2">📄</div>
                  <p className="font-semibold text-slate-900">Single-sided</p>
                  <p className="text-xs text-slate-600 mt-1">Print on one side</p>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, sides: 'double' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    settings.sides === 'double'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-3xl mb-2">📃</div>
                  <p className="font-semibold text-slate-900">Double-sided</p>
                  <p className="text-xs text-slate-600 mt-1">Save paper</p>
                </button>
              </div>
            </div>

            {/* Number of Copies */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Number of Copies
              </h3>
              <div className="flex items-center justify-center gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      copies: Math.max(1, settings.copies - 1),
                    })
                  }
                  className="w-12 h-12 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition flex items-center justify-center text-xl font-bold text-slate-600"
                >
                  −
                </button>
                <span className="text-4xl font-bold text-slate-900 w-16 text-center">
                  {settings.copies}
                </span>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      copies: Math.min(999, settings.copies + 1),
                    })
                  }
                  className="w-12 h-12 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition flex items-center justify-center text-xl font-bold text-slate-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Binding Option */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Binding Option
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, binding: 'none' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    settings.binding === 'none'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-3xl mb-2">📋</p>
                  <p className="font-semibold text-slate-900 text-sm">No Binding</p>
                  <p className="text-xs text-slate-600 mt-2">₹0</p>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, binding: 'staple' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    settings.binding === 'staple'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-3xl mb-2">📌</p>
                  <p className="font-semibold text-slate-900 text-sm">Staple</p>
                  <p className="text-xs text-slate-600 mt-2">+₹5</p>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, binding: 'spiral' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    settings.binding === 'spiral'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-3xl mb-2">🌀</p>
                  <p className="font-semibold text-slate-900 text-sm">Spiral Bind</p>
                  <p className="text-xs text-slate-600 mt-2">+₹25</p>
                </button>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mb-8 pb-8 border-b border-slate-200 bg-slate-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">
              Price Breakdown
            </h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>
                  {settings.color === 'bw' ? 'B/W' : 'Color'} Printing (
                  {settings.copies} copies)
                </span>
                <span className="font-semibold">₹{totalPrice}</span>
              </div>
              {settings.binding !== 'none' && (
                <div className="flex justify-between text-slate-600">
                  <span>
                    {settings.binding.charAt(0).toUpperCase() +
                      settings.binding.slice(1)}{' '}
                    Binding
                  </span>
                  <span className="font-semibold">₹{bindingPrice}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-4 border-t border-slate-200">
              <span>Total Estimated Cost</span>
              <span className="text-blue-600">₹{estimatedTotal}</span>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={processing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-lg shadow-blue-600/20"
          >
            {processing ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </main>
    </div>
  )
}
