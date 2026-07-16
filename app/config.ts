const env = import.meta.env as unknown as {
  VITE_TELEMETRY_ENABLED?: string
  VITE_TELEMETRY_ENDPOINT?: string
  VITE_APP_VERSION?: string
}

const noads = {
  /** Brand identity */
  platformName: 'NoAds',
  tagline: 'Own a pixel. Run your brand.',
  description:
    'NoAds is the world\'s first mosaic ad board. Buy a permanent tile, place your brand, and become part of something massive.',

  /** Contact & social */
  contactEmail: 'hello@noads.in',
  githubUrl: 'https://github.com/sahilluv',

  /** Pricing (in Indian Rupees) */
  tileBasePrice: 100,
  videoAddonPrice: 500,

  /** Telemetry (optional, from env) */
  telemetry: {
    enabled:
      env?.VITE_TELEMETRY_ENABLED === '1' ||
      env?.VITE_TELEMETRY_ENABLED === 'true',
    endpoint: env?.VITE_TELEMETRY_ENDPOINT ?? undefined,
    appVersion: env?.VITE_APP_VERSION ?? undefined,
  },

  /** Legacy compat — keeps existing components working */
  sourceCodeUrl: 'https://github.com/sahilluv',
  backdropBaseUrl: '',
  posterBaseUrl: '',
  tmdbUrl: '',
  tmdbAdBaseUrl: '',
  imdbAdBaseUrl: '',
  disableUI: false,
}

export default noads
