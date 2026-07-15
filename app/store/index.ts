import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { type AdDataSlice, createAdDataSlice } from './ad-data-slice'
import { type UiSlice, createUiSlice } from './ui-slice'
import { type VoroforceSlice, createEngineSlice } from './voroforce-slice'
import { type PortfolioSlice, createPortfolioSlice } from './portfolio-slice'

export type StoreState = UiSlice & VoroforceSlice & AdDataSlice & PortfolioSlice

export const store = create(
  subscribeWithSelector<StoreState>((...a) => ({
    ...createUiSlice(...a),
    ...createEngineSlice(...a),
    ...createAdDataSlice(...a),
    ...createPortfolioSlice(...a),
  })),
)

export const useShallowState = <U>(selector: (state: StoreState) => U) =>
  store(useShallow(selector))

// Re-export slice types for convenience
export type { AdDataSlice, VoroforceSlice, UiSlice, PortfolioSlice }

// Export selectors
export * from './selectors'
