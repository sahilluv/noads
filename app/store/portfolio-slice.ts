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
> = (set) => {
  const initialOwnedCells: Record<number, PortfolioCell> = {}
  const ads = ['/assets/nike_ad.jpg', '/assets/apple_ad.jpg', '/assets/tesla_ad.jpg']
  
  // Pre-populate ~33% of cells with ads to show a bustling grid
  for (let i = 0; i < 15000; i++) {
    if (i % 3 === 0) {
      initialOwnedCells[i] = {
        price: 100,
        totalPaid: 100,
        business: {
          name: 'Sponsor ' + i,
          email: 'sponsor@example.com',
          hasVideo: false,
          imageUrl: ads[(i / 3) % ads.length]
        }
      }
    }
  }

  return {
    balance: 1000000,
    ownedCells: initialOwnedCells,
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
  }
}
