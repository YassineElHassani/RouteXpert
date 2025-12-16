import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createTruck, updateTruck, reset } from '../../store/slices/truckSlice';
import { toast } from 'react-hot-toast';
import { Truck, ArrowLeft, Save, X, Hash, Calendar, Gauge, Settings } from 'lucide-react';
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

const TruckForm = () => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    status: 'available',
  });

  const { plateNumber, brand, model, year, mileage, status } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = !!id;

  const { trucks, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.trucks
  );

  useEffect(() => {
    if (isEditMode) {
      const truckToEdit = trucks.find((truck) => truck._id === id);
      if (truckToEdit) {
        setFormData({
          plateNumber: truckToEdit.plateNumber,
          brand: truckToEdit.brand,
          model: truckToEdit.model,
          year: truckToEdit.year,
          mileage: truckToEdit.mileage,
          status: truckToEdit.status,
        });
      } else {
        navigate('/dashboard/trucks');
      }
    }
  }, [id, isEditMode, trucks, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success(isEditMode ? 'Truck updated!' : 'Truck created!');
      navigate('/dashboard/trucks');
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
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const truckData = {
      plateNumber,
      brand,
      model,
      year: Number(year),
      mileage: Number(mileage),
      status,
    };

    if (isEditMode) {
      dispatch(updateTruck({ id, truckData }));
    } else {
      dispatch(createTruck(truckData));
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
        <Link to="/dashboard/trucks">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trucks
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Truck className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Truck' : 'Add New Truck'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update truck information' : 'Add a new truck to your fleet'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Truck Details</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the information below to {isEditMode ? 'update' : 'add'} a truck.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plate Number */}
                <div className="space-y-2">
                  <Label htmlFor="plateNumber" className="text-white flex items-center gap-2">
                    <Hash className="w-4 h-4 text-brand-orange" />
                    Plate Number
                  </Label>
                  <Input
                    type="text"
                    name="plateNumber"
                    id="plateNumber"
                    required
                    placeholder="e.g., ABC-1234"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={plateNumber}
                    onChange={onChange}
                  />
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-orange" />
                    Brand
                  </Label>
                  <Input
                    type="text"
                    name="brand"
                    id="brand"
                    required
                    placeholder="e.g., Volvo, Mercedes"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={brand}
                    onChange={onChange}
                  />
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-orange" />
                    Model
                  </Label>
                  <Input
                    type="text"
                    name="model"
                    id="model"
                    required
                    placeholder="e.g., FH16, Actros"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={model}
                    onChange={onChange}
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-orange" />
                    Year
                  </Label>
                  <Input
                    type="number"
                    name="year"
                    id="year"
                    required
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    placeholder="e.g., 2023"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={year}
                    onChange={onChange}
                  />
                </div>

                {/* Mileage */}
                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-brand-orange" />
                    Mileage (km)
                  </Label>
                  <Input
                    type="number"
                    name="mileage"
                    id="mileage"
                    required
                    min="0"
                    placeholder="e.g., 150000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={mileage}
                    onChange={onChange}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-orange" />
                    Status
                  </Label>
                  <Select value={status} onValueChange={(value) => onSelectChange('status', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-black border-white/10">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/trucks')}
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? 'Update Truck' : 'Create Truck'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TruckForm;
