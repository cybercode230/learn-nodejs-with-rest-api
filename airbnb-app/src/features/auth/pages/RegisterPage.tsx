import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { Button, Card, Input, Label } from '../../../shared/components';
import { User, Mail, Lock, Phone, UserPlus, ArrowRight, BookOpen } from 'lucide-react';
import type { RegisterPayload } from '../types/auth.types';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterPayload>({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    role: 'GUEST',
    bio: ''
  });
  const { handleRegister, isLoading, error } = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-surface-50">
      <Card className="w-full max-w-2xl p-8 sm:p-12 shadow-2xl animate-fade-in" hoverable={false}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2 font-medium">Join our community and start exploring</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="name" required>Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                onChange={handleChange}
                placeholder="John Doe"
                leftIcon={<User size={18} />}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="username" required>Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                onChange={handleChange}
                placeholder="johndoe123"
                leftIcon={<User size={18} />}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="email" required>Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                onChange={handleChange}
                placeholder="john@example.com"
                leftIcon={<Mail size={18} />}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" required>Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                onChange={handleChange}
                placeholder="+250 788 123 456"
                leftIcon={<Phone size={18} />}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="password" required>Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                onChange={handleChange}
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="role" required>I want to...</Label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-airbnb focus:ring-2 focus:ring-airbnb/10 outline-none transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="GUEST">Book unique places (Guest)</option>
                  <option value="HOST">Host my home (Host)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-4 text-gray-400" size={18} />
              <textarea
                id="bio"
                name="bio"
                onChange={handleChange}
                placeholder="Tell us a little about yourself..."
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-airbnb focus:ring-2 focus:ring-airbnb/10 outline-none transition-all resize-none font-medium"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full py-4 rounded-xl text-lg font-bold shadow-lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={20} />}
            >
              Create Account
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-airbnb font-black hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
