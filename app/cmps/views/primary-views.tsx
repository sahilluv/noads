import { About } from './about'
import { BuyModal } from './buy-modal'
import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { PriceOverlay } from './price-overlay/price-overlay'
import { Settings } from './settings'

const PrimaryViews = () => (
  <>
    <Settings />
    <About />
    <LowFpsAlert />
    <HotkeysView />
    <PriceOverlay />
    <BuyModal />
  </>
)

export default PrimaryViews
