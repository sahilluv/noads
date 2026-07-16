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

const DUMMY_ADS = [
  { name: 'AuraBrew', img: '/dummy-ads/ad_aurabrew_1784107314892.jpg' },
  { name: 'ChainVault', img: '/dummy-ads/ad_chainvault_1784107345801.jpg' },
  { name: 'NeonTech', img: '/dummy-ads/ad_neontech_1784107303244.jpg' },
  { name: 'PulseForge', img: '/dummy-ads/ad_pulseforge_1784107325882.jpg' },
  { name: 'Vexora', img: '/dummy-ads/ad_vexora_1784107335277.jpg' },
]

const generateMockCells = () => {
  const cells: Record<number, PortfolioCell> = {}
  for (let i = 0; i < 2000; i++) {
    // 80% chance for a cell to be populated with an ad
    if (Math.random() > 0.2) {
      const ad = DUMMY_ADS[Math.floor(Math.random() * DUMMY_ADS.length)]
      cells[i] = {
        price: Math.floor(Math.random() * 50) + 10,
        totalPaid: Math.floor(Math.random() * 50) + 10,
        business: {
          name: ad.name,
          email: 'hello@' + ad.name.toLowerCase() + '.com',
          imageUrl: ad.img,
          hasVideo: false,
        }
      }
    }
  }
  return cells
}

export const createPortfolioSlice: StateCreator<
  PortfolioSlice,
  [],
  [],
  PortfolioSlice
> = (set) => ({
  balance: 1000000,
  ownedCells: generateMockCells(),
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
