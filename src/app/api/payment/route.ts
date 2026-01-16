import { NextResponse } from "next/server";
import { createHash } from "crypto";

// PayU lite endpoint: generate txnid + hash and return UPI deep link for manual UPI payments
export async function POST(request: Request) {
  // Ensure PayU credentials are set
  const key = process.env.PAYU_MERCHANT_KEY
  const salt = process.env.PAYU_SALT

  if (!key || !salt) {
    console.error("❌ ERROR: PayU keys missing in .env.local (PAYU_MERCHANT_KEY / PAYU_SALT)");
    return NextResponse.json({ error: "Server Error: PayU keys are missing." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const amount = body.amount || body.totalAmount
    const firstname = body.firstname || "Customer"
    const email = body.email || "no-reply@printlink.local"

    if (!amount) {
      return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
    }

    // Create a transaction id
    const txnid = 'txn_' + Math.random().toString(36).substring(2, 12)
    const productinfo = 'Print Link Order'

    // PayU hash string format: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`
    const hash = createHash('sha512').update(hashString).digest('hex')

    // UPI deep link using supplied UPI id (we default to the requested ID for QR)
    const upiId = process.env.PAYU_UPI_ID || 'tanmaymevada24@oksbi'
    const upiName = process.env.PAYU_UPI_NAME || 'Print Link Admin'
    const amountStr = Number(amount).toFixed(2)
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amountStr}&cu=INR`

    return NextResponse.json(
      {
        merchantKey: key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        hash,
        upiUrl,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ PAYU ERROR:', err)
    return NextResponse.json({ error: 'Failed to generate PayU transaction' }, { status: 500 })
  }
}