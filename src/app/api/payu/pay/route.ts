import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const firstname = String(form.get('firstname') || 'Customer')
    const email = String(form.get('email') || 'no-reply@printlink.local')
    const amount = String(form.get('amount') || form.get('totalAmount') || '0')
    const productinfo = String(form.get('productinfo') || 'Print Link Order')
    let txnid = String(form.get('txnid') || '')

    // Ensure PayU credentials are present
    const key = process.env.PAYU_MERCHANT_KEY
    const salt = process.env.PAYU_SALT
    const PAYU_TEST_URL = process.env.PAYU_TEST_URL || 'https://test.payu.in/_payment'

    if (!key || !salt) {
      console.error('Missing PAYU_MERCHANT_KEY or PAYU_SALT')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // Ensure a fresh txnid when not provided
    if (!txnid) txnid = 'txn_' + Math.random().toString(36).substring(2, 12)

    // Hash string per PayU requirement
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`
    const hash = createHash('sha512').update(hashString).digest('hex')

    // Construct HTML that auto-submits to PayU
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting to PayU</title>
  </head>
  <body onload="document.forms[0].submit()">
    <center><h3>Redirecting to PayU Secure Gateway...</h3></center>
    <form action="${PAYU_TEST_URL}" method="post">
      <input type="hidden" name="key" value="${key}" />
      <input type="hidden" name="txnid" value="${txnid}" />
      <input type="hidden" name="amount" value="${amount}" />
      <input type="hidden" name="productinfo" value="${productinfo}" />
      <input type="hidden" name="firstname" value="${escapeHtml(firstname)}" />
      <input type="hidden" name="email" value="${escapeHtml(email)}" />
      <input type="hidden" name="phone" value="${String(form.get('phone') || '9999999999')}" />
      <input type="hidden" name="surl" value="${String(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}/api/payu/success" />
      <input type="hidden" name="furl" value="${String(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}/api/payu/failure" />
      <input type="hidden" name="hash" value="${hash}" />
      <!-- pass through any metadata for your app -->
      <input type="hidden" name="udf1" value="${escapeHtml(String(form.get('uploadId') || ''))}" />
      <input type="hidden" name="udf2" value="${escapeHtml(String(form.get('shopId') || ''))}" />
    </form>
    <p>If you are not redirected automatically, <button onclick="document.forms[0].submit()">click here</button>.</p>
  </body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    console.error('PAYU /pay error', err)
    return NextResponse.json({ error: 'Failed to prepare PayU payment' }, { status: 500 })
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
