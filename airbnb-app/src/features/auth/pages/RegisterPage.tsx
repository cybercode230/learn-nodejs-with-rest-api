import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion } from 'framer-motion';

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
        className="w-full max-w-3xl p-10 sm:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-fade-in rounded-[2.5rem] bg-white border border-gray-100/50"
        hoverable={false}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-airbnb/5 text-airbnb mb-6 shadow-inner">
            <UserPlus size={40} strokeWidth={2.5} />
          </div>

          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            Create your account
          </h1>

          <p className="text-gray-500 mt-3 font-medium text-lg">
            Join the premium travel community
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                leftIcon={<User size={20} className="text-gray-400" />}
                className="py-3.5 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-medium"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.name}
                touched={formik.touched.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe123"
                leftIcon={<User size={20} className="text-gray-400" />}
                className="py-3.5 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-medium"
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
            <div className="space-y-2">
              <Label htmlFor="email" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                leftIcon={<Mail size={20} className="text-gray-400" />}
                className="py-3.5 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-medium"
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
              <Label htmlFor="phone" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="+250 788 123 456"
                leftIcon={<Phone size={20} className="text-gray-400" />}
                className="py-3.5 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-medium"
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
            <div className="space-y-2">
              <Label htmlFor="password" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={20} className="text-gray-400" />}
                className="py-3.5 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-medium"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.password}
                touched={formik.touched.password}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">
                I want to...
              </Label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-airbnb focus:ring-4 focus:ring-airbnb/5 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
                >
                  <option value="GUEST">Book unique places (Guest)</option>
                  <option value="HOST">Host my home (Host)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ArrowRight size={18} className="rotate-90" />
                </div>
              </div>
              <FormFieldError
                error={formik.errors.role}
                touched={formik.touched.role}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">Bio (Optional)</Label>
            <div className="relative">
              <BookOpen className="absolute left-6 top-4 text-gray-400" size={20} />
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell us a little about yourself..."
                rows={3}
                value={formik.values.bio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full pl-14 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-airbnb focus:ring-4 focus:ring-airbnb/5 outline-none transition-all resize-none font-medium text-gray-700"
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
              className="w-full py-5 rounded-[1.25rem] text-xl font-black shadow-2xl shadow-airbnb/20 mt-4 h-auto"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
              rightIcon={<ArrowRight size={22} strokeWidth={3} />}
            >
              Create Account
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-airbnb font-black hover:underline ml-1">
            Log in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
