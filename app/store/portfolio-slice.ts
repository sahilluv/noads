import type { StateCreator } from 'zustand'

export interface BusinessInfo {
  name: string
  email: string
  link?: string
  imageUrl?: string
  videoUrl?: string
  hasVideo: boolean
}

export interface PortfolioCell {
  price: number
  totalPaid: number
  business?: BusinessInfo
}

export interface PortfolioSlice {
  balance: number
  ownedCells: Record<number, PortfolioCell>
  buyCell: (index: number, price: number) => void
  completePurchase: (index: number, price: number, totalPaid: number, business: BusinessInfo) => void
  setCellImage: (index: number, imageUrl: string) => void
}

export const createPortfolioSlice: StateCreator<
  PortfolioSlice,
  [],
  [],
  PortfolioSlice
> = (set) => ({
  balance: 1000000,
  ownedCells: Object.fromEntries(
    Array.from({ length: 15 }, (_, i) => {
      // Pick random cell indices between 0 and 200
      const index = Math.floor(Math.random() * 200)
      return [
        index,
        {
          price: 100,
          totalPaid: 100,
          business: {
            name: `Dummy Ad ${i}`,
            email: `dummy${i}@test.com`,
            hasVideo: false,
            // Random cute placeholder image
            imageUrl: `https://picsum.photos/seed/${index}/100/100`,
          },
        },
      ]
    })
  ),
  buyCell: (index, price) =>
    set((state) => {
      if (state.balance >= price && !state.ownedCells[index]) {
        return {
          balance: state.balance - price,
          ownedCells: {
            ...state.ownedCells,
            [index]: { price, totalPaid: price },
          },
        }
      }
      return state
    }),
  completePurchase: (index, price, totalPaid, business) =>
    set((state) => {
      if (!state.ownedCells[index]) {
        return {
          balance: state.balance - totalPaid,
          ownedCells: {
            ...state.ownedCells,
            [index]: { price, totalPaid, business },
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
