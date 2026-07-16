import { Github, Info, Settings, Zap } from 'lucide-react'
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
      {/* Left — Brand */}
      <BrandMark />

      {/* Right — Controls */}
      <div className='flex flex-row items-center gap-1'>
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
