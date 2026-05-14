import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft,   
  CheckCircle2
} from 'lucide-react';

import { forgotPasswordSchema } from '../schemas/password.schema';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { Button, Input, Label } from '../../../shared/components';
import FormFieldError from '../components/FormFieldError';
import AuthLayout from '../components/AuthLayout';

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

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formik.values.email, error, clearError]);

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

            <h1 className="text-3xl font-black mb-4 leading-tight">Reset your<br />Password</h1>
            <p className="text-sm font-medium text-white/80 max-w-[200px]">
              Don't worry, we'll help you get back into your account in no time.
            </p>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/20">
            <p className="text-white/70 text-xs font-medium">
              Secure and verified account recovery
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
            <h2 className="text-xl font-black text-gray-900 mb-1">Recover Access</h2>
            <p className="text-xs text-gray-500 font-medium">Enter your email for reset instructions</p>
          </div>

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
                  <p className="text-emerald-800 text-sm font-bold">
                    {successMessage}
                  </p>
                </div>
                
                <Link to="/login" className="block">
                  <Button className="w-full py-2.5 rounded-lg text-sm font-black bg-gray-900 hover:bg-gray-800 text-white h-auto" leftIcon={<ArrowLeft size={16} />}>
                    Back to Sign In
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

                <Button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-sm font-black bg-airbnb hover:bg-airbnb/90 text-white mt-2 h-auto"
                  isLoading={isLoading}
                  disabled={!formik.isValid || formik.isSubmitting}
                  rightIcon={<ArrowRight size={16} strokeWidth={3} />}
                >
                  Send Reset Link
                </Button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-airbnb transition-colors mt-6"
                >
                  <ArrowLeft size={14} strokeWidth={3} />
                  <span>Return to Sign In</span>
                </Link>
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

