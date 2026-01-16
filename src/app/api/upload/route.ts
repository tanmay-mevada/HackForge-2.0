import { type NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

const supabaseService = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user: uploadingUser },
    } = await supabase.auth.getUser()

    if (!uploadingUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const shopId = formData.get('shopId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!shopId) {
      return NextResponse.json({ error: 'No shop selected' }, { status: 400 })
    }

    // Validate file type (PDF, DOC, DOCX, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF, Word and Excel documents allowed.',
        },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 10MB allowed.' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${sanitizedFileName}`
    const filePath = `${uploadingUser.id}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, Buffer.from(buffer), {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Save file metadata to database
    const { data: uploadRecord, error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: uploadingUser.id,
        shop_id: shopId,
        file_name: file.name,
        file_size: file.size,
        storage_path: filePath,
        status: 'pending_payment',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      )
    }

    // Send email notifications
    try {
      const { data: shopData, error: shopError } = await supabaseService
        .from('shops')
        .select('name, owner_id')
        .eq('id', shopId)
        .single()

      if (shopError || !shopData) {
        console.error('Shop not found:', shopError)
        // We don't want to fail the whole request if email fails
      } else {
        const { data: shopOwner, error: ownerError } =
          await supabaseService.auth.admin.getUserById(shopData.owner_id)

        if (ownerError || !shopOwner) {
          console.error('Shop owner not found:', ownerError)
        } else {
          const { transporter } = await import('@/utils/nodemailer')
          const shopOwnerName =
            shopOwner.user.user_metadata?.full_name || 'Shop Owner'
          const userName = uploadingUser.user_metadata?.full_name || 'Customer'
          // Email to user
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: uploadingUser.email,
            subject: 'Your file has been uploaded!',
            html: `
              <h1>Upload Successful</h1>
              <p>Hi ${userName},</p>
              <p>Your file "<b>${file.name}</b>" has been successfully uploaded and sent to <b>${shopData.name}</b>.</p>
              <p>You will be notified again once your document is ready for pickup.</p>
              <p>Thank you for using our service!</p>
            `,
          })

          // Email to shopkeeper
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: shopOwner.user.email,
            subject: 'You have a new print order!',
            html: `
              <h1>New Order</h1>
              <p>Hi ${shopOwnerName},</p>
              <p>A new order has been placed by <b>${userName}</b>.</p>
              <p>File name: <b>${file.name}</b></p>
              <p>Please check your dashboard for details.</p>
            `,
          })
        }
      }
    } catch (emailError) {
      console.error('Failed to send emails:', emailError)
    }

    return NextResponse.json({
      success: true,
      uploadId: uploadRecord.id,
      fileName: file.name,
      fileSize: file.size,
      message: 'File uploaded successfully',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}