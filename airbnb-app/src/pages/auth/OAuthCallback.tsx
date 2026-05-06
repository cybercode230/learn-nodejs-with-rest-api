import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (token) {
        try {
          // Fetch user data with the token
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          login(token, response.data.user);
          navigate('/');
        } catch (error) {
          console.error('OAuth login failed:', error);
          navigate('/login?error=oauth_failed');
        }
      } else {
        navigate('/login?error=no_token');
      }
    };

    handleOAuth();
  }, [location, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-text">Please wait while we complete your login.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
