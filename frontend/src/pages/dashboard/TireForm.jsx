import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createTire, updateTire, reset } from '../../store/slices/tireSlice';
import { getTrucks } from '../../store/slices/truckSlice';
import { getTrailers } from '../../store/slices/trailerSlice';
import { toast } from 'react-hot-toast';
import { Circle, ArrowLeft, Save, Truck, Container, MapPin, Gauge, Calendar } from 'lucide-react';
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

const TireForm = () => {
  const [formData, setFormData] = useState({
    brand: '',
    position: 'front_left',
    condition: 'good',
    mileageAtInstall: '',
    installDate: new Date().toISOString().split('T')[0],
    truckId: '',
    trailerId: '',
  });

  const { brand, position, condition, mileageAtInstall, installDate, truckId, trailerId } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = !!id;

  const { tires, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.tires
  );
  const { trucks } = useSelector((state) => state.trucks);
  const { trailers } = useSelector((state) => state.trailers);

  useEffect(() => {
    dispatch(getTrucks());
    dispatch(getTrailers());
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode) {
      const tireToEdit = tires.find((tire) => tire._id === id);
      if (tireToEdit) {
        setFormData({
          brand: tireToEdit.brand || '',
          position: tireToEdit.position || 'front_left',
          condition: tireToEdit.condition || 'good',
          mileageAtInstall: tireToEdit.mileageAtInstall || '',
          installDate: tireToEdit.installDate ? new Date(tireToEdit.installDate).toISOString().split('T')[0] : '',
          truckId: tireToEdit.truckId?._id || tireToEdit.truckId || '',
          trailerId: tireToEdit.trailerId?._id || tireToEdit.trailerId || '',
        });
      } else {
        navigate('/dashboard/tires');
      }
    }
  }, [id, isEditMode, tires, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success(isEditMode ? 'Tire updated!' : 'Tire created!');
      navigate('/dashboard/tires');
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

  const onSelectChange = (name, value) => {
    const finalValue = value === 'none' ? '' : value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: finalValue,
      // Clear the other assignment when one is selected
      ...(name === 'truckId' && finalValue ? { trailerId: '' } : {}),
      ...(name === 'trailerId' && finalValue ? { truckId: '' } : {}),
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!truckId && !trailerId) {
      toast.error('Please assign the tire to a truck or trailer');
      return;
    }

    const tireData = {
      brand,
      position,
      condition,
      mileageAtInstall: Number(mileageAtInstall),
      installDate,
      truckId: truckId || undefined,
      trailerId: trailerId || undefined,
    };

    if (isEditMode) {
      dispatch(updateTire({ id, tireData }));
    } else {
      dispatch(createTire(tireData));
    }
  };

  const positions = [
    { value: 'front_left', label: 'Front Left' },
    { value: 'front_right', label: 'Front Right' },
    { value: 'rear_left_outer', label: 'Rear Left Outer' },
    { value: 'rear_left_inner', label: 'Rear Left Inner' },
    { value: 'rear_right_outer', label: 'Rear Right Outer' },
    { value: 'rear_right_inner', label: 'Rear Right Inner' },
    { value: 'spare', label: 'Spare' },
  ];

  const conditions = [
    { value: 'good', label: 'Good', color: 'text-green-400' },
    { value: 'worn', label: 'Worn', color: 'text-yellow-400' },
    { value: 'needs_replacement', label: 'Needs Replacement', color: 'text-red-400' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <Link to="/dashboard/tires">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tires
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Circle className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Tire' : 'Add New Tire'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update tire information' : 'Add a new tire to your fleet'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Tire Details</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the information below to {isEditMode ? 'update' : 'add'} a tire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-white">Brand</Label>
                  <Input
                    type="text"
                    name="brand"
                    id="brand"
                    required
                    placeholder="e.g., Michelin"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={brand}
                    onChange={onChange}
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-orange" />
                    Position
                  </Label>
                  <Select value={position} onValueChange={(value) => onSelectChange('position', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-black border-white/10">
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label className="text-white">Condition</Label>
                  <Select value={condition} onValueChange={(value) => onSelectChange('condition', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-black border-white/10">
                      {conditions.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value}>
                          <span className={cond.color}>{cond.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mileage at Install */}
                <div className="space-y-2">
                  <Label htmlFor="mileageAtInstall" className="text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-brand-orange" />
                    Mileage at Install
                  </Label>
                  <Input
                    type="number"
                    name="mileageAtInstall"
                    id="mileageAtInstall"
                    required
                    min="0"
                    placeholder="e.g., 50000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={mileageAtInstall}
                    onChange={onChange}
                  />
                </div>

                {/* Install Date */}
                <div className="space-y-2">
                  <Label htmlFor="installDate" className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-orange" />
                    Install Date
                  </Label>
                  <Input
                    type="date"
                    name="installDate"
                    id="installDate"
                    className="bg-white/5 border-white/10 text-white focus:border-brand-orange"
                    value={installDate}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Assignment Section */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-brand-orange">Assignment</h3>
                <p className="text-xs text-brand-grey">Assign this tire to either a truck or trailer (not both)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Truck */}
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-brand-orange" />
                      Assign to Truck
                    </Label>
                    <Select 
                      value={truckId || 'none'} 
                      onValueChange={(value) => onSelectChange('truckId', value)}
                      disabled={!!trailerId}
                    >
                      <SelectTrigger className={`bg-white/5 border-white/10 text-white ${trailerId ? 'opacity-50' : ''}`}>
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        <SelectItem value="none">None</SelectItem>
                        {trucks?.map((truck) => (
                          <SelectItem key={truck._id} value={truck._id}>
                            {truck.plateNumber} - {truck.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trailer */}
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Container className="w-4 h-4 text-brand-orange" />
                      Assign to Trailer
                    </Label>
                    <Select 
                      value={trailerId || 'none'} 
                      onValueChange={(value) => onSelectChange('trailerId', value)}
                      disabled={!!truckId}
                    >
                      <SelectTrigger className={`bg-white/5 border-white/10 text-white ${truckId ? 'opacity-50' : ''}`}>
                        <SelectValue placeholder="Select trailer" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        <SelectItem value="none">None</SelectItem>
                        {trailers?.map((trailer) => (
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
                <Link to="/dashboard/tires">
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
                  {isEditMode ? 'Update Tire' : 'Create Tire'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TireForm;
