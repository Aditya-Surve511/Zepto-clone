import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import '../storefront.css'

const CartContext = createContext(null)
const CART_KEY = 'zepto-cart'

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  function addToCart(product) {
    const item = cart.find((cartItem) => cartItem.id === product.id)

    if (item) {
      setCart(cart.map((cartItem) =>
        cartItem.id === product.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  function updateQuantity(productId, change) {
    setCart((currentCart) => currentCart
      .map((item) => item.id === productId
        ? { ...item, quantity: item.quantity + change }
        : item,
      )
      .filter((item) => item.quantity > 0),
    )
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

async function getData(url) {
  const response = await fetch(`https://fakestoreapi.com${url}`)
  if (!response.ok) throw new Error('Unable to load store data')
  return response.json()
}

function ProductCard({ product, addToCart }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>
      <p className="product-category">{product.category}</p>
      <h3>{product.title}</h3>
      <div className="product-footer">
        <strong>${product.price.toFixed(2)}</strong>
        <button onClick={() => addToCart(product)}>ADD</button>
      </div>
    </article>
  )
}

function Cart({ closeCart }) {
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <button className="cart-overlay" onClick={closeCart} aria-label="Close cart" />
      <aside className="cart-panel" aria-label="My cart">
        <div className="cart-header">
          <h2>My cart ({itemCount})</h2>
          <button onClick={closeCart} aria-label="Close cart">×</button>
        </div>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty. Add something you like!</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div className="cart-item-info">
                    <h3>{item.title}</h3>
                    <p>${item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                      <button className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div>
            <button className="checkout-button" onClick={closeCart}>Continue to checkout</button>
          </>
        )}
      </aside>
    </>
  )
}

export default function Home() {
  const { cart, addToCart } = useContext(CartContext)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cartIsOpen, setCartIsOpen] = useState(false)

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => getData('/products'),
  })
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => getData('/products/categories'),
  })

  const products = productsQuery.data || []
  const categories = categoriesQuery.data || []
  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="store">
      <header className="header">
        <img className="logo" src="/ZeptoLogo.png" alt="Zepto" />
        <p className="address">Delivering to <strong>Baner, Pune</strong></p>
        <input
          className="search"
          type="search"
          placeholder="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="open-cart" onClick={() => setCartIsOpen(true)}>
          Cart ({cartCount})
        </button>
      </header>

      <nav className="category-tabs" aria-label="Product categories">
        <button className={category === 'all' ? 'selected' : ''} onClick={() => setCategory('all')}>All products</button>
        {categories.map((item) => (
          <button
            className={category === item ? 'selected' : ''}
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <main>
        <section className="welcome">
          <div>
            <p>GOOD THINGS, DELIVERED FAST</p>
            <h1>Your everyday shopping, made easy.</h1>
            <span>Browse the store and get your order in minutes.</span>
          </div>
          {products[0] && <img src={products[0].image} alt="Featured product" />}
        </section>

        <section className="catalog">
          <div className="section-title">
            <h2>{category === 'all' ? 'Popular products' : category}</h2>
            <span>{visibleProducts.length} items</span>
          </div>

          {productsQuery.isLoading && <p className="message">Loading products...</p>}
          {productsQuery.isError && (
            <div className="message">
              <p>Could not load products.</p>
              <button onClick={() => {
                productsQuery.refetch()
                categoriesQuery.refetch()
              }}>
                Try again
              </button>
            </div>
          )}
          {!productsQuery.isLoading && !productsQuery.isError && visibleProducts.length === 0 && (
            <p className="message">No products found.</p>
          )}

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        </section>
      </main>

      {cartIsOpen && <Cart closeCart={() => setCartIsOpen(false)} />}
    </div>
  )
}