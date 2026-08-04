import type { VoroforceCell } from '../types'

export type AdData = Record<string, string | number>
export type AdBatch = AdData[]
export type AdBatches = Map<number, AdBatch>

const AD_INFO_BASE_URL = import.meta.env.VITE_Ad_INFO_BASE_URL ?? '/json'

const AD_DUMMY_POSTERS = [
  'ad_dummy_01.jpg',
  'ad_dummy_02.jpg',
  'ad_dummy_03.jpg',
  'ad_dummy_04.jpg',
  'ad_dummy_05.jpg',
  'ad_dummy_06.jpg',
]

export class Ad {
  tmdbId: number
  imdbId?: string
  title: string
  tagline?: string
  overview?: string
  genres?: string[]
  year: number
  rating: number
  popularity: number
  poster: string
  backdrop: string

  constructor(data: AdData) {
    this.tmdbId = Number(data.id)
    this.imdbId = data.imdb_id ? String(data.imdb_id) : undefined
    this.title = String(data.title)
    this.tagline = data.tagline ? String(data.tagline) : undefined
    this.overview = data.overview ? String(data.overview) : undefined
    this.genres = data.genres ? String(data.genres).split(', ') : undefined
    this.year = Number(data.release_year)
    this.rating = Number(data.vote_average) * 10
    this.popularity = Number(data.popularity)
    const posterIndex = Number(data.id)
    this.poster = AD_DUMMY_POSTERS[
      Number.isFinite(posterIndex)
        ? posterIndex % AD_DUMMY_POSTERS.length
        : 0
    ]
    this.backdrop = String(data.backdrop_path)
  }
}

const SUBGRID_SIZE = 18 * 12

const createDummyAdData = (batchIndex = 0, batchItemIndex = 0) => {
  const id = batchIndex * SUBGRID_SIZE + batchItemIndex
  const poster = AD_DUMMY_POSTERS[id % AD_DUMMY_POSTERS.length]

  return {
    id,
    imdb_id: `tt${String(id).padStart(7, '0')}`,
    title: `Ad #${id + 1}`,
    tagline: 'Sponsored content',
    overview: 'A placeholder advertisement for testing dummy assets.',
    genres: 'Drama, Fantasy',
    release_year: 2024,
    vote_average: 7.5,
    popularity: 100 + batchIndex,
    backdrop_path: '/dummy-ads/ad_dummy_01.jpg',
    poster,
  }
}

const createDummyAdBatch = (batchIndex = 0) =>
  Array.from({ length: SUBGRID_SIZE }, (_, index) =>
    createDummyAdData(batchIndex, index),
  )

const loadCellAdBatch = async (batchIndex: number) => {
  const url = `${AD_INFO_BASE_URL}/${batchIndex}.json`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Invalid ad batch response format')
    }
    return data
  } catch (error) {
    console.warn('Failed to load ad batch:', { batchIndex, url, error })
    return createDummyAdBatch(batchIndex)
  }
}

export const getCellAd = async (
  cell: VoroforceCell,
  adBatches: AdBatches,
) => {
  if (!cell) return
  const batchIndex = Number.isFinite(cell.subgrid) ? cell.subgrid : 0
  const cellIndex = Number.isFinite(cell.subgridIndex)
    ? cell.subgridIndex
    : 0

  let adBatch = adBatches.get(batchIndex)
  if (!adBatch) {
    adBatch = await loadCellAdBatch(batchIndex)
    adBatches.set(batchIndex, adBatch ?? createDummyAdBatch(batchIndex))
  }

  return adBatch?.[cellIndex]
    ? new Ad(adBatch[cellIndex])
    : new Ad(createDummyAdData(batchIndex, cellIndex))
}
