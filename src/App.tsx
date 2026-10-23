import { cans } from "./data/cans"
import { CanPlaceholder } from "./components/CanPlaceholder/CanPlaceholder"
import { StarRating } from "./components/StarRating/StarRating"

function App() {
  return (
    <main><h1>NRGASM</h1>
    <CanPlaceholder name="Mango Loco" flavorColor={cans[0].flavorColor} />
    <StarRating value={4} />
    <StarRating value={null} />
    </main>
    
  )
}

export default App
