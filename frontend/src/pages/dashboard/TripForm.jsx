import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { createTrip, updateTrip, getTrip, reset } from '../../store/slices/tripSlice';
import { getTrucks } from '../../store/slices/truckSlice';
import { getTrailers } from '../../store/slices/trailerSlice';
import { getUsers } from '../../store/slices/userSlice';
import { ArrowLeft, Save, Route, MapPin, Calendar, User, Truck, Container, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { containerVariants, itemVariants } from '@/lib/animations';

const TripForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const { trip, isLoading, isError, isSuccess, message } = useSelector((state) => state.trips);
  const { trucks } = useSelector((state) => state.trucks);
  const { trailers } = useSelector((state) => state.trailers);
  const { users } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: '',
    departureDate: '',
    driverId: '',
    truckId: '',
    trailerId: '',
  });

  useEffect(() => {
    dispatch(getTrucks());
    dispatch(getTrailers());
    dispatch(getUsers());

    if (isEditMode) {
      dispatch(getTrip(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && trip) {
      setFormData({
        origin: trip.origin || '',
        destination: trip.destination || '',
        distance: trip.distance || '',
        departureDate: trip.departureDate ? new Date(trip.departureDate).toISOString().slice(0, 16) : '',
        driverId: trip.driverId?._id || trip.driverId || '',
        truckId: trip.truckId?._id || trip.truckId || '',
        trailerId: trip.trailerId?._id || trip.trailerId || '',
      });
    }
  }, [isEditMode, trip]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && !isEditMode) {
      toast.success('Trip created successfully!');
      navigate('/dashboard/trips');
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value === 'none' ? '' : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination || !formData.driverId || !formData.truckId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const tripData = {
      ...formData,
      distance: Number(formData.distance) || 0,
    };

    try {
      if (isEditMode) {
        await dispatch(updateTrip({ id, tripData })).unwrap();
        toast.success('Trip updated successfully!');
        navigate('/dashboard/trips');
      } else {
        dispatch(createTrip(tripData));
      }
    } catch (error) {
      toast.error(error || 'An error occurred');
    }
  };

  // Filter drivers
  const drivers = users?.filter(u => u.role === 'driver') || [];
  const availableTrucks = trucks?.filter(t => t.status === 'available' || (isEditMode && t._id === formData.truckId)) || [];
  const availableTrailers = trailers?.filter(t => t.status === 'available' || (isEditMode && t._id === formData.trailerId)) || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <Link to="/dashboard/trips">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trips
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Route className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Trip' : 'Create New Trip'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update trip details' : 'Schedule a new trip for your fleet'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Trip Details</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the information below to {isEditMode ? 'update' : 'create'} a trip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Route Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand-orange flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Route Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin" className="text-white">Origin *</Label>
                    <Input
                      type="text"
                      name="origin"
                      id="origin"
                      required
                      placeholder="e.g., Casablanca"
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                      value={formData.origin}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-white">Destination *</Label>
                    <Input
                      type="text"
                      name="destination"
                      id="destination"
                      required
                      placeholder="e.g., Marrakech"
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                      value={formData.destination}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance" className="text-white">Distance (km)</Label>
                    <Input
                      type="number"
                      name="distance"
                      id="distance"
                      placeholder="e.g., 240"
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                      value={formData.distance}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departureDate" className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-orange" />
                      Departure Date
                    </Label>
                    <Input
                      type="datetime-local"
                      name="departureDate"
                      id="departureDate"
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                      value={formData.departureDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Section */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-brand-orange flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Driver *</Label>
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) => handleSelectChange('driverId', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <User className="w-4 h-4 mr-2 text-brand-grey" />
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        {drivers.map((driver) => (
                          <SelectItem key={driver._id} value={driver._id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Truck *</Label>
                    <Select
                      value={formData.truckId}
                      onValueChange={(value) => handleSelectChange('truckId', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <Truck className="w-4 h-4 mr-2 text-brand-grey" />
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        {availableTrucks.map((truck) => (
                          <SelectItem key={truck._id} value={truck._id}>
                            {truck.plateNumber} - {truck.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Trailer (Optional)</Label>
                    <Select
                      value={formData.trailerId || 'none'}
                      onValueChange={(value) => handleSelectChange('trailerId', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <Container className="w-4 h-4 mr-2 text-brand-grey" />
                        <SelectValue placeholder="Select trailer" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        <SelectItem value="none">None</SelectItem>
                        {availableTrailers.map((trailer) => (
                          <SelectItem key={trailer._id} value={trailer._id}>
                            {trailer.plateNumber} - {trailer.capacity}kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Link to="/dashboard/trips">
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
                  {isEditMode ? 'Update Trip' : 'Create Trip'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TripForm;
