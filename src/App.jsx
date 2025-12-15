import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import BookingSlot from './components/Booking/BookingSlot';
import SportsList from './components/Booking/SportsList';
import AdminDashboard from './components/Admin/AdminDashboard';
import AboutUs from './components/AboutUs/AboutUs';
import GamesListPage from './components/GamesList/GamesListPage';
import GameDetailsPage from './components/GamesList/GameDetailsPage';
import GalleryPage from "./components/Gallery/GalleryPage"
import ProfilePage from './components/Profile/ProfilePage';
import BookingHistory from './components/MangeBookings/BookingHistory';
import ManageUsers from './components/Admin/Manageusers/ManageUsers';
import Managesports from './components/Admin/ManageSports/Managesports';
import AddSport from './components/Admin/ManageSports/AddSport';
import EditSport from './components/Admin/ManageSports/EditSport';
import Settings from './components/Admin/Settings/Settings';
import ChangePassword from './components/Admin/Settings/Changepassword';
import ContactUsPage from './components/ManageContact/ContactUsPage';
import Contacting from './components/Contacting';
import Login from './components/Auth/Login';
import CreateAccount from './components/Auth/CreateAccount';
import ForgotPassword from './components/Auth/ForgotPassword';
import VenueDetails from './components/Booking/VenueDetails';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';

import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:sportType" element={<BookingSlot />} />
        <Route path="/venue/:sportType" element={<VenueDetails />} />
        {/* Nested Admin Routes */}
        <Route path="/admin" element={
          <AdminDashboard>
            <Outlet />
          </AdminDashboard>
        }>
          <Route index element={<div>Select an option from the dashboard</div>} />
          
          {/* Add other admin routes here as needed */}
        </Route>
        
        <Route path="/about" element={<AboutUs />} />
        <Route path="/games" element={<GamesListPage />} />
        <Route path="/game/:id" element={<GameDetailsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/sports" element={<Managesports />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/edit-sport" element={<EditSport />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/add-sport" element={<AddSport />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/contacting" element={<Contacting />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/explore-sports" element={<SportsList onBack={() => window.history.back()} />} />
      </Routes>
    </>
  );
}

export default App;
