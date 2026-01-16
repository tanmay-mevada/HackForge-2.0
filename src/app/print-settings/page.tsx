'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  Layers, 
  Copy, 
  Check, 
  Loader2, 
  CreditCard,
  Droplet,
  Palette,
  Paperclip,
  Scroll,
  Sparkles,
  Ban,
  Files,
  Sheet,
  TrendingDown
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Toaster, toast } from 'sonner'
import JSZip from 'jszip'

// --- Interfaces ---
interface PrintSettings {
  color: 'bw' | 'color'
  sides: 'single' | 'double'
  copies: number
  binding: 'none' | 'staple' | 'spiral' | 'lamination'
}

interface ShopData {
  name: string
  location: string
  bw_price: number
  color_price: number
  spiral_price: number
  lamination_price: number
}

export default function PrintSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const uploadId = searchParams.get('uploadId')
  const shopId = searchParams.get('shopId')

  // --- State ---
  const [settings, setSettings] = useState<PrintSettings>({
    color: 'bw',
    sides: 'single', // Default to single
    copies: 1,
    binding: 'none',
  })

  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Page Counting State
  const [pageCount, setPageCount] = useState<number>(0)
  const [countingPages, setCountingPages] = useState<boolean>(true)
  const [fileName, setFileName] = useState<string>('')

  // --- 1. Load Shop Data ---
  useEffect(() => {
    const loadShopData = async () => {
      if (!shopId) { router.push('/dashboard'); return }
      try {
        const { data: shop, error } = await supabase
          .from('shops')
          .select('name, location, bw_price, color_price, spiral_price, lamination_price')
          .eq('id', shopId)
          .single()

        if (error || !shop) throw new Error('Shop not found')
        setShopData(shop)
      } catch (err) {
        toast.error('Failed to load shop details')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadShopData()
  }, [shopId, router, supabase])

  // --- 2. Fetch File & Count Pages ---
  useEffect(() => {
    const analyzeFile = async () => {
      if (!uploadId) return
      setCountingPages(true)

      try {
        // A. Fetch file info (Using your ACTUAL column names)
        const { data: uploadData, error } = await supabase
          .from('uploads')
          .select('id, storage_path, file_name, user_id') // Corrected column name
          .eq('id', uploadId)
          .single()

        if (error || !uploadData) throw new Error('File record not found')
        if (!uploadData.storage_path) throw new Error('Storage path missing')
        
        setFileName(uploadData.file_name)

        // B. Download file as Blob
        const { data: fileBlob, error: downloadError } = await supabase
          .storage
          .from('documents') // Verify bucket name!
          .download(uploadData.storage_path)

        if (downloadError || !fileBlob) throw new Error('Download failed')

        // C. Parse Pages
        let pages = 1
        const arrayBuffer = await fileBlob.arrayBuffer()
        const name = uploadData.file_name.toLowerCase()

        if (name.endsWith('.pdf')) {
          pages = await countPdfPages(arrayBuffer)
        } else if (name.endsWith('.docx')) {
          pages = await countDocxPages(arrayBuffer)
        }

        setPageCount(pages)
        if (pages > 1) toast.success(`Detected ${pages} pages`)

      } catch (err) {
        console.error("Page count failed:", err)
        toast.warning('Could not auto-detect pages. Defaulting to 1.')
        setPageCount(1)
      } finally {
        setCountingPages(false)
      }
    }

    analyzeFile()
  }, [uploadId, supabase])

  // --- Helpers: Page Counting ---
  const countPdfPages = async (buffer: ArrayBuffer): Promise<number> => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      return pdf.numPages
    } catch (e) {
      console.error('PDF parsing error', e)
      return 1
    }
  }

  const countDocxPages = async (buffer: ArrayBuffer): Promise<number> => {
    try {
      const zip = await JSZip.loadAsync(buffer)
      const appXml = await zip.file('docProps/app.xml')?.async('text')
      
      if (appXml) {
        const match = appXml.match(/<Pages>(\d+)<\/Pages>/)
        if (match && match[1]) return parseInt(match[1], 10)
      }
      return 1 
    } catch (e) {
      console.error('DOCX parsing error', e)
      return 1
    }
  }

  // --- 3. PRACTICAL BILL CALCULATION ---
  
  // Base Rate (Per Side/Impression)
  const baseRate = settings.color === 'bw' ? (shopData?.bw_price || 0) : (shopData?.color_price || 0)
  
  // Total Faces to Print
  const totalFaces = pageCount * settings.copies

  // Raw Printing Cost (Without Discounts)
  const rawPrintCost = totalFaces * baseRate

  // Double-Sided Discount Logic (20% Savings)
  // If printing double-sided, we apply a 0.8 multiplier to the print cost
  const isDoubleSided = settings.sides === 'double'
  const discountMultiplier = isDoubleSided ? 0.8 : 1
  
  const finalPrintCost = Math.ceil(rawPrintCost * discountMultiplier)
  const savingsAmount = rawPrintCost - finalPrintCost

  // Sheets Calculation
  const sheetsUsed = isDoubleSided ? Math.ceil(pageCount / 2) * settings.copies : pageCount * settings.copies

  // Binding Cost
  const bindingPrice = 
    settings.binding === 'staple' ? 5 : 
    settings.binding === 'spiral' ? (shopData?.spiral_price || 25) : 
    settings.binding === 'lamination' ? (shopData?.lamination_price || 40) : 0
  
  // Total Bill
  const totalCost = finalPrintCost + bindingPrice

  // --- Handler ---
  const handleContinue = async () => {
    if (!uploadId || !shopId) return
    setProcessing(true)

    try {
      const { error } = await supabase
        .from('uploads')
        .update({
          // Saving simple metadata or jsonb if you prefer
          status: 'pending_payment', 
          shop_id: shopId,
          // You might want to save these calculated values to your DB if columns exist:
          // total_price: totalCost,
          // total_pages: pageCount
        })
        .eq('id', uploadId)

      if (error) throw error

      // Pass calculated values to Payment Page
      const params = new URLSearchParams({
        uploadId: uploadId,
        shopId: shopId,
        amount: totalCost.toString(),
        // Metadata for display
        desc: `${settings.color.toUpperCase()} Print (${settings.copies} copies)`
      })

      router.push(`/payment?${params.toString()}`)
    } catch (err) {
      toast.error('Failed to proceed')
      // Calculate total amount
      const basePrice = settings.color === 'bw' ? shopData?.bw_price || 0 : shopData?.color_price || 0
      const totalPrice = basePrice * settings.copies
      const bindingPrice = settings.binding === 'staple' ? 5 : settings.binding === 'spiral' ? 25 : 0
      const totalAmount = totalPrice + bindingPrice

      // Create payment record
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          amount: totalAmount,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok || !paymentData.txnid) {
        throw new Error('Failed to create payment record')
      }

      // Redirect to success/verification page with txnid
      router.push(
        `/success?uploadId=${uploadId}&shopId=${shopId}&txnid=${paymentData.txnid}&printColor=${settings.color}&printSides=${settings.sides}&printCopies=${settings.copies}&printBinding=${settings.binding}`
      )
    } catch (err) {
      console.error('Error continuing to payment:', err)
      alert('Failed to proceed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
           <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
           </button>
           <h1 className="text-lg font-bold text-slate-900">Configure Print</h1>
           <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- LEFT COLUMN: SETTINGS --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* File Analysis Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-blue-50 rounded-xl">
                  {countingPages ? <Loader2 className="w-6 h-6 text-blue-600 animate-spin"/> : <FileText className="w-6 h-6 text-blue-600"/>}
               </div>
               <div>
                  <p className="text-sm text-slate-500 font-medium">Document Detected</p>
                  <h3 className="font-bold text-slate-900 truncate max-w-[200px]">{fileName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                        {countingPages ? '...' : pageCount} Pages
                    </span>
                  </div>
               </div>
            </div>

            {/* 1. Color Selection */}
            <Section title="Color Mode" icon={<Printer className="w-5 h-5 text-blue-600"/>}>
               <div className="grid grid-cols-2 gap-4">
                  <OptionButton 
                     selected={settings.color === 'bw'} 
                     onClick={() => setSettings({...settings, color: 'bw'})}
                     title="Black & White"
                     subtitle={`₹${shopData?.bw_price}/page`}
                     icon={<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900"><Droplet className="w-5 h-5 fill-slate-900" /></div>}
                  />
                  <OptionButton 
                     selected={settings.color === 'color'} 
                     onClick={() => setSettings({...settings, color: 'color'})}
                     title="Full Color"
                     subtitle={`₹${shopData?.color_price}/page`}
                     icon={<div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Palette className="w-5 h-5" /></div>}
                  />
               </div>
            </Section>

            {/* 2. Sides (With Discount Badge) */}
            <Section title="Paper Sides" icon={<Files className="w-5 h-5 text-blue-600"/>}>
               <div className="grid grid-cols-2 gap-4">
                  <OptionButton 
                     selected={settings.sides === 'single'} 
                     onClick={() => setSettings({...settings, sides: 'single'})}
                     title="Single Sided"
                     subtitle="Standard Rate"
                     icon={<FileText className="w-8 h-8 text-slate-400" />}
                  />
                  <div className="relative">
                    <OptionButton 
                       selected={settings.sides === 'double'} 
                       onClick={() => setSettings({...settings, sides: 'double'})}
                       title="Double Sided"
                       subtitle="Save 20% on Print"
                       icon={<Layers className="w-8 h-8 text-slate-400" />}
                    />
                    <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        Cheaper!
                    </div>
                  </div>
               </div>
            </Section>

            {/* 3. Copies */}
            <Section title="Quantity" icon={<Copy className="w-5 h-5 text-blue-600"/>}>
               <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 w-fit">
                  <button 
                    onClick={() => setSettings({...settings, copies: Math.max(1, settings.copies - 1)})}
                    className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-lg transition shadow-sm"
                  >-</button>
                  <div className="text-center w-24">
                     <span className="text-2xl font-bold text-slate-900">{settings.copies}</span>
                     <p className="text-xs text-slate-500 uppercase font-bold">Copies</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, copies: Math.min(100, settings.copies + 1)})}
                    className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-lg transition shadow-sm"
                  >+</button>
               </div>
            </Section>

            {/* 4. Finishing */}
            <Section title="Binding & Finishing" icon={<Layers className="w-5 h-5 text-blue-600"/>}>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <BindingOption 
                     selected={settings.binding === 'none'} 
                     onClick={() => setSettings({...settings, binding: 'none'})}
                     label="None" price="Free" icon={<Ban className="w-6 h-6"/>}
                  />
                  <BindingOption 
                     selected={settings.binding === 'staple'} 
                     onClick={() => setSettings({...settings, binding: 'staple'})}
                     label="Staple" price="+₹5" icon={<Paperclip className="w-6 h-6"/>}
                  />
                  <BindingOption 
                     selected={settings.binding === 'spiral'} 
                     onClick={() => setSettings({...settings, binding: 'spiral'})}
                     label="Spiral" price={`+₹${shopData?.spiral_price || 25}`} icon={<Scroll className="w-6 h-6"/>}
                  />
                  <BindingOption 
                     selected={settings.binding === 'lamination'} 
                     onClick={() => setSettings({...settings, binding: 'lamination'})}
                     label="Laminate" price={`+₹${shopData?.lamination_price || 40}`} icon={<Sparkles className="w-6 h-6"/>}
                  />
               </div>
            </Section>

          </div>

          {/* --- RIGHT COLUMN: BILL (Sticky) --- */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
             <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                   <h2 className="font-bold text-slate-900 text-lg">Order Summary</h2>
                   <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Printer className="w-3 h-3" /> {shopData?.name}
                   </p>
                </div>
                
                <div className="p-6 space-y-4">
                   <SummaryRow label="Pages" value={countingPages ? 'Calculating...' : pageCount.toString()} />
                   <SummaryRow label="Copies" value={settings.copies.toString()} />
                   <SummaryRow label="Print Mode" value={settings.color === 'bw' ? 'Black & White' : 'Color'} />
                   
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Sides</span>
                      <span className={`font-medium ${isDoubleSided ? 'text-green-600' : 'text-slate-900'}`}>
                        {isDoubleSided ? 'Double Sided (-20%)' : 'Single Sided'}
                      </span>
                   </div>
                   
                   <div className="flex justify-between items-center text-sm py-2 px-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
                      <span className="flex items-center gap-2"><Sheet className="w-4 h-4"/> Paper Required</span>
                      <span>{countingPages ? '...' : sheetsUsed} Sheets</span>
                   </div>

                   <div className="my-4 border-t border-dashed border-slate-200"></div>
                   
                   <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                         <span>Printing ({totalFaces} faces)</span>
                         <span>₹{rawPrintCost}</span>
                      </div>
                      
                      {isDoubleSided && (
                        <div className="flex justify-between text-green-600">
                           <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Double-Side Discount</span>
                           <span>-₹{Math.floor(savingsAmount)}</span>
                        </div>
                      )}

                      {bindingPrice > 0 && (
                         <div className="flex justify-between">
                            <span>Binding ({settings.binding})</span>
                            <span>₹{bindingPrice}</span>
                         </div>
                      )}
                   </div>

                   <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-lg">Total Bill</span>
                      <span className="font-bold text-blue-600 text-2xl">
                        {countingPages ? '...' : `₹${totalCost}`}
                      </span>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                   <button 
                      onClick={handleContinue} 
                      disabled={processing || countingPages}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                      {processing ? <Loader2 className="w-5 h-5 animate-spin"/> : <CreditCard className="w-5 h-5"/>}
                      {processing ? 'Processing...' : 'Proceed to Pay'}
                   </button>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  )
}

