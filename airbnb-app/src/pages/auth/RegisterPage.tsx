  import React, { useState } from 'react';
  import { useAuth } from '../../contexts/AuthContext';
  import { useNavigate, Link } from 'react-router-dom';
  import api from '../../api/axios';

  const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      username: '',
      phone: '',
      password: '',
      role: 'GUEST'
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await api.post('/auth/register', formData);
        login(response.data.token, response.data.user);
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    };

    return (
      <div className="max-w-md mx-auto mt-10 p-8 border border-light-gray rounded-2xl shadow-lg mb-10">
        <h1 className="text-2xl font-bold mb-6">Finish signing up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-airbnb text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              type="text"
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              name="username"
              type="text"
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              type="text"
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">I want to...</label>
            <select
              name="role"
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb focus:border-airbnb bg-white"
            >
              <option value="GUEST">Book places (Guest)</option>
              <option value="HOST">Host my place (Host)</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-airbnb text-white font-bold py-2 px-4 rounded-md hover:bg-airbnb-dark transition-colors"
          >
            Agree and continue
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-text">
          Already have an account? <Link to="/login" className="text-black font-bold underline">Log in</Link>
        </p>
      </div>
    );
  };

  export default RegisterPage;
