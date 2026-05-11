import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion } from 'framer-motion';

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
        className="w-full max-w-lg p-10 sm:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-fade-in rounded-[2.5rem] bg-white border border-gray-100/50"
        hoverable={false}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-airbnb/5 text-airbnb mb-6 shadow-inner">
            <Lock size={40} strokeWidth={2.5} />
          </div>

          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-3 font-medium text-lg">
            Sign in to your premium account
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="space-y-6"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3"
            >
              <div className="w-1.5 h-10 bg-red-500 rounded-full" />
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
              Email Address
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail size={20} className="text-gray-400" />}
              className="py-4 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-lg font-medium"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <FormFieldError
              error={formik.errors.email}
              touched={formik.touched.email}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label htmlFor="password"  className="text-xs font-black uppercase tracking-widest text-gray-400">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-airbnb hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={20} className="text-gray-400" />}
              className="py-4 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-lg font-medium"
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
            className="w-full py-5 rounded-[1.25rem] text-xl font-black shadow-2xl shadow-airbnb/20 mt-4 h-auto"
            isLoading={isLoading}
            disabled={!formik.isValid || formik.isSubmitting}
            rightIcon={<ArrowRight size={22} strokeWidth={3} />}
          >
            Sign In
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-6 bg-white text-gray-400 font-black uppercase tracking-widest text-[10px]">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-gray-100 font-black text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all">
            <Globe size={20} className="text-blue-500" />
            Google
          </button>
          <button className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-gray-100 font-black text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all">
            <User size={20} className="text-gray-900" />
            Github
          </button>
        </div>

        <p className="mt-10 text-center text-gray-500 font-medium">
          New to Airbnb Pro?{' '}
          <Link to="/register" className="text-airbnb font-black hover:underline ml-1">
            Create account
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
