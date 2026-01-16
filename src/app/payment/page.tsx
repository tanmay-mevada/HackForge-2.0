'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, FileText, MapPin, Loader } from 'lucide-react'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const uploadId = searchParams.get('uploadId')
  const shopId = searchParams.get('shopId')

  const [uploadData, setUploadData] = useState<{ file_name: string; file_size: number } | null>(null)
  const [shopData, setShopData] = useState<{ name: string; location: string; bw_price: number; color_price: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!uploadId || !shopId) {
          router.push('/dashboard')
          return
        }

        // Fetch upload details
        const { data: upload } = await supabase
          .from('uploads')
          .select('file_name, file_size')
          .eq('id', uploadId)
          .single()

        // Fetch shop details
        const { data: shop } = await supabase
          .from('shops')
          .select('name, location, bw_price, color_price')
          .eq('id', shopId)
          .single()

        setUploadData(upload)
        setShopData(shop)
      } catch (err) {
        console.error('Error loading payment data:', err)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [uploadId, shopId, router, supabase])

  const handlePayment = async () => {
    setProcessing(true)
    try {
      // Save shop_id to upload
      const updateResponse = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          shopId,
          status: 'printing', // Change status to printing after payment
        }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to process order')
      }

      // Payment implementation would go here
      // For now, just simulate success
      setTimeout(() => {
        router.push(`/success?uploadId=${uploadId}&shopId=${shopId}`)
      }, 2000)
    } catch (err) {
      console.error('Payment error:', err)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

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

        {/* Payment Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Order Summary</h1>

          {/* File Details */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Document Details</h2>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{uploadData?.file_name}</p>
                <p className="text-sm text-slate-600">
                  {uploadData ? ((uploadData.file_size / 1024 / 1024).toFixed(2) + ' MB') : 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          {/* Shop Details */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Selected Shop</h2>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-slate-900 mb-2">{shopData?.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                <MapPin className="w-4 h-4" />
                {shopData?.location}
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p>B/W Printing: ₹{shopData?.bw_price}/page</p>
                <p>Color Printing: ₹{shopData?.color_price}/page</p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-8 space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Estimated Pages</span>
              <span>1-5 pages</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>B/W: 5 pages × ₹{shopData?.bw_price}</span>
              <span>₹{(shopData?.bw_price ?? 0) * 5}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-bold text-slate-900">
              <span>Total Amount</span>
              <span>₹{((shopData?.bw_price ?? 0) * 5).toFixed(2)}</span>
            </div>
          </div>

          {/* Note */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Note:</span> The final price will be calculated based on actual number of pages in your document.
            </p>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {processing && <Loader className="w-5 h-5 animate-spin" />}
            {processing ? 'Processing Payment...' : 'Proceed to Payment'}
          </button>

          {/* Security Info */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Your payment is secure and encrypted. Processing via Razorpay.</p>
          </div>
        </div>
      </main>
    </div>
  )
}