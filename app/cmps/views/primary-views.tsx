import { About } from './about'

import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { Settings } from './settings'

const PrimaryViews = () => (
  <>
    <Settings />
    <About />
    <LowFpsAlert />
    <HotkeysView />
  </>
)

export default PrimaryViews
