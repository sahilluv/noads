import { Navbar, ThemeProvider } from './cmps/layout'
import { Dashboard } from './cmps/layout/dashboard'
import PrimaryViews from './cmps/views'
import { Intro } from './cmps/views/intro'

const App = () => (
  <ThemeProvider>
    <Navbar />
    <Dashboard />
    <PrimaryViews />
    <Intro />
  </ThemeProvider>
)

export default App
