import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HeaderBar } from './components/ui/HeaderBar';
import { MobileMenu } from './components/ui/MobileMenu';
import { Toast } from './components/ui/Toast';
import { CartDrawer } from './components/cart/CartDrawer';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { OrderConfirm } from './pages/OrderConfirm';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openCart = () => {
    setMenuOpen(false);
    setCartOpen(true);
  };

  return (
    <HashRouter>
      <div className="min-h-screen">
        <HeaderBar onOpenCart={openCart} onOpenMenu={() => setMenuOpen(true)} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/pedido/:code" element={<OrderConfirm />} />
        </Routes>

        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onOpenCart={openCart} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <Toast />
      </div>
    </HashRouter>
  );
}

export default App;
