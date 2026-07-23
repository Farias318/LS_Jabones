import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HeaderBar } from './components/ui/HeaderBar';
import { CartDrawer } from './components/cart/CartDrawer';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { OrderConfirm } from './pages/OrderConfirm';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen">
        <HeaderBar onOpenCart={() => setCartOpen(true)} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/pedido/:code" element={<OrderConfirm />} />
        </Routes>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </HashRouter>
  );
}

export default App;
