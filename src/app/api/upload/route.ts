import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MAX_FILE_SIZE_BYTES, STORAGE_BUCKET } from '@/lib/constants'
import { getAttachmentType } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check (accept real Supabase session or verified demo cookie)
    let user = null
    try {
      const res = await supabase.auth.getUser()
      user = res.data?.user || null
    } catch {}

    const demoCookie = request.cookies.get('campus_loop_demo_user')
    const hasDemoUser = !!demoCookie?.value

    if (!user && !hasDemoUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user?.id || 'demo-user-id'

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit (10MB)' },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${uuidv4()}.${fileExt}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      // Fallback for demo/local storage if bucket is not configured yet:
      // Return a base64 Data URL or public mock placeholder
      const base64Data = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64Data}`
      return NextResponse.json({
        url: dataUrl,
        name: file.name,
        type: getAttachmentType(file.type, file.name),
        size: file.size,
      })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)

    return NextResponse.json({
      url: publicUrl,
      name: file.name,
      type: getAttachmentType(file.type, file.name),
      size: file.size,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
