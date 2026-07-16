import { About } from './about'
import { BuyModal } from './buy-modal'
import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { Settings } from './settings'

const PrimaryViews = () => (
  <>
    <Settings />
    <About />
    <LowFpsAlert />
    <HotkeysView />
    <BuyModal />
  </>
)

export default PrimaryViews