// --- Subcomponents ---

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function Section({ title, icon, children }: SectionProps) {
   return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
         <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
         </div>
         {children}
      </div>
   )
}

interface OptionButtonProps {
  selected: boolean
  onClick: () => void
  title: string
  subtitle: string
  icon: React.ReactNode
}

function OptionButton({ selected, onClick, title, subtitle, icon }: OptionButtonProps) {
   return (
      <button 
         onClick={onClick}
         className={`p-4 rounded-xl border-2 text-left transition-all relative flex items-center gap-4 w-full ${
            selected 
            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' 
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
         }`}
      >
         <div className="shrink-0">{icon}</div>
         <div>
            <p className={`font-bold ${selected ? 'text-blue-700' : 'text-slate-900'}`}>{title}</p>
            <p className="text-sm text-slate-500">{subtitle}</p>
         </div>
         {selected && (
            <div className="absolute top-3 right-3 text-blue-600">
               <Check className="w-5 h-5" />
            </div>
         )}
      </button>
   )
}

interface BindingOptionProps {
  selected: boolean
  onClick: () => void
  label: string
  price: string
  icon: React.ReactNode
}

function BindingOption({ selected, onClick, label, price, icon }: BindingOptionProps) {
   return (
      <button 
         onClick={onClick}
         className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 w-full ${
            selected 
            ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 text-blue-700' 
            : 'border-slate-200 hover:border-slate-300 text-slate-600'
         }`}
      >
         <div className={`${selected ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</div>
         <div>
             <p className="font-bold text-sm text-slate-900">{label}</p>
             <p className="text-xs text-slate-500 mt-1 font-medium">{price}</p>
         </div>
      </button>
   )
}

function SummaryRow({ label, value }: { label: string, value: string }) {
   return (
      <div className="flex justify-between items-center text-sm">
         <span className="text-slate-500">{label}</span>
         <span className="font-medium text-slate-900">{value}</span>
      </div>
   )
}