'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Loader2, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  AlertCircle
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import UpiQr from '@/components/UpiQr'

// --- Interfaces ---
interface UploadData {
  file_name: string
  file_size: number
  // Removed 'total_pages' to prevent DB errors
}

interface ShopData {
  name: string
  location: string
  bw_price: number
  color_price: number
  spiral_price: number
  lamination_price: number
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // --- Secure Parameter Extraction ---
  const uploadId = searchParams.get('uploadId')
  const shopId = searchParams.get('shopId')
  
  // Get Pages from URL (Fallback to 1)
  const pagesFromUrl = parseInt(searchParams.get('pages') || '1')

  // Configuration
  const config = {
    color: (searchParams.get('color') || 'bw') as 'bw' | 'color',
    sides: (searchParams.get('sides') || 'single') as 'single' | 'double',
    copies: Math.max(1, parseInt(searchParams.get('copies') || '1')),
    binding: (searchParams.get('binding') || 'none') as 'none' | 'staple' | 'spiral' | 'lamination'
  }

  // --- State ---
  const [uploadData, setUploadData] = useState<UploadData | null>(null)
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  // --- Data Loading ---
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!uploadId || !shopId) throw new Error('Invalid Transaction')

        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) setUserEmail(user.email)

        // 1. Fetch Upload Details 
        // FIXED: Removed 'total_pages' from selection to stop the crash
        const { data: upload, error: uploadError } = await supabase
          .from('uploads')
          .select('file_name, file_size') 
          .eq('id', uploadId)
          .single()

        if (uploadError) {
            console.error("Upload Error:", uploadError)
            throw new Error('File fetch failed')
        }

        // 2. Fetch Shop Details
        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .select('name, location, bw_price, color_price, spiral_price, lamination_price')
          .eq('id', shopId)
          .single()

        if (shopError) throw new Error('Shop not found')

        setUploadData(upload)
        setShopData(shop)
      } catch (err) {
        console.error("Load Data Error:", err)
        toast.error('Session invalid. Redirecting...')
        router.push('/dashboard') 
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [uploadId, shopId, router, supabase])

  // --- Secure Price Calculation ---
  const billDetails = useMemo(() => {
    if (!shopData) return null

    // Use URL params for calculation (Stable)
    const pages = pagesFromUrl
    
    const baseRate = config.color === 'bw' ? shopData.bw_price : shopData.color_price
    const totalFaces = pages * config.copies
    const rawPrintCost = totalFaces * baseRate
    
    const isDoubleSided = config.sides === 'double'
    const discountMultiplier = isDoubleSided ? 0.8 : 1
    const finalPrintCost = Math.ceil(rawPrintCost * discountMultiplier)
    
    let bindingCost = 0
    if (config.binding === 'staple') bindingCost = 5
    if (config.binding === 'spiral') bindingCost = shopData.spiral_price || 25
    if (config.binding === 'lamination') bindingCost = shopData.lamination_price || 40

    return {
      pages,
      totalFaces,
      baseRate,
      printing: finalPrintCost,
      binding: bindingCost,
      total: finalPrintCost + bindingCost
    }
  }, [shopData, config, pagesFromUrl])

  if (loading || !billDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm h-16">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
           <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
           </button>
           <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <Lock className="w-3 h-3" />
              <span className="text-xs font-bold uppercase tracking-wider">Secure Checkout</span>
           </div>
           <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- LEFT COLUMN: ORDER DETAILS --- */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Review Order</h1>

            {/* Document Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Document</h3>
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                     <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                     <p className="font-bold text-slate-900">{uploadData?.file_name}</p>
                     <p className="text-sm text-slate-500 mt-1">
                        {(uploadData!.file_size / 1024 / 1024).toFixed(2)} MB • {billDetails.pages} Pages
                     </p>
                  </div>
               </div>
            </div>

            {/* Shop Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Print Partner</h3>
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                     <MapPin className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                     <p className="font-bold text-slate-900">{shopData?.name}</p>
                     <p className="text-sm text-slate-500 mt-1">{shopData?.location}</p>
                  </div>
               </div>
            </div>

            {/* Config Summary Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Configuration</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ConfigItem label="Color" value={config.color === 'bw' ? 'Black & White' : 'Full Color'} />
                  <ConfigItem label="Sides" value={config.sides === 'single' ? 'Single Sided' : 'Double Sided'} />
                  <ConfigItem label="Copies" value={config.copies.toString()} />
                  <ConfigItem label="Binding" value={config.binding === 'none' ? 'None' : config.binding} capitalize />
               </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: PAYMENT ACTION --- */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                   <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-slate-500" /> Payment Details
                   </h2>
                </div>

                <div className="p-6 space-y-4">
                   <div className="flex justify-between text-sm text-slate-600">
                      <span>Printing Cost</span>
                      <span>₹{billDetails.printing}</span>
                   </div>
                   {billDetails.binding > 0 && (
                      <div className="flex justify-between text-sm text-slate-600">
                         <span>Binding Cost</span>
                         <span>₹{billDetails.binding}</span>
                      </div>
                   )}
                   <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-lg">Total Amount</span>
                      <span className="font-bold text-blue-600 text-3xl">₹{billDetails.total}</span>
                   </div>
                </div>

                {/* Secure Form Submission */}
                <div className="p-6 pt-0">
                   <form action="/api/payu/pay" method="POST" onSubmit={() => setProcessing(true)}>
                      <input type="hidden" name="amount" value={billDetails.total} />
                      <input type="hidden" name="productinfo" value={`Print Order ${uploadId?.substring(0,6)}`} />
                      <input type="hidden" name="firstname" value="Student" />
                      <input type="hidden" name="email" value={userEmail || 'guest@printit.com'} />
                      <input type="hidden" name="uploadId" value={uploadId || ''} />
                      <input type="hidden" name="shopId" value={shopId || ''} />

                      <button 
                         type="submit" 
                         disabled={processing}
                         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                      >
                         {processing ? (
                            <>
                               <Loader2 className="w-5 h-5 animate-spin" /> 
                               Processing...
                            </>
                         ) : (
                            <>
                               Proceed to Pay <ShieldCheck className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />
                            </>
                         )}
                      </button>
                   </form>

                   <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p>Payments are processed securely via PayU. You will be redirected to their gateway to complete the transaction.</p>
                   </div>
                </div>
             </div>

             {/* UPI Option */}
             <div className="mt-6">
                <UpiQr amount={billDetails.total} />
             </div>
          </div>

        </div>
      </main>
    </div>
  )
}

// --- Helper Component ---
function ConfigItem({ label, value, capitalize = false }: { label: string, value: string, capitalize?: boolean }) {
   return (
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
         <p className="text-xs text-slate-500 font-bold uppercase mb-1">{label}</p>
         <p className={`text-sm font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
      </div>
   )
}