"use client";
import { QRCodeSVG } from "qrcode.react";

export default function UpiQr() {
  // CONFIGURATION
  const upiId = "tanmaymevada24@oksbi"; // <--- PUT YOUR REAL UPI ID HERE
  const name = "Print Link Admin";
  const amount = "1"; // <--- Locks the amount to ₹40
  
  // Standard UPI String format
  const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="p-4 border-2 border-dashed border-blue-200 rounded-xl bg-white">
        <QRCodeSVG 
          value={upiUrl} 
          size={180}
          level="H" 
        />
      </div>
      <p className="text-sm text-slate-500 mt-4 text-center">
        Scan with any UPI App <br/>
        (GPay, PhonePe, Paytm)
      </p>
    </div>
  );
}