import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { uploadId } = await request.json()

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get upload file path
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('file_path, file_name')
      .eq('id', uploadId)
      .single()

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for download
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(upload.file_path, 3600) // Valid for 1 hour

    if (error) {
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl,
      fileName: upload.file_name,
    })
  } catch (error) {
    console.error('Error generating download link:', error)
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    )
  }
}
