import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { Button, Card, Input, Label } from '../../../shared/components';
import { Mail, ArrowRight, ArrowLeft, Key } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading, error, successMessage } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword({ email });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
      <Card className="w-full max-w-md p-8 sm:p-10 shadow-2xl animate-fade-in" hoverable={false}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-4">
            <Key size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-2 font-medium">No worries, we'll send you reset instructions.</p>
        </div>

        {successMessage ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-bold text-center">
              {successMessage}
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full" leftIcon={<ArrowLeft size={18} />}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="email" required>Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                leftIcon={<Mail size={18} />}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-xl text-lg font-bold"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={20} />}
            >
              Reset Password
            </Button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mt-6">
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
