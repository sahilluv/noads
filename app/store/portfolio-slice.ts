import type { StateCreator } from 'zustand'

export interface PortfolioCell {
  price: number
  imageUrl?: string
}

export interface PortfolioSlice {
  balance: number
  ownedCells: Record<number, PortfolioCell>
  buyCell: (index: number, price: number) => void
  setCellImage: (index: number, imageUrl: string) => void
}

export const createPortfolioSlice: StateCreator<
  PortfolioSlice,
  [],
  [],
  PortfolioSlice
> = (set) => ({
  balance: 1000000,
  ownedCells: {},
  buyCell: (index, price) =>
    set((state) => {
      if (state.balance >= price && !state.ownedCells[index]) {
        return {
          balance: state.balance - price,
          ownedCells: {
            ...state.ownedCells,
            [index]: { price },
          },
        }
      }
      return state
    }),
  setCellImage: (index, imageUrl) =>
    set((state) => {
      if (state.ownedCells[index]) {
        return {
          ownedCells: {
            ...state.ownedCells,
            [index]: { ...state.ownedCells[index], imageUrl },
          },
        }
      }
      return state
    }),
})
