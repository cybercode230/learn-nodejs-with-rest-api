import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import { forgotPasswordSchema } from '../schemas/password.schema';
import { usePasswordReset } from '../hooks/usePasswordReset';

import {
  Button,
  Card,
  Input,
  Label,
} from '../../../shared/components';

import FormFieldError from '../components/FormFieldError';

import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Key,
} from 'lucide-react';

import AuthLayout from '../components/AuthLayout';

/**
 * File: ForgotPasswordPage.tsx
 * What it is doing: Manages the password recovery initiation flow.
 * Responsibility: Implementing Formik + Zod for email validation and handling reset link requests.
 * Outcomes: Clean user interface for password recovery, secure email validation, and clear success feedback.
 */
const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading, error, successMessage, clearError } = usePasswordReset();

  const formik = useFormik({
    initialValues: {
      email: '',
    },

    validationSchema: toFormikValidationSchema(forgotPasswordSchema),

    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      await forgotPassword(values);
    },
  });

  // Clear backend error when user starts typing again
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formik.values.email, error, clearError]);

  return (
    <AuthLayout>
      <Card
        className="w-full max-w-md p-8 sm:p-10 shadow-2xl animate-fade-in rounded-3xl bg-white/95 backdrop-blur-md"
        hoverable={false}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-4">
            <Key size={32} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password?
          </h1>

          <p className="text-gray-500 mt-2 font-medium">
            No worries, we'll send you reset instructions.
          </p>
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
              <Label htmlFor="email" required>
                Email Address
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail size={18} />}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

              <FormFieldError
                error={formik.errors.email}
                touched={formik.touched.email}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-xl text-lg font-bold"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
              rightIcon={<ArrowRight size={20} />}
            >
              Reset Password
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

export default ForgotPasswordPage;
