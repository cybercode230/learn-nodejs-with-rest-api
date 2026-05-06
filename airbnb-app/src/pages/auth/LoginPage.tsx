import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border border-light-gray rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Welcome back</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-airbnb text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-airbnb text-white font-bold py-2 px-4 rounded-md hover:bg-airbnb-dark transition-colors"
        >
          Log in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-text">
        Don't have an account? <Link to="/register" className="text-black font-bold underline">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
