import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import { registerSchema } from '../schemas/register.schema';
import { useRegister } from '../hooks/useRegister';

import {
  Button,
  Card,
  Input,
  Label,
} from '../../../shared/components';

import FormFieldError from '../components/FormFieldError';

import {
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

import AuthLayout from '../components/AuthLayout';

/**
 * File: RegisterPage.tsx
 * What it is doing: Manages new user registration through a professional, schema-validated form.
 * Responsibility: Implementing Formik + Zod for real-time validation and multi-step data collection.
 * Outcomes: Reliable user registration, clean data validation, and premium onboarding experience.
 */
const RegisterPage: React.FC = () => {
  const { handleRegister, isLoading, error, clearError } = useRegister();

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'GUEST',
      bio: '',
    },

    validationSchema: toFormikValidationSchema(registerSchema),

    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      await handleRegister(values as any);
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
        className="w-full max-w-2xl p-8 sm:p-12 shadow-2xl animate-fade-in rounded-3xl bg-white/95 backdrop-blur-md"
        hoverable={false}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-airbnb/10 text-airbnb mb-4">
            <UserPlus size={32} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>

          <p className="text-gray-500 mt-2 font-medium">
            Join our community and start exploring the world
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" required>
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                leftIcon={<User size={18} />}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.name}
                touched={formik.touched.name}
              />
            </div>

            <div>
              <Label htmlFor="username" required>
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe123"
                leftIcon={<User size={18} />}
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.username}
                touched={formik.touched.username}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email" required>
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
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
              <Label htmlFor="phone" required>
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="+250 788 123 456"
                leftIcon={<Phone size={18} />}
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.phone}
                touched={formik.touched.phone}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="password" required>
                Password
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
              <Label htmlFor="role" required>
                I want to...
              </Label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-airbnb focus:ring-2 focus:ring-airbnb/10 outline-none transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="GUEST">Book unique places (Guest)</option>
                  <option value="HOST">Host my home (Host)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
              <FormFieldError
                error={formik.errors.role}
                touched={formik.touched.role}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-4 text-gray-400" size={18} />
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell us a little about yourself..."
                rows={3}
                value={formik.values.bio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-airbnb focus:ring-2 focus:ring-airbnb/10 outline-none transition-all resize-none font-medium"
              />
            </div>
            <FormFieldError
              error={formik.errors.bio}
              touched={formik.touched.bio}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full py-4 rounded-xl text-lg font-bold shadow-lg"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
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
    </AuthLayout>
  );
};

export default RegisterPage;
