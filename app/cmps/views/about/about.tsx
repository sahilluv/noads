import { Github, Zap, Grid2x2, DollarSign, Layers, Cpu } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { useShallowState } from '@/store'
import config from '../../../config'
import { cn } from '../../../utils/tw'
import { Hotkeys } from '../../common/hotkeys'
import { Modal } from '../../common/modal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion'
import { Button } from '../../ui/button'
import { ScrollArea } from '../../ui/scroll-area'

// ── Internal primitives ───────────────────────────────────────────────────────

const ExternalLink = ({ children, href }: PropsWithChildren<{ href: string }>) => (
  <a
    href={href}
    target='_blank'
    rel='noreferrer noopener'
    className='font-semibold underline underline-offset-2 text-[hsl(196_100%_55%)] hover:text-white transition-colors duration-150'
  >
    {children}
  </a>
)

const Highlight = ({ children }: PropsWithChildren) => (
  <span className='font-bold text-[hsl(196_100%_55%)]'>{children}</span>
)


// ── Accordion section definitions ────────────────────────────────────────────

const sections = [
  {
    icon: <Zap className='w-4 h-4 text-[hsl(196_100%_55%)]' />,
    title: 'What is NoAds?',
    content: (
      <>
        <p>
          <Highlight>NoAds</Highlight> is the world's first permanent mosaic ad board.
          The entire website is a single, living billboard — made up of thousands of
          individual tiles that anyone can buy and own <Highlight>forever</Highlight>.
        </p>
        <br />
        <p>
          Every tile you buy is a permanent piece of the NoAds grid. Upload your brand
          image, add a link, and your ad stays live for as long as NoAds exists — no
          subscriptions, no renewals, no expiry.
        </p>
      </>
    ),
  },
  {
    icon: <Grid2x2 className='w-4 h-4 text-[hsl(196_100%_55%)]' />,
    title: 'How to Buy a Tile',
    content: (
      <>
        <p>
          Click on any <Highlight>available tile</Highlight> in the grid. A purchase
          panel will open where you can review the tile price based on its position.
        </p>
        <br />
        <p>Fill in your:</p>
        <ul className='list-disc list-inside mt-2 space-y-1 text-sm'>
          <li><Highlight>Business Name</Highlight> (required)</li>
          <li><Highlight>Email</Highlight> (required)</li>
          <li>Website / Business Link (optional)</li>
          <li>Ad Image — PNG or JPG (optional but recommended)</li>
          <li>10-second Video Ad — adds ₹{config.videoAddonPrice} to the price</li>
        </ul>
        <br />
        <p>Confirm your purchase and your tile goes live immediately on the grid.</p>
      </>
    ),
  },
  {
    icon: <DollarSign className='w-4 h-4 text-[hsl(196_100%_55%)]' />,
    title: 'Pricing',
    content: (
      <>
        <p>
          Tile prices start at <Highlight>₹{config.tileBasePrice}</Highlight> and
          increase based on position. Tiles closer to the <Highlight>centre</Highlight>{' '}
          of the grid command higher prices due to greater visibility.
        </p>
        <br />
        <p>
          Adding a <Highlight>10-second video ad</Highlight> to any tile costs an
          additional <Highlight>₹{config.videoAddonPrice}</Highlight>.
        </p>
        <br />
        <p>
          All purchases are <Highlight>one-time and permanent</Highlight>. No monthly
          fees. No renewals.
        </p>
      </>
    ),
  },
  {
    icon: <Layers className='w-4 h-4 text-[hsl(196_100%_55%)]' />,
    title: 'The Mosaic Effect',
    content: (
      <>
        <p>
          Every unsold tile on the board contributes to a massive, translucent{' '}
          <Highlight>contract mosaic</Highlight> — a ghost image that spans the entire
          grid and creates a visual illusion when viewed from a distance.
        </p>
        <br />
        <p>
          As advertisers buy and fill in tiles, each sold tile{' '}
          <Highlight>punches through</Highlight> the mosaic with their own ad,
          replacing that piece of the puzzle permanently.
        </p>
        <br />
        <p>
          The result is a living, ever-evolving billboard where the community of
          advertisers collectively builds the final picture.
        </p>
      </>
    ),
  },
  {
    icon: <Cpu className='w-4 h-4 text-[hsl(196_100%_55%)]' />,
    title: 'Technology',
    content: (
      <>
        <p>
          The NoAds grid is rendered using a{' '}
          <ExternalLink href='https://en.wikipedia.org/wiki/Voronoi_diagram'>
            Voronoi diagram
          </ExternalLink>{' '}
          — a mathematical structure that divides space into organic, interlocking
          regions. The simulation runs in JavaScript web workers, while the
          visualisation layer uses <Highlight>WebGL2</Highlight>.
        </p>
        <br />
        <Button variant='default' asChild>
          <a
            href={config.githubUrl}
            target='_blank'
            rel='noreferrer noopener'
          >
            <Github className='w-4 h-4 mr-2' /> View on GitHub
          </a>
        </Button>
      </>
    ),
  },
  {
    title: 'Controls',
    content: <Hotkeys />,
    className: 'hidden mouse:block',
  },
]

// ── About modal ───────────────────────────────────────────────────────────────

export const About = () => {
  const { open, setOpen } = useShallowState((state) => ({
    open: state.aboutOpen,
    setOpen: state.setAboutOpen,
  }))

  return (
    <Modal
      rootProps={{ open, onClose: () => setOpen(false) }}
      overlay
      header={
        <div className='flex h-18 w-full bg-gradient-to-t from-0% from-transparent via-60% via-background to-100% to-background max-md:hidden' />
      }
      footer={
        <div className='flex w-full flex-row justify-between gap-3 bg-gradient-to-b from-0% from-transparent via-60% via-background to-100% to-background p-6 pt-24 md:gap-6'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      }
    >
      <ScrollArea
        className='not-landscape:w-full not-landscape:rounded-t-3xl bg-background/60 lg:w-full lg:rounded-3xl landscape:h-full landscape:rounded-l-3xl'
        innerClassName='max-h-[calc(100vh-var(--spacing)*6*2)]'
      >
        {/* Header brand mark */}
        <div className='flex items-center gap-3 px-6 pt-8 pb-4 lg:pt-12'>
          <div
            className='flex items-center justify-center w-10 h-10 rounded-xl'
            style={{
              background: 'linear-gradient(135deg, hsl(255 60% 22%), hsl(196 100% 40%))',
              boxShadow: '0 0 18px rgba(0, 210, 255, 0.4)',
            }}
          >
            <Zap className='w-5 h-5 text-white' fill='white' />
          </div>
          <div>
            <h1 className='text-xl font-bold tracking-tight'>
              No<span style={{ color: 'hsl(196, 100%, 55%)' }}>Ads</span>
            </h1>
            <p className='text-xs text-muted-foreground'>{config.tagline}</p>
          </div>
        </div>

        <Accordion
          type='multiple'
          className='w-full px-6 pb-18 md:pr-10 lg:pb-24'
          defaultValue={['0', '1', '2']}
        >
          {sections.map(({ icon, title, content, className }, index) => (
            <AccordionItem
              key={title}
              value={`${index}`}
              className={cn('w-full cursor-auto', className)}
            >
              <AccordionTrigger className='w-full cursor-pointer font-bold text-base uppercase leading-none underline-offset-3 [&>svg]:size-5'>
                <span className='flex items-center gap-2'>
                  {icon}
                  {title}
                </span>
              </AccordionTrigger>
              <AccordionContent className='text-sm text-muted-foreground leading-relaxed'>
                {content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </Modal>
  )
}
