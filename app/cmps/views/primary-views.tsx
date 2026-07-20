import { About } from './about'
import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { PriceOverlay } from './price-overlay/price-overlay'
import { Settings } from './settings'

const PrimaryViews = () => (
  <>
    <PriceOverlay />
    <Settings />
    <About />
    <LowFpsAlert />
    <HotkeysView />
  </>
)

export default PrimaryViews
