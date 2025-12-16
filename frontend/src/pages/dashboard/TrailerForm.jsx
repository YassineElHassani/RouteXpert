import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createTrailer, updateTrailer, reset } from '../../store/slices/trailerSlice';
import { toast } from 'react-hot-toast';
import { Container, ArrowLeft, Save, Hash, Weight, Gauge, Settings } from 'lucide-react';
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

const TrailerForm = () => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    capacity: '',
    mileage: '',
    status: 'available',
  });

  const { plateNumber, capacity, mileage, status } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = !!id;

  const { trailers, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.trailers
  );

  useEffect(() => {
    if (isEditMode) {
      const trailerToEdit = trailers.find((trailer) => trailer._id === id);
      if (trailerToEdit) {
        setFormData({
          plateNumber: trailerToEdit.plateNumber || '',
          capacity: trailerToEdit.capacity || '',
          mileage: trailerToEdit.mileage || '',
          status: trailerToEdit.status || 'available',
        });
      } else {
        navigate('/dashboard/trailers');
      }
    }
  }, [id, isEditMode, trailers, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success(isEditMode ? 'Trailer updated!' : 'Trailer created!');
      navigate('/dashboard/trailers');
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

    const trailerData = {
      plateNumber,
      capacity: Number(capacity),
      mileage: Number(mileage),
      status,
    };

    if (isEditMode) {
      dispatch(updateTrailer({ id, trailerData }));
    } else {
      dispatch(createTrailer(trailerData));
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
        <Link to="/dashboard/trailers">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trailers
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Container className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Trailer' : 'Add New Trailer'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update trailer information' : 'Add a new trailer to your fleet'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Trailer Details</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the information below to {isEditMode ? 'update' : 'add'} a trailer.
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
                    placeholder="e.g., TRL-5678"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={plateNumber}
                    onChange={onChange}
                  />
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-white flex items-center gap-2">
                    <Weight className="w-4 h-4 text-brand-orange" />
                    Capacity (kg)
                  </Label>
                  <Input
                    type="number"
                    name="capacity"
                    id="capacity"
                    required
                    min="0"
                    placeholder="e.g., 25000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={capacity}
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
                    placeholder="e.g., 30000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={mileage}
                    onChange={onChange}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
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
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Link to="/dashboard/trailers">
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
                  {isEditMode ? 'Update Trailer' : 'Create Trailer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TrailerForm;
