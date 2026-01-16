"use client";

import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpiQr from "@/components/UpiQr"; // Import the component we just made

export default function PaymentPage() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);

  const AMOUNT = 40;

  const handleManualVerify = () => {
    setVerifying(true);

    // SIMULATE SERVER VERIFICATION (Fake Delay)
    // In a real app, you would check your bank API here.
    // For Hackathon, we trust the user.
    setTimeout(() => {
      setVerifying(false);
      router.push("/success"); // Redirect to Success Page
    }, 2500); // 2.5 second delay to look "real"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
      
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center relative">
          <Link href="/" className="absolute left-6 top-6 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-slate-400 text-sm">Order #PL-8291</p>
        </div>

        <div className="p-8 flex flex-col items-center">
          
          {/* Price Tag */}
          <div className="mb-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
            <h2 className="text-4xl font-bold text-slate-900">₹{AMOUNT}</h2>
          </div>

          {/* QR Code */}
          <UpiQr />

          {/* Verification Button */}
          <div className="w-full space-y-3">
            <button 
              onClick={handleManualVerify}
              disabled={verifying}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> I Have Paid ₹{AMOUNT}
                </>
              )}
            </button>
            
            <p className="text-xs text-center text-slate-400 leading-relaxed px-4">
              <ShieldCheck className="w-3 h-3 inline mr-1" />
              Click the button above only after the payment is successful on your phone.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}