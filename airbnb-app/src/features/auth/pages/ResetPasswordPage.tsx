import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

import { resetPasswordSchema } from '../schemas/password.schema';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { Button, Input, Label, Skeleton } from '../../../shared/components';
import FormFieldError from '../components/FormFieldError';
import AuthLayout from '../components/AuthLayout';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formik.values.password, formik.values.confirmPassword, error, clearError]);

  if (isTokenValid === null) {
    return (
      <AuthLayout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 text-center"
        >
          <div className="animate-spin inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-airbnb/5 text-[#FF385C] mb-8 shadow-inner">
            <Lock size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Verifying Link</h1>
          <p className="text-gray-500 mb-10 font-medium">Securing your account access, please wait...</p>
          <div className="space-y-6">
            <Skeleton height={60} className="rounded-2xl" />
            <Skeleton height={60} className="rounded-2xl" />
            <Skeleton height={60} className="rounded-2xl" />
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  if (isTokenValid === false) {
    return (
      <AuthLayout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 text-red-500 mb-8 shadow-inner">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Expired Link</h1>
          <p className="text-gray-500 mb-10 font-medium">This password reset link is no longer valid or has expired.</p>
          <Link to="/forgot-password">
            <Button className="w-full py-4 rounded-2xl text-lg font-black bg-[#FF385C] hover:bg-[#FF385C]/90 h-auto">Request New Link</Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-airbnb/5 text-[#FF385C] mb-6 shadow-inner">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
            Reset Password
          </h1>

          <p className="text-gray-500 mt-3 font-medium">
            Strong passwords help keep your account secure.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {successMessage ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="p-6 bg-green-50 border border-green-100 rounded-3xl flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <p className="text-green-800 font-bold">
                  {successMessage}
                </p>
              </div>
              
              <Link to="/login" className="block">
                <Button className="w-full py-4 rounded-2xl text-lg font-black bg-gray-900 hover:bg-gray-800 text-white shadow-xl h-auto" rightIcon={<ArrowRight size={20} />}>
                  Go to Sign In
                </Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={formik.handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold mb-4"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password"  className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    leftIcon={<Lock size={18} className="text-gray-400" />}
                    className="py-4 px-6 pr-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-base font-medium"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FormFieldError error={formik.errors.password} touched={formik.touched.password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword"  className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    leftIcon={<Lock size={18} className="text-gray-400" />}
                    className="py-4 px-6 pr-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-base font-medium"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FormFieldError error={formik.errors.confirmPassword} touched={formik.touched.confirmPassword} />
              </div>

              <Button
                type="submit"
                className="w-full py-4 rounded-2xl text-lg font-black bg-[#FF385C] hover:bg-[#FF385C]/90 text-white shadow-lg shadow-[#FF385C]/20 mt-2 h-auto"
                isLoading={isLoading}
                disabled={!formik.isValid || formik.isSubmitting}
                rightIcon={<ArrowRight size={20} strokeWidth={3} />}
              >
                Update Password
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-black text-gray-400 hover:text-[#FF385C] transition-colors mt-8"
              >
                <ArrowLeft size={18} strokeWidth={3} />
                <span>Return to Sign In</span>
              </Link>
            </form>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

