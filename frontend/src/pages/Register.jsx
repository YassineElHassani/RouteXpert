import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { registerUser, reset } from '../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Truck, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'driver',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { name, email, password, phone } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      password,
      phone,
      role: 'driver',
    };

    dispatch(registerUser(userData));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-brand-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-orange/10">
                <Truck className="h-6 w-6 text-brand-orange" />
              </div>
              <span className="text-xl font-bold gradient-text">RouteXpert</span>
            </Link>
          </div>

          <Card className="bg-brand-dark/50 border-white/5">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-brand-grey">Create Account</CardTitle>
              <CardDescription className="text-brand-muted">
                Sign up to start managing your fleet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-brand-grey">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={onChange}
                      required
                      className="pl-10 bg-brand-navy/50 border-white/10 text-brand-grey placeholder:text-brand-muted focus:border-brand-orange focus:ring-brand-orange/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand-grey">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={onChange}
                      required
                      className="pl-10 bg-brand-navy/50 border-white/10 text-brand-grey placeholder:text-brand-muted focus:border-brand-orange focus:ring-brand-orange/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-brand-grey">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={onChange}
                      required
                      minLength={6}
                      className="pl-10 pr-10 bg-brand-navy/50 border-white/10 text-brand-grey placeholder:text-brand-muted focus:border-brand-orange focus:ring-brand-orange/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-grey transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-brand-muted">Must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-brand-grey">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={onChange}
                      className="pl-10 bg-brand-navy/50 border-white/10 text-brand-grey placeholder:text-brand-muted focus:border-brand-orange focus:ring-brand-orange/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-navy/30 border border-white/5">
                  <Shield className="h-4 w-4 text-brand-orange" />
                  <p className="text-xs text-brand-muted">
                    You'll be registered as a <span className="text-brand-orange font-medium">Driver</span>. 
                    Admin accounts are created separately.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-black font-semibold h-11"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-brand-muted">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-brand-orange hover:text-brand-amber font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-brand-muted">
            <Link to="/" className="hover:text-brand-orange transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-bl from-brand-orange via-brand-amber to-brand-orange" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-black/10 rounded-full blur-xl"
        />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex p-4 rounded-2xl bg-black/10 backdrop-blur-sm">
              <Truck className="h-16 w-16 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Join RouteXpert
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg text-white/80 max-w-md"
          >
            Create your account and start managing your fleet with the most powerful tracking and management platform.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 grid grid-cols-2 gap-4 text-left"
          >
            {[
              'Real-time tracking',
              'Fuel monitoring',
              'Route optimization',
              'Maintenance alerts',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-white/90">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
