import { Github, Info, Settings, Zap, Search } from 'lucide-react'
import { useState } from 'react'
import { useShallowState } from '@/store'
import config from '../../config'
import { cn } from '../../utils/tw'
import { VOROFORCE_PRESET } from '../../vf'
import { Button } from '../ui/button'
import { ThemeToggle } from './theme'

// ── NoAds Navbar ─────────────────────────────────────────────────────────────

const NavBtn = ({
  children,
  onClick,
  active,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  className?: string
}) => (
  <Button
    variant='ghost'
    size='icon'
    onClick={onClick}
    onPointerDown={(e) => {
      if (active) {
        e.preventDefault()
        e.stopPropagation()
      }
    }}
    className={cn(
      '!size-7 [&_svg]:!size-4 lg:!size-9 lg:[&_svg]:!size-5',
      'pointer-events-auto rounded-full cursor-pointer',
      'text-white/60 hover:text-[hsl(196_100%_55%)] hover:bg-[hsl(196_100%_55%/0.08)]',
      'transition-all duration-200',
      active && 'border border-[hsl(196_100%_55%/0.6)] text-[hsl(196_100%_55%)] bg-[hsl(196_100%_55%/0.08)]',
      className,
    )}
  >
    {children}
  </Button>
)

const BrandMark = () => (
  <div className='flex items-center gap-2 pointer-events-auto select-none'>
    <div
      className='flex items-center justify-center w-7 h-7 lg:w-9 lg:h-9 rounded-xl'
      style={{
        background: 'linear-gradient(135deg, hsl(255 60% 22%), hsl(196 100% 40%))',
        boxShadow: '0 0 14px rgba(0, 210, 255, 0.4)',
      }}
    >
      <Zap className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='white' />
    </div>
    <span
      className='hidden sm:block text-sm lg:text-base font-bold tracking-tight text-white'
      style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.01em' }}
    >
      No<span style={{ color: 'hsl(196, 100%, 55%)' }}>Ads</span>
    </span>
  </div>
)

const SearchBar = () => {
  const { ownedCells, voroforce } = useShallowState((state) => ({
    ownedCells: state.ownedCells,
    voroforce: state.voroforce
  }))
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || !voroforce) return

    const lowerQuery = query.toLowerCase()
    // Find the first cell that matches the business name
    const match = Object.entries(ownedCells).find(([_, data]) => 
      data.business?.name?.toLowerCase().includes(lowerQuery)
    )

    if (match) {
      const cellIndex = parseInt(match[0])
      // Select the cell programmatically
      voroforce.controls.selectCell(cellIndex)
      
      // Pan camera to the cell if pinPointer is available
      const cell = voroforce.cells[cellIndex]
      if (cell && voroforce.controls.pinPointer) {
        voroforce.controls.pinPointer(cell)
      }
    } else {
      alert(`No brand found matching "${query}"`)
    }
  }

  return (
    <form onSubmit={handleSearch} className='pointer-events-auto flex items-center relative mx-4 max-w-[200px] lg:max-w-[300px] w-full'>
      <Search className='w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/40 absolute left-3' />
      <input 
        type="text"
        placeholder="Search brands..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className='w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(0,210,255,0.15)] rounded-full pl-9 pr-4 py-1.5 lg:py-2 text-xs lg:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(196_100%_55%)] focus:bg-[rgba(0,210,255,0.03)] transition-all'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      />
    </form>
  )
}

export const Navbar = () => {
  const {
    settingsOpen,
    toggleSettingsOpen,
    aboutOpen,
    toggleAboutOpen,
    canChangeTheme,
  } = useShallowState((state) => ({
    settingsOpen: state.settingsOpen,
    toggleSettingsOpen: state.toggleSettingsOpen,
    aboutOpen: state.aboutOpen,
    toggleAboutOpen: state.toggleAboutOpen,
    canChangeTheme:
      state.preset === VOROFORCE_PRESET.minimal ||
      state.preset === VOROFORCE_PRESET.mobile,
  }))

  return (
    <nav
      className='pointer-events-none fixed inset-x-0 top-0 z-60 flex w-full flex-row items-center justify-between px-4 py-3 md:px-8 md:py-5'
      style={{
        background: 'linear-gradient(to bottom, rgba(5,8,24,0.85) 0%, transparent 100%)',
      }}
    >
      <div className='flex items-center flex-1'>
        <BrandMark />
        <SearchBar />
      </div>

      {/* Right — Controls */}
      <div className='flex flex-row items-center gap-1 shrink-0'>
        <NavBtn onClick={toggleAboutOpen} active={aboutOpen}>
          <Info />
        </NavBtn>

        <NavBtn onClick={toggleSettingsOpen} active={settingsOpen}>
          <Settings />
        </NavBtn>

        <ThemeToggle
          className={cn(
            '!size-7 [&_svg]:!size-4 lg:!size-9 lg:[&_svg]:!size-5',
            'pointer-events-auto rounded-full cursor-pointer',
            'text-white/60 hover:text-[hsl(196_100%_55%)] hover:bg-[hsl(196_100%_55%/0.08)]',
            'transition-all duration-200',
            !canChangeTheme && 'hidden',
          )}
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />

        <NavBtn className='hidden md:inline-flex'>
          <a
            href={config.githubUrl}
            target='_blank'
            rel='noreferrer noopener'
            className='flex items-center justify-center w-full h-full'
          >
            <Github />
          </a>
        </NavBtn>
      </div>
    </nav>
  )
}
