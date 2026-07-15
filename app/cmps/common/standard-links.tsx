import config from '../../config'
import { cn } from '../../utils/tw'
import type { Ad } from '../../vf'
import { Button } from '../ui/button'

export const StdLinks = ({
  Ad,
  buttonClassName = '',
}: {
  Ad: {
    title: Ad['title']
    tmdbId: Ad['tmdbId']
    imdbId?: Ad['imdbId']
  }
  buttonClassName?: string
}) => {
  return (
    <>
      <Button
        asChild
        variant='outline'
        className={cn(
          'rounded-lg border-foreground md:backdrop-blur-lg',
          buttonClassName,
        )}
      >
        <a
          href={`${config.tmdbAdBaseUrl}${Ad.tmdbId}`}
          target='_blank'
          rel='noreferrer'
        >
          TMDB
        </a>
      </Button>
      {Ad.imdbId && (
        <Button
          asChild
          variant='outline'
          className={cn(
            'rounded-lg border-foreground md:backdrop-blur-lg',
            buttonClassName,
          )}
        >
          <a
            href={`${config.imdbAdBaseUrl}${Ad.imdbId}`}
            target='_blank'
            rel='noreferrer'
          >
            IMDB
          </a>
        </Button>
      )}
    </>
  )
}
