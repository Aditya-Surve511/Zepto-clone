import Home from './components/Home.jsx'
import { CartProvider } from './components/Home.jsx'

const App = () => {
  return (
    <CartProvider>
      <Home />
    </CartProvider>
  )
}

export default App
