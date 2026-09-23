export type {
  ContentDestination,
  GenerateAndPublishInput,
  GenerateAndPublishResult,
  GeneratedArticle,
  MetaPublishResult,
} from '@/lib/content-automation/types'
export { CONTENT_DESTINATIONS, isContentDestination } from '@/lib/content-automation/types'
export { generateArticleContent } from '@/lib/content-automation/generate'
export { saveGeneratedPost } from '@/lib/content-automation/save-post'
export {
  publishSocialBundle,
  publishToFacebook,
  publishToInstagram,
} from '@/lib/content-automation/meta-publish'
export { coverImageForDestination, siteOrigin } from '@/lib/content-automation/covers'
