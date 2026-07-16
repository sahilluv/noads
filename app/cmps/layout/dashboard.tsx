import { LayoutGrid, TrendingUp, Zap } from 'lucide-react'
import { useShallowState } from '../../store'
import { getPrice } from '../../utils/pricing'
import type { ChangeEvent } from 'react'

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent?: boolean
}) => (
  <div
    className='flex flex-col gap-1 rounded-xl p-3 border'
    style={{
      background: 'rgba(8, 14, 36, 0.7)',
      borderColor: accent ? 'rgba(0, 210, 255, 0.3)' : 'rgba(255,255,255,0.06)',
      boxShadow: accent ? '0 0 12px rgba(0, 210, 255, 0.12)' : 'none',
    }}
  >
    <div className='flex items-center justify-between'>
      <span className='text-[10px] uppercase tracking-widest' style={{ color: 'rgba(180,200,220,0.55)' }}>
        {label}
      </span>
      <span style={{ color: accent ? 'hsl(196, 100%, 55%)' : 'rgba(255,255,255,0.3)' }}>
        {icon}
      </span>
    </div>
    <span
      className='text-xl font-bold font-mono tracking-tight'
      style={{ color: accent ? 'hsl(196, 100%, 60%)' : 'white', fontFamily: "'Space Mono', monospace" }}
    >
      {value}
    </span>
  </div>
)

// ── Owned tile row ────────────────────────────────────────────────────────────

