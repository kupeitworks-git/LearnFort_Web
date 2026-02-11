import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


import {
  HashRouter as Router,   // ⬅⬅⬅ FIXED HERE
  useLocation,
  Link
} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import axios from 'axios';
import { FiMail, FiPhone, FiMapPin, FiArrowUp } from 'react-icons/fi';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Axios global interceptor for handling 401 errors (token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear session data
      sessionStorage.removeItem('token');
      localStorage.removeItem('lf_user');
      // Redirect to login using window.location since we're outside React lifecycle here
      // or we can use a custom event. But HashRouter uses #/ so:
      window.location.href = '#/login';
    }
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </QueryClientProvider>
    </Router>
  </StrictMode>
);