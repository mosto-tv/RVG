import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CursorDot from './components/CursorDot.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Listings from './pages/Listings.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import Projects from './pages/Projects.jsx';
import Agents from './pages/Agents.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import BookVisit from './pages/BookVisit.jsx';
import Favorites from './pages/Favorites.jsx';
import Account from './pages/Account.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Store from './pages/Store.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Player from './pages/Player.jsx';
import Admin from './pages/Admin.jsx';
import Legal from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, search]);
  return null;
};

const Shell = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="page">
      <Header />
      <ScrollToTop />
      <main key={location.pathname} style={{ animation: 'fadeIn .4s ease' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<PropertyDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-visit" element={<BookVisit />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/order/:reference" element={<OrderConfirmation />} />
          <Route path="/player" element={<Player />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/legal/:slug" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      <CartDrawer />
      <CursorDot />
    </div>
  );
};

export default function App() {
  return <Shell />;
}
