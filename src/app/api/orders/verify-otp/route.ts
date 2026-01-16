import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize a separate Supabase client with the service role key for privileged access
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { uploadId, otp } = await request.json()

    if (!uploadId || !otp) {
      return NextResponse.json({ error: 'Upload ID and OTP are required' }, { status: 400 })
    }

    // Fetch the order from the database
    const { data: upload, error: fetchError } = await supabaseService
      .from('uploads')
      .select('pickup_otp, status')
      .eq('id', uploadId)
      .single()

    if (fetchError || !upload) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if the order is in the correct status
    if (upload.status !== 'completed') {
      return NextResponse.json({ error: 'Order is not ready for pickup' }, { status: 400 })
    }

    // Check if the OTP matches
    if (upload.pickup_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Update the order status to 'done'
    const { data, error: updateError } = await supabaseService
      .from('uploads')
      .update({ status: 'done', pickup_otp: null }) // Clear the OTP after successful verification
      .eq('id', uploadId)
      .select()
      .single()

    if (updateError) {
      console.error('Supabase error updating status:', updateError)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    // Send email notifications
    try {
      const { user_id, shop_id, file_name } = data
      
      const { data: shopData, error: shopError } = await supabaseService
        .from('shops')
        .select('name, owner_id')
        .eq('id', shop_id)
        .single()
      
      if (shopError || !shopData) {
        console.error('Shop not found:', shopError)
      } else {
        const { data: shopOwner, error: ownerError } =
          await supabaseService.auth.admin.getUserById(shopData.owner_id)
        const { data: user, error: userError } =
          await supabaseService.auth.admin.getUserById(user_id)

        if (ownerError || !shopOwner) {
          console.error('Shop owner not found:', ownerError)
        } else if (userError || !user) {
          console.error('User not found:', userError)
        } else {
          const { transporter } = await import('@/utils/nodemailer')
          const shopOwnerName =
            shopOwner.user.user_metadata?.full_name || 'Shop Owner'
          const userName = user.user.user_metadata?.full_name || 'Customer'
          // Email to user
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.user.email,
            subject: 'File Collected!',
            html: `
              <h1>Collection Confirmed</h1>
              <p>Hi ${userName},</p>
              <p>You have successfully collected your file "<b>${file_name}</b>" from <b>${shopData.name}</b>.</p>
              <p>Thank you for using our service!</p>
            `,
          })

          // Email to shopkeeper
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: shopOwner.user.email,
            subject: 'Order Collected by Customer',
            html: `
              <h1>Order Collected</h1>
              <p>Hi ${shopOwnerName},</p>
              <p>The order for file "<b>${file_name}</b>" has been collected by <b>${userName}</b>.</p>
              <p>The order status has been updated to 'done'.</p>
            `,
          })
        }
      }
    } catch (emailError) {
      console.error('Failed to send emails:', emailError)
    }

    return NextResponse.json({ success: true, updatedOrder: data })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}