import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import IntroAnimation from './components/IntroAnimation';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Products from './components/Products';
import Cart from './components/Cart';
import EnhancedCheckout from './components/EnhancedCheckout';
import NewAdminPanel from './components/NewAdminPanel';
import Billing from './components/Billing';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const { isAdmin } = useApp();

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={isAdmin ? <Navigate to="/products" /> : <Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<EnhancedCheckout />} />
          <Route
            path="/admin"
            element={isAdmin ? <NewAdminPanel /> : <Navigate to="/" />}
          />
          <Route
            path="/billing"
            element={isAdmin ? <Billing /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
