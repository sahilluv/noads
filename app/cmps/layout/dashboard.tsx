import { useShallowState } from '../../store'
import { getPrice } from '../../utils/pricing'
import { ChangeEvent } from 'react'
import { Button } from '../ui/button'

export const Dashboard = () => {
  const { balance, ownedCells, buyCell, setCellImage, voroforce } = useShallowState((state) => ({
    balance: state.balance,
    ownedCells: state.ownedCells,
    buyCell: state.buyCell,
    setCellImage: state.setCellImage,
    voroforce: state.voroforce,
  }))

  const selectedCell = voroforce?.cells?.selected

  let selectedPrice = 0
  let isOwned = false
  if (selectedCell) {
    selectedPrice = getPrice(selectedCell.x, selectedCell.y, window.innerWidth, window.innerHeight)
    isOwned = !!ownedCells[selectedCell.index]
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell) return
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setCellImage(selectedCell.index, dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleBuy = () => {
    if (selectedCell) {
      buyCell(selectedCell.index, selectedPrice)
    }
  }

  return (
    <div className="fixed right-4 top-24 bottom-4 w-80 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-6 flex flex-col gap-8 z-40 overflow-y-auto font-sans text-white shadow-2xl">
      <div>
        <h2 className="text-sm uppercase tracking-widest text-white/50 mb-1">Portfolio Balance</h2>
        <div className="text-3xl font-bold font-mono">
          ₹{balance.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h2 className="text-sm uppercase tracking-widest text-white/50 mb-4">Selected Cell</h2>
        
        {!selectedCell ? (
          <p className="text-sm text-white/40 italic">Select a cell in the grid to view details.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/60 font-mono">ID: {selectedCell.index}</span>
              <span className="text-lg font-bold">₹{selectedPrice.toLocaleString('en-IN')}</span>
            </div>
            
            {isOwned ? (
              <div className="mt-2 flex flex-col gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 text-xs text-center py-1 rounded font-bold uppercase tracking-wider border border-emerald-500/30">
                  Owned
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs text-white/60">Upload Custom Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  />
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleBuy} 
                disabled={balance < selectedPrice}
                className="w-full mt-2 bg-white text-black hover:bg-white/90 font-bold"
              >
                Buy Cell
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-sm uppercase tracking-widest text-white/50 mb-4">Your Properties</h2>
        
        {Object.keys(ownedCells).length === 0 ? (
          <p className="text-sm text-white/40 italic">You don't own any cells yet.</p>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto pr-2">
            {Object.entries(ownedCells).map(([index, data]) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded bg-white/10 bg-cover bg-center border border-white/10"
                    style={{ backgroundImage: data.imageUrl ? `url(${data.imageUrl})` : 'none' }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-white/60 font-mono">Cell {index}</span>
                  </div>
                </div>
                <span className="text-sm font-bold">₹{data.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
