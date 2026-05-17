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
  ArrowRight,   
  TableProperties,
  CheckCircle2,
  Eye,
  EyeOff,
  UsersIcon
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
      description: 'Discover unique places.',
      icon: <UsersIcon size={18} />,
      color: 'bg-blue-500'
    },
    {
      id: 'HOST',
      title: 'Host',
      description: 'Start earning today.',
      icon: <TableProperties size={18} />,
      color: 'bg-airbnb'
    }
  ];

  return (
    <AuthLayout>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-100"
      >
        {/* Left Side: Branding & Role */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-transparent text-white overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-8">
              < div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-airbnb">
                  <img src="./logo.svg" alt="airb application logo"  className='flex-1'/>
                </div>
                <span className="text-xl text-airbnb">airbnb</span>
              </div>
            </Link>

            <h1 className="text-3xl mb-6 text-black/80 leading-tight">Join us, Make<br /> money with quick uploads</h1>
            
            <div className="space-y-3">
              <p className="text-xs text-black/50 mb-2">Select your role to start process</p>
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => formik.setFieldValue('role', role.id)}
                  className={`w-full p-2 rounded-xl transition-all flex items-center gap-4 text-start border border-gray-200 text-black/80 ${
                    formik.values.role === role.id 
                      ? 'border border-gray-400' 
                      : 'bg-transparent text-black/80 hover:bg-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    formik.values.role === role.id ? role.color + ' text-white' : 'bg-white/20'
                  }`}>
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black">{role.title}</h3>
                    <p className={`text-[10px] font-medium ${formik.values.role === role.id ? 'text-gray-500' : 'text-black/80'}`}>
                      {role.description}
                    </p>
                  </div>
                  {formik.values.role === role.id && (
                    <CheckCircle2 size={16} className="ml-auto text-airbnb" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/20">
            <p className="text-white/70 text-xs font-medium">
              Start your journey with airbnb today
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto custom-scrollbar ">
          <div className="md:hidden flex justify-center mb-6">
            < div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-airbnb">
                  <img src="./logo.svg" alt="airb application logo"  className='flex-1'/>
                </div>
                <span className="text-xl text-airbnb">airbnb</span>
              </div>
          </div>

          <div className="mb-5">
            <h2 className="text-xl mb-1 text-black/80 leading-tight">Identification</h2>            
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-2">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[14px]  text-black/80 ml-1">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  leftIcon={<User size={14} className="text-gray-400" />}
                  className="py-2.5 px-4 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-xs font-medium"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.name} touched={formik.touched.name} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[14px]  text-black/80 ml-1">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  leftIcon={<User size={14} className="text-gray-400" />}
                  className="py-2.5 px-4 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-xs font-medium"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.username} touched={formik.touched.username} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[14px]  text-black/80 ml-1">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  leftIcon={<Mail size={14} className="text-gray-400" />}
                  className="py-2.5 px-4 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-xs font-medium"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.email} touched={formik.touched.email} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[14px]  text-black/80 ml-1">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 234..."
                  leftIcon={<Phone size={14} className="text-gray-400" />}
                  className="py-2.5 px-4 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-xs font-medium"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.phone} touched={formik.touched.phone} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password"  className="text-[14px]  text-black/80 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  leftIcon={<Lock size={14} className="text-gray-400" />}
                  className="py-2.5 px-4 pr-12 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-all text-xs font-medium"
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
                          className={`h-1.5 w-14 rounded-full transition-all duration-500 ${
                            step <= strength 
                              ? strength <= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                              : 'bg-gray-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-black/80">
                    {formik.values.password.length < 8 ? 'Weak (min 8 chars)' : 'Strong password'}
                  </p>
                </div>
              )}
              <FormFieldError error={formik.errors.password} touched={formik.touched.password} />
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-lg text-sm font-black bg-airbnb hover:bg-airbnb/90 text-white mt-2 h-auto"
              isLoading={isLoading}
              disabled={!formik.isValid || formik.isSubmitting}
              rightIcon={<ArrowRight size={16} strokeWidth={3} />}
            >
              Sign Up
            </Button>
          </form>


          <p className="mt-6 text-start text-sm text-gray-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-airbnb font-medium hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default RegisterPage;
