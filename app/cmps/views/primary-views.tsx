import { About } from './about'
import { Favorites } from './favorites'
import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { Settings } from './settings'

const PrimaryViews = () => (
  <>
    <Settings />
    <About />
    <Favorites />
    <LowFpsAlert />
    <HotkeysView />
  </>
)

export default PrimaryViews
