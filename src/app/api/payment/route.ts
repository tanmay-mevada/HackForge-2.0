import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  
  // 1. Check if keys are loaded from .env.local
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("❌ ERROR: Keys missing in .env.local file");
    return NextResponse.json(
      { error: "Server Error: Razorpay keys are missing." },
      { status: 500 }
    );
  }

  // 2. Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const { amount } = await request.json();

    // 3. Create the Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });

  } catch (error: any) {
    console.error("❌ RAZORPAY ERROR:", error);
    // Return the specific error from Razorpay (e.g., "Auth Failed")
    return NextResponse.json(
      { error: error.error?.description || "Failed to create order with Razorpay" },
      { status: 500 }
    );
  }
}