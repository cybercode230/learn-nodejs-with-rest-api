import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  ArrowRight, 
  Home, 
  Compass, 
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

import { registerSchema } from '../schemas/register.schema';
import { useRegister } from '../hooks/useRegister';
import { Button, Input, Label } from '../../../shared/components';
import FormFieldError from '../components/FormFieldError';
import AuthLayout from '../components/AuthLayout';

const RegisterPage: React.FC = () => {
  const { handleRegister, isLoading, error, clearError } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formik.values, error, clearError]);

  const roles = [
    {
      id: 'GUEST',
      title: 'Guest',
      description: 'Discover unique places and experiences.',
      icon: <Compass className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'HOST',
      title: 'Host',
      description: 'List your property and start earning.',
      icon: <Home className="w-6 h-6" />,
      color: 'bg-[#FF385C]'
    }
  ];

  return (
    <AuthLayout>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden grid md:grid-cols-2"
      >
        {/* Left Side: Role Selection & Branding */}
        <div className="relative hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#FF385C] via-[#FF385C]/90 to-pink-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-12">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF385C]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight">Hostify</span>
              </div>
            </Link>

            <h2 className="text-4xl font-black mb-8 leading-tight">Choose your journey</h2>
            
            <div className="space-y-4">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  type="button"
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => formik.setFieldValue('role', role.id)}
                  className={`w-full p-6 rounded-3xl border-2 transition-all flex items-start gap-4 text-left ${
                    formik.values.role === role.id 
                      ? 'bg-white text-gray-900 border-white shadow-xl' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    formik.values.role === role.id ? role.color + ' text-white' : 'bg-white/20'
                  }`}>
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{role.title}</h3>
                    <p className={`text-sm font-medium ${formik.values.role === role.id ? 'text-gray-500' : 'text-white/70'}`}>
                      {role.description}
                    </p>
                  </div>
                  {formik.values.role === role.id && (
                    <div className="ml-auto mt-1">
                      <CheckCircle2 className={`w-6 h-6 ${role.id === 'HOST' ? 'text-[#FF385C]' : 'text-blue-500'}`} />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm font-medium">
              Every great adventure starts with a single step. Join us today.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="md:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2 text-[#FF385C]">
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-2xl font-black tracking-tight text-gray-900">Hostify</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500 font-medium">Join our global community of hosts and travelers</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold mb-4"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  leftIcon={<User size={16} className="text-gray-400" />}
                  className="py-3 px-5 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.name} touched={formik.touched.name} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  leftIcon={<User size={16} className="text-gray-400" />}
                  className="py-3 px-5 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.username} touched={formik.touched.username} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  leftIcon={<Mail size={16} className="text-gray-400" />}
                  className="py-3 px-5 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.email} touched={formik.touched.email} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 234 567 890"
                  leftIcon={<Phone size={16} className="text-gray-400" />}
                  className="py-3 px-5 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.phone} touched={formik.touched.phone} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password"  className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  leftIcon={<Lock size={16} className="text-gray-400" />}
                  className="py-3 px-5 pr-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormFieldError error={formik.errors.password} touched={formik.touched.password} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bio (Optional)</Label>
              <div className="relative">
                <div className="absolute top-4 left-5 text-gray-400">
                  <FileText size={16} />
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us a bit about yourself..."
                  className="w-full py-3 pl-12 pr-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] outline-none transition-all text-sm font-medium min-h-[80px] resize-none"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-2xl text-lg font-black bg-[#FF385C] hover:bg-[#FF385C]/90 text-white shadow-lg shadow-[#FF385C]/20 mt-2 h-auto"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
              rightIcon={<ArrowRight size={20} strokeWidth={3} />}
            >
              Join Hostify
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button className="flex items-center justify-center gap-3 py-2 px-4 rounded-2xl border border-gray-100 font-bold text-xs text-gray-700 hover:bg-gray-50 transition-all w-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center text-gray-500 font-medium text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF385C] font-black hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default RegisterPage;
