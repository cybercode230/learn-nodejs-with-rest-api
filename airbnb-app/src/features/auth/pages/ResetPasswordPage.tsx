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
  Eye,
  EyeOff,  
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

  const renderContent = () => {
    if (isTokenValid === null) {
      return (
        <div className="text-center space-y-6">
          <div className="animate-spin inline-flex items-center justify-center w-12 h-12 rounded-xl bg-airbnb/5 text-airbnb shadow-inner">
            <Lock size={24} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Verifying Link</h2>
          <div className="space-y-3">
            <Skeleton height={45} className="rounded-lg" />
            <Skeleton height={45} className="rounded-lg" />
          </div>
        </div>
      );
    }

    if (isTokenValid === false) {
      return (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-500 shadow-inner">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Expired Link</h2>
          <p className="text-xs text-gray-500 font-medium">This reset link is no longer valid or has expired.</p>
          <Link to="/forgot-password" title="Request New Link">
            <Button className="w-full py-2.5 rounded-lg text-sm font-black bg-airbnb hover:bg-airbnb/90 h-auto">Request New Link</Button>
          </Link>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        {successMessage ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-emerald-800 text-sm font-bold">{successMessage}</p>
            </div>
            
            <Link to="/login" className="block">
              <Button className="w-full py-2.5 rounded-lg text-sm font-black bg-gray-900 hover:bg-gray-800 text-white h-auto" rightIcon={<ArrowRight size={16} />}>
                Go to Sign In
              </Button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password"  className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                New Password
              </Label>
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
              {formik.values.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((step) => {
                      const strength = 
                        (formik.values.password.length >= 8 ? 1 : 0) +
                        (/[A-Z]/.test(formik.values.password) ? 1 : 0) +
                        (/[0-9]/.test(formik.values.password) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(formik.values.password) ? 1 : 0);
                      return (
                        <div 
                          key={step} 
                          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                            step <= strength 
                              ? strength <= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                              : 'bg-gray-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              <FormFieldError error={formik.errors.password} touched={formik.touched.password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword"  className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  leftIcon={<Lock size={16} className="text-gray-400" />}
                  className="py-2.5 px-4 pr-12 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormFieldError error={formik.errors.confirmPassword} touched={formik.touched.confirmPassword} />
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-black bg-airbnb hover:bg-airbnb/90 text-white mt-2 h-auto"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
              rightIcon={<ArrowRight size={16} strokeWidth={3} />}
            >
              Update Password
            </Button>
          </form>
        )}
      </AnimatePresence>
    );
  };

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

            <h1 className="text-3xl font-black mb-4 leading-tight">Secure your<br />Account</h1>
            <p className="text-sm font-medium text-white/80 max-w-[200px]">
              Choose a strong password to keep your data safe.
            </p>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/20">
            <p className="text-white/70 text-xs font-medium">
              Powered by advanced security protocols
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
            <h2 className="text-xl font-black text-gray-900 mb-1">Set New Password</h2>
            <p className="text-xs text-gray-500 font-medium">Update your credentials securely</p>
          </div>

          {renderContent()}
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

