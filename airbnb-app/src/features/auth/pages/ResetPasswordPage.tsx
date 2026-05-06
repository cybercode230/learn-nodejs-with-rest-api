import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { Button, Card, Input, Label, Skeleton } from '../../../shared/components';
import { Lock, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  
  const { validateToken, resetPassword, isLoading, error, successMessage } = usePasswordReset();

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        const { valid } = await validateToken(token);
        setIsTokenValid(valid);
      }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    if (token) {
      await resetPassword(token, { newPassword });
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
        <Card className="w-full max-w-md p-10 text-center" hoverable={false}>
          <div className="animate-spin inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your link</h1>
          <p className="text-gray-500 mb-8 font-medium italic">Please wait while we secure your account access...</p>
          <div className="space-y-4">
            <Skeleton height={56} className="rounded-xl" />
            <Skeleton height={56} className="rounded-xl" />
            <Skeleton height={56} className="rounded-xl" />
          </div>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
        <Card className="w-full max-w-md p-10 text-center" hoverable={false}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-500 mb-8 font-medium">This password reset link is no longer valid. Please request a new one.</p>
          <Link to="/forgot-password">
            <Button className="w-full">Request New Link</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
      <Card className="w-full max-w-md p-8 sm:p-10 shadow-2xl animate-fade-in" hoverable={false}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-500 mt-2 font-medium">Please enter and confirm your new password below.</p>
        </div>

        {successMessage ? (
          <div className="text-center space-y-6">
            <div className="p-6 bg-green-50 border border-green-100 rounded-2xl">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-900 mb-2">Success!</h2>
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
            <Link to="/login" className="block">
              <Button className="w-full" rightIcon={<ArrowRight size={18} />}>
                Go to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || validationError) && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">
                {error || validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="newPassword" required>New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" required>Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-xl text-lg font-bold shadow-lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={20} />}
            >
              Update Password
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

export default ResetPasswordPage;
