import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import { loginSchema } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';

import {
  Button,
  Card,
  Input,
  Label,
} from '../../../shared/components';

import FormFieldError from '../components/FormFieldError';

import {
  Mail,
  Lock,
  ArrowRight,
  Globe,
  User,
} from 'lucide-react';

import AuthLayout from '../components/AuthLayout';

/**
 * File: LoginPage.tsx
 * What it is doing: Handles user authentication through a secure, validated login form.
 * Responsibility: Implementing Formik + Zod for real-time validation and managing authentication state.
 * Outcomes: Secure user login, consistent error feedback, and professional UI/UX.
 */
const LoginPage: React.FC = () => {
  const { handleLogin, isLoading, error, clearError } = useLogin();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },

    validationSchema: toFormikValidationSchema(loginSchema),

    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      await handleLogin(values);
    },
  });

  // Clear backend error when user starts typing again
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formik.values, error, clearError]);

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
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2 font-medium">
            Sign in to continue to your dashboard
          </p>
        </div>

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
              placeholder="name@example.com"
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

          <div>
            <div className="flex justify-between items-center pr-1">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-airbnb hover:underline mb-1.5"
              >
                Forgot password?
              </Link>
            </div>

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

          <Button
            type="submit"
            className="w-full py-4 rounded-xl text-lg shadow-airbnb/20"
            isLoading={isLoading}
            disabled={!formik.isValid || formik.isSubmitting}
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
            <span className="px-4 bg-white/50 backdrop-blur-sm text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full font-bold bg-white/50" leftIcon={<Globe size={18} />}>
            Google
          </Button>
          <Button variant="outline" className="w-full font-bold bg-white/50" leftIcon={<User size={18} />}>
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
    </AuthLayout>
  );
};

export default LoginPage;
