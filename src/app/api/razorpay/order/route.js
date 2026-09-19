import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount, targetAction } = await req.json();

    // अगर अभी टेस्ट कीज नहीं हैं तो डमी ऑर्डर रिटर्न होगा
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({
        id: "order_mock_" + Date.now(),
        amount: (amount || 49) * 100,
        currency: "INR",
        mock: true,
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: (amount || 49) * 100, // पैसे में (₹49 = 4900 paise)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { item: targetAction || "PDF Download" },
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "ऑर्डर तैयार करने में समस्या आई" },
      { status: 500 }
    );
  }
}