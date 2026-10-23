import { createBrowserRouter, RouterProvider } from 'react-router'
import { MotionConfig } from 'motion/react'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage/HomePage'
import { CatalogPage } from './pages/CatalogPage/CatalogPage'
import { CanPage } from './pages/CanPage/CanPage'
import { StatsPage } from './pages/StatsPage/StatsPage'
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'catalog', Component: CatalogPage },
      { path: 'can/:id', Component: CanPage },
      { path: 'stats', Component: StatsPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])

function App() {
  return (
    // reducedMotion="user": Motion follows the OS "reduce motion" setting
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}

export default App
