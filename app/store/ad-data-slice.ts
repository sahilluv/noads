import type { StateCreator } from 'zustand'
import type { Ad, AdBatch, AdData } from '../vf'
import type { VoroforceCell } from '../vf/types'

export interface AdDataSlice {
  ad?: Ad
  hoveredCell?: VoroforceCell
  setAd: (ad?: Ad, cell?: VoroforceCell) => void
  adBatches: Map<number, AdData[]>
}

export const createAdDataSlice: StateCreator<
  AdDataSlice,
  [],
  [],
  AdDataSlice
> = (set) => ({
  setAd: (ad?: Ad, cell?: VoroforceCell) => set({ ad, hoveredCell: cell }),
  adBatches: new Map<number, AdBatch>(),
})