const TileRow = ({
  index,
  price,
  imageUrl,
  businessName,
}: {
  index: string
  price: number
  imageUrl?: string
  businessName?: string
}) => (
  <div
    className='flex items-center justify-between rounded-lg p-2.5 gap-3 border transition-colors'
    style={{
      background: 'rgba(255,255,255,0.03)',
      borderColor: 'rgba(0, 210, 255, 0.10)',
    }}
  >
    {/* Thumbnail */}
    <div
      className='flex-shrink-0 w-9 h-9 rounded-lg border overflow-hidden'
      style={{
        borderColor: 'rgba(0,210,255,0.2)',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        background: imageUrl ? undefined : 'rgba(0,210,255,0.05)',
      }}
    />
    {/* Meta */}
    <div className='flex-1 flex flex-col min-w-0'>
      <span className='text-xs font-semibold truncate text-white/80'>
        {businessName ?? `Tile #${index}`}
      </span>
      <span className='text-[10px] font-mono text-white/35'>ID: {index}</span>
    </div>
    {/* Price badge */}
    <div
      className='flex-shrink-0 text-xs font-bold font-mono px-2 py-0.5 rounded-full'
      style={{
        background: 'rgba(0,210,255,0.1)',
        color: 'hsl(196, 100%, 60%)',
        border: '1px solid rgba(0,210,255,0.2)',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      ₹{price.toLocaleString('en-IN')}
    </div>
  </div>
)

// ── Selected cell panel ───────────────────────────────────────────────────────

const SelectedCellPanel = ({
  cellIndex,
  price,
  isOwned,
  onBuy,
  onImageUpload,
  canAfford,
}: {
  cellIndex: number
  price: number
  isOwned: boolean
  onBuy: () => void
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void
  canAfford: boolean
}) => (
  <div
    className='rounded-xl p-4 border flex flex-col gap-3'
    style={{ background: 'rgba(8,14,36,0.7)', borderColor: 'rgba(0,210,255,0.15)' }}
  >
    <div className='flex items-center justify-between'>
      <span className='text-[10px] uppercase tracking-widest text-white/40'>Selected Tile</span>
      <span
        className='text-[10px] font-mono px-2 py-0.5 rounded-full border'
        style={{ color: 'rgba(180,200,255,0.6)', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
      >
        ID: {cellIndex}
      </span>
    </div>

    <div className='flex items-center justify-between'>
      <span className='text-sm text-white/60'>Tile Price</span>
      <span className='text-2xl font-bold font-mono' style={{ color: 'hsl(196,100%,60%)', fontFamily: "'Space Mono', monospace" }}>
        ₹{price.toLocaleString('en-IN')}
      </span>
    </div>

    {isOwned ? (
      <div className='flex flex-col gap-2 mt-1'>
        <div
          className='text-center text-xs py-1.5 rounded-lg font-bold uppercase tracking-wider'
          style={{ background: 'rgba(0,210,255,0.1)', color: 'hsl(196,100%,60%)', border: '1px solid rgba(0,210,255,0.25)' }}
        >
          ✓ Tile Owned
        </div>
        <label className='text-xs text-white/40 mt-1'>Update Ad Image</label>
        <input
          type='file'
          accept='image/*'
          onChange={onImageUpload}
          className='text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white/70 hover:file:bg-white/15 cursor-pointer'
        />
      </div>
    ) : (
      <button
        onClick={onBuy}
        disabled={!canAfford}
        className='w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
        style={{
          background: canAfford
            ? 'linear-gradient(135deg, hsl(255 60% 30%), hsl(196 100% 40%))'
            : 'rgba(255,255,255,0.05)',
          color: 'white',
          boxShadow: canAfford ? '0 0 16px rgba(0,210,255,0.25)' : 'none',
          border: '1px solid rgba(0,210,255,0.2)',
        }}
      >
        Claim This Tile
      </button>
    )}
  </div>
)

// ── Main Dashboard ────────────────────────────────────────────────────────────

export const Dashboard = () => {
  const { balance, ownedCells, buyCell, setCellImage, voroforce } = useShallowState(
    (state) => ({
      balance: state.balance,
      ownedCells: state.ownedCells,
      buyCell: state.buyCell,
      setCellImage: state.setCellImage,
      voroforce: state.voroforce,
    }),
  )

  const selectedCell = voroforce?.cells?.selected
  const ownedCount = Object.keys(ownedCells).length

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
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      if (url) setCellImage(selectedCell.index, url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className='fixed right-4 top-20 bottom-4 w-72 rounded-2xl flex flex-col gap-4 z-40 overflow-hidden'
      style={{
        background: 'rgba(5, 9, 28, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 210, 255, 0.12)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(0,210,255,0.08)',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Header */}
      <div
        className='flex items-center gap-2 px-4 pt-4 pb-3 border-b'
        style={{ borderColor: 'rgba(0,210,255,0.08)' }}
      >
        <div
          className='w-6 h-6 rounded-lg flex items-center justify-center'
          style={{ background: 'linear-gradient(135deg, hsl(255 60% 28%), hsl(196 100% 38%))', boxShadow: '0 0 8px rgba(0,210,255,0.3)' }}
        >
          <Zap className='w-3.5 h-3.5 text-white' fill='white' />
        </div>
        <span className='text-sm font-bold tracking-tight text-white'>Ad Manager</span>
      </div>

      <div className='flex flex-col gap-4 px-4 pb-4 overflow-y-auto flex-1'>
        {/* Stats row */}
        <div className='grid grid-cols-2 gap-2'>
          <StatCard
            label='Ad Credits'
            value={`₹${(balance / 1000).toFixed(0)}K`}
            icon={<TrendingUp className='w-3.5 h-3.5' />}
            accent
          />
          <StatCard
            label='Tiles Owned'
            value={ownedCount.toString()}
            icon={<LayoutGrid className='w-3.5 h-3.5' />}
          />
        </div>

        {/* Selected cell */}
        <div>
          <p className='text-[10px] uppercase tracking-widest text-white/35 mb-2'>Tile Inspector</p>
          {!selectedCell ? (
            <div
              className='rounded-xl p-4 border text-center'
              style={{ background: 'rgba(8,14,36,0.5)', borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <p className='text-xs text-white/30 italic'>Click any tile in the grid to inspect it</p>
            </div>
          ) : (
            <SelectedCellPanel
              cellIndex={selectedCell.index}
              price={selectedPrice}
              isOwned={isOwned}
              onBuy={() => buyCell(selectedCell.index, selectedPrice)}
              onImageUpload={handleImageUpload}
              canAfford={balance >= selectedPrice}
            />
          )}
        </div>

        {/* Owned tiles */}
        <div className='flex flex-col gap-2 flex-1 min-h-0'>
          <p className='text-[10px] uppercase tracking-widest text-white/35'>My Ad Tiles</p>
          {ownedCount === 0 ? (
            <p className='text-xs text-white/25 italic px-1'>No tiles owned yet. Click a tile to get started.</p>
          ) : (
            <div className='flex flex-col gap-1.5 overflow-y-auto'>
              {Object.entries(ownedCells).slice(0, 50).map(([idx, data]) => (
                <TileRow
                  key={idx}
                  index={idx}
                  price={data.price}
                  imageUrl={data.business?.imageUrl}
                  businessName={data.business?.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
