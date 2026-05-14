import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  BadgeDollarSign,
  Eye,
  EyeOff
} from 'lucide-react';

import { loginSchema } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';
import { Button, Input, Label } from '../../../shared/components';
import FormFieldError from '../components/FormFieldError';
import AuthLayout from '../components/AuthLayout';

const LoginPage: React.FC = () => {
  const { handleLogin, isLoading, error, clearError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formik.values, error, clearError]);

  const features = [
    { icon: <ShieldCheck className="w-4 h-4" />, text: "Secure Infrastructure" },
    { icon: <Clock className="w-4 h-4" />, text: "24/7 Support" },
    { icon: <BadgeDollarSign className="w-4 h-4" />, text: "Money-back Guarantee" }
  ];

  return (
    <AuthLayout>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-100"
      >
        {/* Left Side: Branding */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-airbnb via-airbnb/90 to-pink-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-airbnb">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tight">airbnb</span>
              </div>
            </Link>

            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black mb-4 leading-tight"
            >
              Welcome<br />Back
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  {feature.text}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/20">
            <p className="text-white/70 text-xs font-medium">
              Join thousands of hosts and guests
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto custom-scrollbar">
          <div className="md:hidden flex justify-center mb-6">
            <div className="flex items-center gap-2 text-airbnb">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-xl font-black tracking-tight text-gray-900">airbnb</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900 mb-1">Sign In</h2>
            <p className="text-xs text-gray-500 font-medium">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail size={16} className="text-gray-400" />}
                className="py-2.5 px-4 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError error={formik.errors.email} touched={formik.touched.email} />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-airbnb hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  leftIcon={<Lock size={16} className="text-gray-400" />}
                  className="py-2.5 px-4 pr-12 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormFieldError error={formik.errors.password} touched={formik.touched.password} />
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-black bg-airbnb hover:bg-airbnb/90 text-white mt-2 h-auto"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
              rightIcon={<ArrowRight size={16} strokeWidth={3} />}
            >
              Sign In
            </Button>
          </form>


          <p className="mt-6 text-center text-xs text-gray-500 font-medium">
            New to airbnb?{' '}
            <Link to="/register" className="text-airbnb font-black hover:underline ml-1">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default LoginPage;