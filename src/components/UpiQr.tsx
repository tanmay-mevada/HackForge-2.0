"use client";
import { QRCodeSVG } from "qrcode.react";

type UpiQrProps = {
  amount?: number | string
  upiId?: string
  name?: string
}

export default function UpiQr({ amount, upiId = "aumghodasara15@okhdfcbank", name = "Print Link Admin" }: UpiQrProps) {
  // If amount is provided, format to two decimals
  const amountStr = amount !== undefined && amount !== null ? Number(amount).toFixed(2) : undefined

  // Standard UPI String format. Include amount only when provided so scanners pick it up.
  const upiUrl = amountStr
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amountStr}&cu=INR`
    : `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&cu=INR`

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
      {amountStr && (
        <p className="mt-2 text-sm font-semibold text-slate-900">Pay ₹{amountStr} to {upiId}</p>
      )}
    </div>
  );
}