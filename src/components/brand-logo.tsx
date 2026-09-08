import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  href?: string | null
  variant?: 'full' | 'mark'
  className?: string
  priority?: boolean
}

/** Intrinsic pixel sizes of /brand assets (cropped logo is ~16:9). */
const sizes = {
  full: { width: 962, height: 542, className: 'h-12 w-auto' },
  mark: { width: 128, height: 128, className: 'h-10 w-10' },
} as const

export function BrandLogo({
  href = '/',
  variant = 'full',
  className,
  priority = false,
}: BrandLogoProps) {
  const size = sizes[variant]
  const src = variant === 'full' ? '/brand/logo.png' : '/brand/icon.png'
  const alt =
    variant === 'full' ? 'SportsEvents.app' : 'SportsEvents.app icon'

  const image = (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      priority={priority}
      sizes="(max-width: 768px) 96vw, 900px"
      className={cn(size.className, 'object-contain', className)}
    />
  )

  if (!href) return image

  return (
    <Link
      href={href}
      className="inline-flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-md"
      aria-label="SportsEvents.app"
    >
      {image}
    </Link>
  )
}
