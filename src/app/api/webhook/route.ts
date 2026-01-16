
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const secret = "YOUR_WEBHOOK_SECRET"; // You make this up (e.g., "123456")

    // Verify the signal actually came from Razorpay
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature === signature) {
      const event = JSON.parse(body);
      
      if (event.event === "payment.captured") {
        console.log("💰 Payment Success! Order ID:", event.payload.payment.entity.order_id);
        // Database update logic would go here
        return NextResponse.json({ status: "success" }, { status: 200 });
      }
    }

    return NextResponse.json({ status: "invalid_signature" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}