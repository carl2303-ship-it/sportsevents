import { NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/admin-auth'
import { generateArticleContent } from '@/lib/content-automation/generate'
import { saveGeneratedPost } from '@/lib/content-automation/save-post'
import { publishSocialBundle } from '@/lib/content-automation/meta-publish'
import { siteOrigin } from '@/lib/content-automation/covers'
import {
  isContentDestination,
  type GenerateAndPublishInput,
  type GenerateAndPublishResult,
} from '@/lib/content-automation/types'

export const runtime = 'nodejs'
export const maxDuration = 120

async function authorize(request: Request) {
  const secret = process.env.CONTENT_API_SECRET?.trim()
  const header =
    request.headers.get('authorization') ||
    request.headers.get('x-content-secret') ||
    ''

  if (secret) {
    const bearer = header.startsWith('Bearer ')
      ? header.slice(7).trim()
      : header.trim()
    if (bearer && bearer === secret) {
      return { ok: true as const }
    }
  }

  const auth = await requireStaffUser()
  if (auth.error || !auth.user) {
    return {
      ok: false as const,
      status: auth.status || 401,
      error: auth.error || 'Não autenticado',
    }
  }
  return { ok: true as const }
}

export async function POST(request: Request) {
  const gate = await authorize(request)
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status })
  }

  let body: GenerateAndPublishInput
  try {
    body = (await request.json()) as GenerateAndPublishInput
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const topic = String(body.topic || '').trim()
  const destination = String(body.target_destination || '').trim()
  const autoPublish = Boolean(body.auto_publish_social)

  if (!topic) {
    return NextResponse.json({ error: 'topic é obrigatório.' }, { status: 400 })
  }
  if (!isContentDestination(destination)) {
    return NextResponse.json(
      {
        error:
          'target_destination inválido. Use: Marbella | Algarve | Barcelona',
      },
      { status: 400 }
    )
  }

  const result: GenerateAndPublishResult = {
    success: false,
    instagram_published: false,
    facebook_published: false,
    errors: {},
  }

  let article
  try {
    article = await generateArticleContent({
      topic,
      destination,
    })
  } catch (e) {
    result.errors!.generation =
      e instanceof Error ? e.message : 'Falha na geração IA'
    return NextResponse.json(result, { status: 502 })
  }

  result.social_caption = article.social_caption

  let saved
  try {
    saved = await saveGeneratedPost({
      article,
      destination,
    })
  } catch (e) {
    result.errors!.blog =
      e instanceof Error ? e.message : 'Falha ao gravar no Supabase'
    return NextResponse.json(result, { status: 500 })
  }

  const origin = siteOrigin()
  const blogUrl = `${origin}/blog/${saved.slug}`
  result.blog_post_id = saved.id
  result.blog_post_url = blogUrl
  result.slug = saved.slug

  if (autoPublish) {
    const cover = saved.cover_image
    if (!cover) {
      result.errors!.instagram = 'Sem cover_image para Instagram.'
      result.errors!.facebook = 'Sem cover_image (Facebook feed usa caption+link).'
    }

    const social = await publishSocialBundle({
      caption:
        article.social_caption ||
        `${article.title}\n\nRead more: ${blogUrl}`,
      imageUrl: cover || `${origin}/brand/logo.png`,
      blogUrl,
    })

    result.instagram_published = social.instagram_published
    result.facebook_published = social.facebook_published
    if (social.instagram_error) result.errors!.instagram = social.instagram_error
    if (social.facebook_error) result.errors!.facebook = social.facebook_error
  }

  result.success = true
  const partialSocialFail =
    autoPublish &&
    (!result.instagram_published || !result.facebook_published)

  return NextResponse.json(result, {
    status: partialSocialFail ? 207 : 200,
  })
}
