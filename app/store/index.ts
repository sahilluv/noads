import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { type AdDataSlice, createAdDataSlice } from './ad-data-slice'
import { type UiSlice, createUiSlice } from './ui-slice'
import { type VoroforceSlice, createEngineSlice } from './voroforce-slice'
import { type PortfolioSlice, createPortfolioSlice } from './portfolio-slice'

export type StoreState = UiSlice & VoroforceSlice & AdDataSlice & PortfolioSlice

import { persist, createJSONStorage } from 'zustand/middleware'

export const store = create<StoreState>()(
  subscribeWithSelector(
    persist(
      (...a) => ({
        ...createUiSlice(...a),
        ...createEngineSlice(...a),
        ...createAdDataSlice(...a),
        ...createPortfolioSlice(...a),
      }),
      {
        name: 'noads-portfolio-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          balance: state.balance,
          ownedCells: state.ownedCells,
        }) as StoreState, // cast needed depending on zustand version
      }
    )
  )
)

export const useShallowState = <U>(selector: (state: StoreState) => U) =>
  store(useShallow(selector))

// Re-export slice types for convenience
export type { AdDataSlice, VoroforceSlice, UiSlice, PortfolioSlice }

// Export selectors
export * from './selectors'
