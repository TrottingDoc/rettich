'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { Recipe } from '@/lib/types'

type UnsplashImage = {
  url: string
  alt: string
  photographerName: string
  photographerUrl: string
  photoUrl: string
}

type RecipeImageProps = {
  recipe: Recipe
  className?: string
  sizes?: string
  priority?: boolean
}

const FALLBACK_IMAGE = '/image_rettich.png'

export default function RecipeImage({
  recipe,
  className = 'object-cover',
  sizes = '(max-width: 448px) 100vw, 400px',
  priority = false,
}: RecipeImageProps) {
  const [unsplashImage, setUnsplashImage] = useState<UnsplashImage | null>(null)
  const [failed, setFailed] = useState(false)

  const cacheKey = useMemo(() => `rettich:recipe-image:v2:${recipe.id}`, [recipe.id])
  const src = unsplashImage?.url || FALLBACK_IMAGE
  const alt = unsplashImage?.alt || recipe.title

  useEffect(() => {
    let cancelled = false

    async function loadImage() {
      try {
        const cached = window.localStorage.getItem(cacheKey)
        if (cached) {
          if (!cancelled) setUnsplashImage(JSON.parse(cached) as UnsplashImage)
          return
        }
      } catch {
        // LocalStorage is optional; image lookup still works without it.
      }

      try {
        const params = new URLSearchParams({
          q: recipe.title,
          tags: recipe.tags.join(' '),
        })
        const response = await fetch(`/api/recipe-image?${params.toString()}`)
        if (!response.ok) {
          if (!cancelled) setFailed(true)
          return
        }
        const data = (await response.json()) as { image: UnsplashImage | null }
        if (cancelled) return
        if (!data.image) {
          setFailed(true)
          return
        }
        setUnsplashImage(data.image)
        setFailed(false)
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify(data.image))
        } catch {
          // Ignore cache quota or privacy-mode failures.
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    void loadImage()

    return () => {
      cancelled = true
    }
  }, [cacheKey, recipe.tags, recipe.title])

  return (
    <>
      <Image
        src={failed ? FALLBACK_IMAGE : src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
      />
      {unsplashImage && !failed && (
        <a
          href={unsplashImage.photoUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
        >
          Foto: {unsplashImage.photographerName}
        </a>
      )}
    </>
  )
}
