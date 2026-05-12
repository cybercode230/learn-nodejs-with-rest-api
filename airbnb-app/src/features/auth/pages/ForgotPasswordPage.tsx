import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  Key,
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-airbnb/5 text-[#FF385C] mb-6 shadow-inner">
            <Key size={40} strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
            Forgot Password?
          </h1>

          <p className="text-gray-500 mt-3 font-medium">
            No worries, we'll send you reset instructions to your email.
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
                <Button className="w-full py-4 rounded-2xl text-lg font-black bg-gray-900 hover:bg-gray-800 text-white shadow-xl h-auto" leftIcon={<ArrowLeft size={20} />}>
                  Back to Login
                </Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  leftIcon={<Mail size={18} className="text-gray-400" />}
                  className="py-4 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-base font-medium"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.email} touched={formik.touched.email} />
              </div>

              <Button
                type="submit"
                className="w-full py-4 rounded-2xl text-lg font-black bg-[#FF385C] hover:bg-[#FF385C]/90 text-white shadow-lg shadow-[#FF385C]/20 mt-2 h-auto"
                isLoading={isLoading}
                disabled={!formik.isValid || formik.isSubmitting}
                rightIcon={<ArrowRight size={20} strokeWidth={3} />}
              >
                Send Reset Link
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

export default ForgotPasswordPage;

