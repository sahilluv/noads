import type { StateCreator } from 'zustand'
import type { Ad, AdBatch, AdData } from '../vf'

export interface AdDataSlice {
  ad?: Ad
  setAd: (ad?: Ad) => void
  adBatches: Map<number, AdData[]>
}

export const createAdDataSlice: StateCreator<
  AdDataSlice,
  [],
  [],
  AdDataSlice
> = (set) => ({
  setAd: (ad?: Ad) => set({ ad }),
  adBatches: new Map<number, AdBatch>(),
})
