import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiHome } from 'react-icons/fi';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="text-green-500 text-7xl mb-6 flex justify-center">
          <FiCheckCircle />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your booking has been confirmed.
        </p>
        

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiHome className="mr-2" />
          Back to Home
        </button>
        
        <p className="mt-4 text-sm text-gray-500">
          You'll be redirected to home page in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
