import { cans } from "./data/cans"
import { CanPlaceholder } from "./components/CanPlaceholder/CanPlaceholder"

function App() {
  return (
    <main><h1>NRGASM</h1>
    <CanPlaceholder name="Mango Loco" flavorColor={cans[0].flavorColor} />
    </main>
    
  )
}

export default App
