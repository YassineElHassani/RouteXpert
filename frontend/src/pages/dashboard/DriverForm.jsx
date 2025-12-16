import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createDriver, updateDriver, reset } from '../../store/slices/userSlice';
import { toast } from 'react-hot-toast';
import { Users, ArrowLeft, Save, Mail, Phone, Lock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';
import { containerVariants, itemVariants } from '@/lib/animations';

const DriverForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, phone, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = !!id;

  const { drivers, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.users
  );

  useEffect(() => {
    if (isEditMode) {
      const driverToEdit = drivers.find((d) => d._id === id);
      if (driverToEdit) {
        setFormData({
          name: driverToEdit.name || '',
          email: driverToEdit.email || '',
          phone: driverToEdit.phone || '',
          password: '',
          confirmPassword: '',
        });
      } else {
        navigate('/dashboard/drivers');
      }
    }
  }, [id, isEditMode, drivers, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success(isEditMode ? 'Driver updated!' : 'Driver created!');
      navigate('/dashboard/drivers');
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch, isEditMode]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isEditMode && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isEditMode && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const driverData = {
      name,
      email,
      phone,
      ...(password && { password }),
    };

    if (isEditMode) {
      dispatch(updateDriver({ id, driverData }));
    } else {
      dispatch(createDriver(driverData));
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <Link to="/dashboard/drivers">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drivers
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Driver' : 'Add New Driver'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update driver information' : 'Register a new driver for your fleet'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Driver Information</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the details below to {isEditMode ? 'update' : 'register'} a driver.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-orange" />
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="e.g., John Doe"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={name}
                    onChange={onChange}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-orange" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="driver@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={email}
                    onChange={onChange}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-orange" />
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder="+1234567890"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={phone}
                    onChange={onChange}
                  />
                </div>

                {/* Password Section */}
                <div className="md:col-span-2 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-brand-orange mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {isEditMode ? 'Change Password (leave blank to keep current)' : 'Set Password'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">
                        {isEditMode ? 'New Password' : 'Password'}
                      </Label>
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        required={!isEditMode}
                        minLength={6}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                        value={password}
                        onChange={onChange}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm Password
                      </Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        required={!isEditMode && password.length > 0}
                        minLength={6}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                        value={confirmPassword}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Link to="/dashboard/drivers">
                  <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/5">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isEditMode ? 'Update Driver' : 'Register Driver'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DriverForm;
