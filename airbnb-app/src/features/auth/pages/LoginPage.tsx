import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { Button, Card, Input, Label } from '../../../shared/components';
import { Mail, Lock, ArrowRight, Globe, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { handleLogin, isLoading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
      <Card className="w-full max-w-md p-8 sm:p-10 shadow-2xl animate-fade-in" hoverable={false}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2 font-medium">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-shake">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="email" required>Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              leftIcon={<Mail size={18} />}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center pr-1">
              <Label htmlFor="password" required>Password</Label>
              <Link to="/forgot-password" title="Forgot password?" className="text-xs font-bold text-airbnb hover:underline mb-1.5">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<Lock size={18} />}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-4 rounded-xl text-lg shadow-airbnb/20"
            isLoading={isLoading}
            rightIcon={<ArrowRight size={20} />}
          >
            Sign In
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-wider text-[10px]">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full font-bold" leftIcon={<Globe size={18} />}>
            Google
          </Button>
          <Button variant="outline" className="w-full font-bold" leftIcon={<User size={18} />}>
            Github
          </Button>
        </div>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-airbnb font-black hover:underline">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
