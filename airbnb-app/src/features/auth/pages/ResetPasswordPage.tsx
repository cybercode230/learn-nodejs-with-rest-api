import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import { resetPasswordSchema } from '../schemas/password.schema';
import { usePasswordReset } from '../hooks/usePasswordReset';

import {
  Button,
  Card,
  Input,
  Label,
  Skeleton,
} from '../../../shared/components';

import FormFieldError from '../components/FormFieldError';

import {
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

import AuthLayout from '../components/AuthLayout';

/**
 * File: ResetPasswordPage.tsx
 * What it is doing: Finalizes the password reset flow using a secure, validated form.
 * Responsibility: Verifying the reset token, validating new password entries, and handling the update request.
 * Outcomes: Secure password update, real-time validation of matching passwords, and professional loading/error states.
 */
const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  
  const { validateToken, resetPassword, isLoading, error, successMessage, clearError } = usePasswordReset();

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        const { valid } = await validateToken(token);
        setIsTokenValid(valid);
      }
    };
    checkToken();
  }, [token, validateToken]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },

    validationSchema: toFormikValidationSchema(resetPasswordSchema),

    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      if (token) {
        await resetPassword(token, { newPassword: values.password });
      }
    },
  });

  // Clear backend error when user starts typing again
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formik.values.password, formik.values.confirmPassword, error, clearError]);

  if (isTokenValid === null) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md p-10 text-center bg-white/95 backdrop-blur-md rounded-3xl" hoverable={false}>
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
      </AuthLayout>
    );
  }

  if (isTokenValid === false) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md p-10 text-center rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl" hoverable={false}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-500 mb-8 font-medium">This password reset link is no longer valid. Please request a new one.</p>
          <Link to="/forgot-password">
            <Button className="w-full">Request New Link</Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card
        className="w-full max-w-md p-8 sm:p-10 shadow-2xl animate-fade-in rounded-3xl bg-white/95 backdrop-blur-md"
        hoverable={false}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-4">
            <Lock size={32} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Set New Password
          </h1>

          <p className="text-gray-500 mt-2 font-medium">
            Please enter and confirm your new password below.
          </p>
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
          <form
            onSubmit={formik.handleSubmit}
            className="space-y-6"
          >
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="password" required>
                New Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.password}
                touched={formik.touched.password}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.confirmPassword}
                touched={formik.touched.confirmPassword}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-xl text-lg font-bold shadow-lg"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
              rightIcon={<ArrowRight size={20} />}
            >
              Update Password
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mt-6"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
