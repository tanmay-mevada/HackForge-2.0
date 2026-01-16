'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, FileText, MapPin, Loader, Printer } from 'lucide-react'
import UpiQr from '@/components/UpiQr'

interface PrintSettings {
  color: 'bw' | 'color'
  sides: 'single' | 'double'
  copies: number
  binding: 'none' | 'staple' | 'spiral'
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const uploadId = searchParams.get('uploadId')
  const shopId = searchParams.get('shopId')
  const printColor = (searchParams.get('printColor') || 'bw') as 'bw' | 'color'
  const printSides = (searchParams.get('printSides') || 'single') as 'single' | 'double'
  const printCopies = parseInt(searchParams.get('printCopies') || '1')
  const printBinding = (searchParams.get('printBinding') || 'none') as 'none' | 'staple' | 'spiral'

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
      // Update status to printing after payment
      const updateResponse = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          status: 'printing',
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

  const basePrice = printColor === 'bw' ? (shopData?.bw_price || 0) : (shopData?.color_price || 0)
  const printingCost = basePrice * printCopies
  const bindingCost = 
    printBinding === 'staple' ? 5 : 
    printBinding === 'spiral' ? 25 : 0
  const totalAmount = printingCost + bindingCost

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

          {/* Print Settings */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" />
              Print Settings
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Color</p>
                <p className="text-sm font-semibold text-slate-900">
                  {printColor === 'bw' ? 'Black & White' : 'Color'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Print Sides</p>
                <p className="text-sm font-semibold text-slate-900">
                  {printSides === 'single' ? 'Single-sided' : 'Double-sided'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Copies</p>
                <p className="text-sm font-semibold text-slate-900">{printCopies}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Binding</p>
                <p className="text-sm font-semibold text-slate-900">
                  {printBinding === 'none' ? 'No Binding' : printBinding === 'staple' ? 'Staple' : 'Spiral Bind'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>
                  {printColor === 'bw' ? 'B/W' : 'Color'} Printing ({printCopies} {printCopies === 1 ? 'copy' : 'copies'})
                </span>
                <span className="font-semibold">₹{printingCost}</span>
              </div>
              {printBinding !== 'none' && (
                <div className="flex justify-between text-slate-600">
                  <span>
                    {printBinding === 'staple' ? 'Staple' : 'Spiral Bind'} Binding
                  </span>
                  <span className="font-semibold">₹{bindingCost}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-300 flex justify-between text-lg font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Note:</span> The final price will be calculated based on actual number of pages in your document.
            </p>
          </div>

          {/* UPI QR (PayU/Manual UPI) */}
          <UpiQr amount={totalAmount} />

          {/* PayU form: posts to server which returns auto-submitting form to PayU */}
          <form action="/api/payu/pay" method="POST" className="mt-6">
            <input type="hidden" name="amount" value={totalAmount} />
            <input type="hidden" name="productinfo" value="Print Link Order" />
            <input type="hidden" name="firstname" value="Print Link Customer" />
            <input type="hidden" name="email" value="no-reply@printlink.local" />
            <input type="hidden" name="uploadId" value={uploadId || ''} />
            <input type="hidden" name="shopId" value={shopId || ''} />

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {processing && <Loader className="w-5 h-5 animate-spin" />}
              {processing ? 'Processing Payment...' : 'Proceed to PayU'}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Your payment is secure and encrypted. Processing via PayU (UPI QR supported).</p>
          </div>
        </div>
      </main>
    </div>
  )
}
