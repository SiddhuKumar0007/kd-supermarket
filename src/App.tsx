import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { ToastContainer } from './components/common/ToastContainer';
import { LocationModal } from './components/common/LocationModal';
import { AuthModal } from './components/common/AuthModal';
import { CartDrawer } from './components/cart/CartDrawer';

// Views
import { HomePage } from './views/HomePage';
import { CatalogPage } from './views/CatalogPage';
import { ProductDetailPage } from './views/ProductDetailPage';
import { CheckoutPage } from './views/CheckoutPage';
import { OrderConfirmationPage } from './views/OrderConfirmationPage';
import { TrackOrderPage } from './views/TrackOrderPage';
import { CustomerAccountPage } from './views/CustomerAccountPage';
import { AdminDashboard } from './views/AdminDashboard';
import { AboutUsPage } from './views/AboutUsPage';
import { ContactUsPage } from './views/ContactUsPage';
import { OffersPage } from './views/OffersPage';
import { PolicyPages } from './views/PolicyPages';

const MainRouter: React.FC = () => {
  const { currentView } = useStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'catalog':
        return <CatalogPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'track-order':
        return <TrackOrderPage />;
      case 'account':
        return <CustomerAccountPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'about':
        return <AboutUsPage />;
      case 'contact':
        return <ContactUsPage />;
      case 'offers':
        return <OffersPage />;
      case 'shipping-policy':
        return <PolicyPages type="shipping" />;
      case 'return-policy':
        return <PolicyPages type="return" />;
      case 'faqs':
        return <PolicyPages type="faqs" />;
      case 'privacy-policy':
        return <PolicyPages type="privacy" />;
      case 'terms':
        return <PolicyPages type="terms" />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal">
      <Header />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer />

      {/* Global Overlays & Floating Components */}
      <MobileBottomNav />
      <WhatsAppFloatingButton />
      <CartDrawer />
      <LocationModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}

export default App;
