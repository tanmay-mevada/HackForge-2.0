import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { uploadId, shopId, status } = await request.json()

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update upload with shop_id and/or status
    const updateData: { shop_id?: string; status?: string } = {}
    if (shopId) updateData.shop_id = shopId
    if (status) updateData.status = status

    const { error } = await supabase
      .from('uploads')
      .update(updateData)
      .eq('id', uploadId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, uploadId, shopId, status })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
