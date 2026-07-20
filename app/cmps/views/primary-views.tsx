import { Dashboard } from '../layout/dashboard'
import { About } from './about'
import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { PriceOverlay } from './price-overlay/price-overlay'
import { Settings } from './settings'

const PrimaryViews = () => (
  <>
    <PriceOverlay />
    <Dashboard />
    <Settings />
    <About />
    <LowFpsAlert />
    <HotkeysView />
  </>
)

export default PrimaryViews
