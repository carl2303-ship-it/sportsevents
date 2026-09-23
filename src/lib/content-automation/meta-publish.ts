import type { MetaPublishResult } from '@/lib/content-automation/types'

const GRAPH = 'https://graph.facebook.com/v19.0'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function metaConfig() {
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN?.trim()
  const pageId = process.env.META_PAGE_ID?.trim()
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim()

  return {
    pageToken,
    pageId,
    igUserId,
    ok: Boolean(pageToken && pageId),
    igOk: Boolean(pageToken && igUserId),
  }
}

async function graphPost(
  path: string,
  body: Record<string, string>
): Promise<Record<string, unknown>> {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })
  const data = (await res.json()) as Record<string, unknown>
  if (!res.ok || data.error) {
    const err = data.error as { message?: string } | undefined
    throw new Error(err?.message || `Meta Graph error (${res.status})`)
  }
  return data
}

async function waitForIgContainer(
  creationId: string,
  accessToken: string
): Promise<void> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const res = await fetch(
      `${GRAPH}/${creationId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`
    )
    const data = (await res.json()) as {
      status_code?: string
      error?: { message?: string }
    }
    if (data.error?.message) throw new Error(data.error.message)
    if (data.status_code === 'FINISHED') return
    if (data.status_code === 'ERROR') {
      throw new Error('Instagram media container failed processing.')
    }
    await sleep(2000)
  }
  // Soft continue — some accounts publish without FINISHED in time
}

export async function publishToInstagram(opts: {
  imageUrl: string
  caption: string
}): Promise<{ mediaId: string }> {
  const { pageToken, igUserId, igOk } = metaConfig()
  if (!igOk || !pageToken || !igUserId) {
    throw new Error(
      'Meta Instagram incompleto: META_PAGE_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID.'
    )
  }

  const created = await graphPost(`${igUserId}/media`, {
    image_url: opts.imageUrl,
    caption: opts.caption.slice(0, 2200),
    access_token: pageToken,
  })

  const creationId = String(created.id || '')
  if (!creationId) throw new Error('Instagram não devolveu creation_id.')

  await waitForIgContainer(creationId, pageToken)

  const published = await graphPost(`${igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: pageToken,
  })

  const mediaId = String(published.id || '')
  if (!mediaId) throw new Error('Instagram media_publish sem id.')
  return { mediaId }
}

export async function publishToFacebook(opts: {
  message: string
  link: string
}): Promise<{ postId: string }> {
  const { pageToken, pageId, ok } = metaConfig()
  if (!ok || !pageToken || !pageId) {
    throw new Error(
      'Meta Facebook incompleto: META_PAGE_ACCESS_TOKEN + META_PAGE_ID.'
    )
  }

  const posted = await graphPost(`${pageId}/feed`, {
    message: opts.message.slice(0, 5000),
    link: opts.link,
    access_token: pageToken,
  })

  const postId = String(posted.id || '')
  if (!postId) throw new Error('Facebook feed sem id.')
  return { postId }
}

export async function publishSocialBundle(opts: {
  caption: string
  imageUrl: string
  blogUrl: string
}): Promise<MetaPublishResult> {
  const result: MetaPublishResult = {
    instagram_published: false,
    facebook_published: false,
    instagram_media_id: null,
    facebook_post_id: null,
    instagram_error: null,
    facebook_error: null,
  }

  try {
    const ig = await publishToInstagram({
      imageUrl: opts.imageUrl,
      caption: opts.caption,
    })
    result.instagram_published = true
    result.instagram_media_id = ig.mediaId
  } catch (e) {
    result.instagram_error =
      e instanceof Error ? e.message : 'Erro Instagram desconhecido'
  }

  try {
    const fb = await publishToFacebook({
      message: opts.caption,
      link: opts.blogUrl,
    })
    result.facebook_published = true
    result.facebook_post_id = fb.postId
  } catch (e) {
    result.facebook_error =
      e instanceof Error ? e.message : 'Erro Facebook desconhecido'
  }

  return result
}
