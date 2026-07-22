import { useShallowState } from '@/store'
import { cn } from '../../../utils/tw'
import config from '../../../config'
import { VOROFORCE_MODE } from '../../../vf/consts'
import { calculateCellPrice, calculateProximityFactor } from '../../../utils/pricing'

export const AdPreview = () => {
  const { ad, hoveredCell, isPreviewMode } = useShallowState((state) => ({
    ad: state.ad,
    hoveredCell: state.hoveredCell,
    isPreviewMode: state.mode === VOROFORCE_MODE.preview
  }))

  if (!ad || !hoveredCell) return null

  // Calculate pricing & proximity
  const price = calculateCellPrice(hoveredCell.x, hoveredCell.y)
  const proximity = calculateProximityFactor(hoveredCell.x, hoveredCell.y)

  // Dynamic Tier Labeling
  const getTierBadge = (p: number) => {
    if (p >= 800) return { label: 'PRIME REAL ESTATE', color: 'bg-pink-500/20 text-pink-400 border-pink-500/40' }
    if (p >= 400) return { label: 'MIDTOWN DISTRICT', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' }
    return { label: 'SUBURBAN GRID', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' }
  }

  const tier = getTierBadge(price)

  // Map movie rating to CTR (0-100 rating -> 0-10% CTR)
  const ctr = (ad.rating / 10).toFixed(1)
  
  // Map popularity to impressions
  const impressions = ad.popularity > 1000 
    ? `${(ad.popularity / 1000).toFixed(1)}M` 
    : `${Math.floor(ad.popularity)}K`

  const categories = ad.genres ? ad.genres.slice(0, 3).join(' • ') : 'General'

  return (
    <div 
      className={cn(
        'pointer-events-none fixed bottom-24 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] md:bottom-4 md:right-8 transition-opacity duration-300',
        isPreviewMode ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className='flex flex-col gap-3 rounded-xl border border-white/10 bg-black/60 p-4 shadow-2xl backdrop-blur-md'>
        
        {/* Header: Tier & Title */}
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${tier.color}`}>
            {tier.label}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">ID: #{hoveredCell.index}</span>
        </div>

        <h2 className='text-lg font-bold leading-tight text-white'>
          {ad.title || 'Untitled Campaign'}
        </h2>

        {/* Pricing */}
        <div className="my-1">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Cell Price</div>
          <div className="text-2xl font-black text-emerald-400">₹{price.toLocaleString()}</div>
        </div>

        {/* Proximity Indicator Bar */}
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span className="uppercase">Center Proximity</span>
            <span>{Math.round(proximity * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300" 
              style={{ width: `${proximity * 100}%` }}
            />
          </div>
        </div>

        {/* Categories */}
        <p className='text-[10px] font-semibold text-[hsl(220,40%,70%)] uppercase tracking-wider'>
          {categories}
        </p>

        {/* Tagline / Description */}
        {ad.tagline && (
          <p className='line-clamp-2 text-xs italic text-muted-foreground'>
            "{ad.tagline}"
          </p>
        )}

        {/* Stats Grid */}
        <div className='mt-2 grid grid-cols-2 gap-2'>
          <div className='rounded-lg bg-[hsla(220,50%,15%,0.5)] p-2'>
            <div className='text-[10px] uppercase text-muted-foreground'>Est. CTR</div>
            <div className='text-lg font-bold text-[hsl(140,100%,70%)]'>{ctr}%</div>
          </div>
          <div className='rounded-lg bg-[hsla(220,50%,15%,0.5)] p-2'>
            <div className='text-[10px] uppercase text-muted-foreground'>Est. Reach</div>
            <div className='text-lg font-bold text-white'>{impressions}</div>
          </div>
        </div>
        
        {/* Poster Thumbnail */}
        {ad.poster && (
          <div className='mt-1 overflow-hidden rounded-lg border border-[hsla(220,100%,80%,0.1)]'>
            <img 
              src={`${config.posterBaseUrl}${ad.poster}`} 
              alt="Creative Preview" 
              className='h-32 w-full object-cover opacity-80 mix-blend-screen transition-opacity duration-300'
            />
          </div>
        )}

      </div>
    </div>
  )
}
