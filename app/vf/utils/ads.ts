import type { VoroforceCell } from '../types'

export type AdData = Record<string, string | number>
export type AdBatch = AdData[]
export type AdBatches = Map<number, AdBatch>

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
    this.poster = String(data.poster_path)
    this.backdrop = String(data.backdrop_path)
  }
}

const loadCellAdBatch = async (batchIndex: number) => {
  const url = `${import.meta.env.VITE_Ad_INFO_BASE_URL}/${batchIndex}.json`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.log('batchIndex', batchIndex)
    console.error('Error loading JSON:', error)
  }
}

export const getCellAd = async (
  cell: VoroforceCell,
  adBatches: AdBatches,
) => {
  if (!cell) return
  let adBatch = adBatches.get(cell.subgrid)
  if (!adBatch) {
    adBatch = await loadCellAdBatch(cell.subgrid)
    adBatches.set(cell.subgrid, adBatch ?? [])
  }

  return adBatch?.[cell.subgridIndex]
    ? new Ad(adBatch[cell.subgridIndex])
    : undefined
}
