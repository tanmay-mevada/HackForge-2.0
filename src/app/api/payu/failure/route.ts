import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const data: Record<string, string> = {}
    form.forEach((v, k) => { data[k] = String(v) })

    const html = `<!doctype html><html><body><h1 style="color:red">Payment Failed</h1><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre></body></html>`

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    console.error('PayU failure handler error', err)
    return NextResponse.json({ error: 'Failed to process failure callback' }, { status: 500 })
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
