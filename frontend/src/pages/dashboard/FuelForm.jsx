import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createFuelRecord, updateFuelRecord, getFuelRecord, reset } from '../../store/slices/fuelSlice';
import { getTrucks } from '../../store/slices/truckSlice';
import { getTrips } from '../../store/slices/tripSlice';
import { toast } from 'react-hot-toast';
import { Fuel, ArrowLeft, Save, Truck, DollarSign, Droplet, Calendar, MapPin, Route } from 'lucide-react';
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

const FuelForm = () => {
  const [formData, setFormData] = useState({
    truckId: '',
    tripId: '',
    date: new Date().toISOString().split('T')[0],
    volume: '',
    pricePerLiter: '',
    totalCost: '',
    station: '',
    mileage: '',
  });

  const { truckId, tripId, date, volume, pricePerLiter, totalCost, station, mileage } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = !!id;

  const { fuelRecord, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.fuel
  );
  const { trucks } = useSelector((state) => state.trucks);
  const { trips } = useSelector((state) => state.trips);

  useEffect(() => {
    dispatch(getTrucks());
    dispatch(getTrips());
    
    if (isEditMode) {
      dispatch(getFuelRecord(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && fuelRecord) {
      setFormData({
        truckId: fuelRecord.truckId?._id || fuelRecord.truckId || '',
        tripId: fuelRecord.tripId?._id || fuelRecord.tripId || '',
        date: fuelRecord.date ? new Date(fuelRecord.date).toISOString().split('T')[0] : '',
        volume: fuelRecord.volume || '',
        pricePerLiter: fuelRecord.pricePerLiter || '',
        totalCost: fuelRecord.cost || '',
        station: fuelRecord.station || '',
        mileage: fuelRecord.mileage || '',
      });
    }
  }, [isEditMode, fuelRecord]);

  // Auto-select truck when trip is selected
  const onTripChange = (value) => {
    const selectedTrip = trips.find(t => t._id === value);
    if (selectedTrip) {
      setFormData(prev => ({
        ...prev,
        tripId: value,
        truckId: selectedTrip.truckId?._id || selectedTrip.truckId || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, tripId: value }));
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && !fuelRecord) {
      toast.success(isEditMode ? 'Fuel record updated!' : 'Fuel record created!');
      navigate('/dashboard/fuel');
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch, isEditMode, fuelRecord]);

  // Auto-calculate total cost when volume or price changes
  useEffect(() => {
    if (volume && pricePerLiter) {
      const calculatedTotal = (parseFloat(volume) * parseFloat(pricePerLiter)).toFixed(2);
      setFormData((prev) => ({ ...prev, totalCost: calculatedTotal }));
    }
  }, [volume, pricePerLiter]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSelectChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!truckId) {
      toast.error('Please select a truck');
      return;
    }

    const fuelData = {
      truckId,
      tripId: tripId === 'none' ? null : (tripId || null),
      date,
      volume: parseFloat(volume),
      pricePerLiter: parseFloat(pricePerLiter),
      station,
      mileage: mileage ? parseInt(mileage) : undefined,
    };

    if (isEditMode) {
      dispatch(updateFuelRecord({ id, fuelData }));
    } else {
      dispatch(createFuelRecord(fuelData));
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
        <Link to="/dashboard/fuel">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fuel Records
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Fuel className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Fuel Record' : 'Add Fuel Record'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update fuel record details' : 'Record a new fuel purchase'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Fuel Details</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the information below to {isEditMode ? 'update' : 'record'} a fuel purchase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trip Selection */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Route className="w-4 h-4 text-brand-orange" />
                    Trip (Optional)
                  </Label>
                  <Select value={tripId} onValueChange={onTripChange}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select trip" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-black border-white/10">
                      <SelectItem value="none">No Trip</SelectItem>
                      {trips?.map((trip) => (
                        <SelectItem key={trip._id} value={trip._id}>
                          {trip.origin} → {trip.destination} ({new Date(trip.createdAt).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Truck */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-orange" />
                    Truck
                  </Label>
                  <Select value={truckId} onValueChange={(value) => onSelectChange('truckId', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-black border-white/10">
                      {trucks?.map((truck) => (
                        <SelectItem key={truck._id} value={truck._id}>
                          {truck.plateNumber} - {truck.brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-orange" />
                    Date
                  </Label>
                  <Input
                    type="date"
                    name="date"
                    id="date"
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-brand-orange"
                    value={date}
                    onChange={onChange}
                  />
                </div>

                {/* Station */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="station" className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-orange" />
                    Station
                  </Label>
                  <Input
                    type="text"
                    name="station"
                    id="station"
                    placeholder="e.g., Shell Gas Station - Downtown"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={station}
                    onChange={onChange}
                  />
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <Label htmlFor="volume" className="text-white flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-brand-orange" />
                    Volume (Liters)
                  </Label>
                  <Input
                    type="number"
                    name="volume"
                    id="volume"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 50.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={volume}
                    onChange={onChange}
                  />
                </div>

                {/* Price per Liter */}
                <div className="space-y-2">
                  <Label htmlFor="pricePerLiter" className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand-orange" />
                    Price per Liter
                  </Label>
                  <Input
                    type="number"
                    name="pricePerLiter"
                    id="pricePerLiter"
                    required
                    min="0"
                    step="0.001"
                    placeholder="e.g., 1.50"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={pricePerLiter}
                    onChange={onChange}
                  />
                </div>

                {/* Total Cost */}
                <div className="space-y-2">
                  <Label htmlFor="totalCost" className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Total Cost (Auto-calculated)
                  </Label>
                  <Input
                    type="number"
                    name="totalCost"
                    id="totalCost"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={totalCost}
                    onChange={onChange}
                    readOnly
                  />
                </div>

                {/* Mileage */}
                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-white">Odometer Reading (km)</Label>
                  <Input
                    type="number"
                    name="mileage"
                    id="mileage"
                    min="0"
                    placeholder="e.g., 125000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={mileage}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Summary */}
              {volume && pricePerLiter && (
                <div className="p-4 rounded-lg bg-brand-orange/10 border border-brand-orange/20">
                  <p className="text-sm text-brand-grey">Summary</p>
                  <p className="text-lg font-semibold text-white">
                    {parseFloat(volume).toFixed(2)} L × ${parseFloat(pricePerLiter).toFixed(3)}/L = ${parseFloat(totalCost).toFixed(2)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Link to="/dashboard/fuel">
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
                  {isEditMode ? 'Update Record' : 'Create Record'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FuelForm;
