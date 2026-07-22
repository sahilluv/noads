import { About } from './about'
import { AdPreview } from './ad-preview'

import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { Settings } from './settings'

const PrimaryViews = () => (
  <>
    <Settings />
    <About />
    <LowFpsAlert />
    <HotkeysView />
    <AdPreview />
  </>
)

export default PrimaryViews
