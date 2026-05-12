import { NextResponse } from 'next/server'

type UnsplashPhoto = {
  alt_description: string | null
  urls: {
    regular: string
  }
  user: {
    name: string
    links: {
      html: string
    }
  }
  links: {
    html: string
  }
}

type UnsplashSearchResponse = {
  results: UnsplashPhoto[]
}

const TITLE_QUERY_HINTS: { match: string; query: string }[] = [
  { match: 'thai-curry', query: 'yellow thai chicken curry' },
  { match: 'thai noodles', query: 'thai chicken noodles' },
  { match: 'risotto', query: 'mushroom risotto' },
  { match: 'sahnehering', query: 'creamed herring potatoes' },
  { match: 'fischfrikadellen', query: 'fish cakes dill sauce' },
  { match: 'bolognaise', query: 'bolognese pasta sauce' },
  { match: 'tortellini', query: 'tortellini casserole' },
  { match: 'vodka-nudeln', query: 'pasta alla vodka' },
  { match: 'pesto rosso', query: 'red pesto pasta' },
  { match: 'kartoffelrolle', query: 'potato roll beef spinach' },
  { match: 'sellerie-schnitzel', query: 'celery root schnitzel' },
  { match: 'general-tso-blumenkohl', query: 'general tso cauliflower' },
  { match: 'knoblauch-hähnchenbrust', query: 'creamy garlic chicken breast' },
  { match: 'pizza', query: 'homemade pizza' },
  { match: 'gurkensalat', query: 'cucumber tomato salad' },
  { match: 'rucola-apfel-salat', query: 'arugula apple salad' },
  { match: 'joghurt-kräuter-dressing', query: 'yogurt herb dressing' },
  { match: 'senf-honig-dressing', query: 'honey mustard dressing' },
  { match: 'rührei', query: 'scrambled eggs toast' },
  { match: 'käsebrot', query: 'cheese tomato sandwich' },
  { match: 'haferbrei', query: 'oatmeal porridge' },
  { match: 'tomatensuppe', query: 'tomato soup' },
  { match: 'linsensuppe', query: 'lentil soup' },
]

const TAG_QUERY_HINTS: Record<string, string> = {
  auflauf: 'casserole',
  brot: 'sandwich',
  butter: 'butter',
  curry: 'curry',
  dressing: 'salad dressing',
  ei: 'eggs',
  fisch: 'fish',
  gemüse: 'vegetable dish',
  hafer: 'oatmeal',
  hähnchen: 'chicken',
  käse: 'cheese',
  kartoffel: 'potato dish',
  milch: 'milk',
  ofengericht: 'baked dish',
  pasta: 'pasta',
  pizza: 'pizza',
  reis: 'rice dish',
  risotto: 'risotto',
  salat: 'salad',
  sauce: 'sauce',
  suppe: 'soup',
  tomate: 'tomato',
  vegan: 'vegan food',
  vegetarisch: 'vegetarian food',
}

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
}

function buildUnsplashQuery(query: string, tags: string | null | undefined): string {
  const normalizedTitle = normalizeForSearch(query)
  const titleHint = TITLE_QUERY_HINTS.find((hint) =>
    normalizedTitle.includes(normalizeForSearch(hint.match)),
  )

  if (titleHint) return `${titleHint.query} food photography`

  const tagHints = (tags ?? '')
    .split(/\s+/)
    .map((tag) => TAG_QUERY_HINTS[tag])
    .filter(Boolean)

  return [query, ...tagHints, 'food photography'].join(' ')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()
  const tags = searchParams.get('tags')?.trim()
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!query || !accessKey) {
    return NextResponse.json({ image: null })
  }

  const searchQuery = buildUnsplashQuery(query, tags)
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchQuery,
      )}&orientation=landscape&per_page=1&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ image: null }, { status: 200 })
    }

    const data = (await response.json()) as UnsplashSearchResponse
    const photo = data.results[0]

    if (!photo) {
      return NextResponse.json({ image: null })
    }

    return NextResponse.json({
      image: {
        url: photo.urls.regular,
        alt: photo.alt_description ?? query,
        photographerName: photo.user.name,
        photographerUrl: `${photo.user.links.html}?utm_source=rettich&utm_medium=referral`,
        photoUrl: `${photo.links.html}?utm_source=rettich&utm_medium=referral`,
      },
    })
  } catch {
    return NextResponse.json({ image: null }, { status: 200 })
  }
}
