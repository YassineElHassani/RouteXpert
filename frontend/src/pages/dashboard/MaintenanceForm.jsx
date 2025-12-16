import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  createMaintenanceRecord, 
  updateMaintenanceRecord, 
  getMaintenanceRecord, 
  reset 
} from '../../store/slices/maintenanceSlice';
import { getTrucks } from '../../store/slices/truckSlice';
import { getMaintenanceRules } from '../../store/slices/maintenanceRuleSlice';
import { toast } from 'react-hot-toast';
import { Wrench, ArrowLeft, Save, Truck, DollarSign, Calendar, FileText, Tag } from 'lucide-react';
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

const MaintenanceForm = () => {
  const [formData, setFormData] = useState({
    truckId: '',
    type: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    cost: '',
    status: 'scheduled',
    notes: '',
  });

  const { truckId, type, description, scheduledDate, cost, status, notes } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = !!id;

  const { maintenanceRecord, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.maintenance
  );
  const { trucks } = useSelector((state) => state.trucks);
  const { maintenanceRules } = useSelector((state) => state.maintenanceRules);

  useEffect(() => {
    dispatch(getTrucks());
    dispatch(getMaintenanceRules());
    
    if (isEditMode) {
      dispatch(getMaintenanceRecord(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && maintenanceRecord) {
      setFormData({
        truckId: maintenanceRecord.truckId?._id || maintenanceRecord.truckId || '',
        type: maintenanceRecord.type || 'oil_change',
        description: maintenanceRecord.description || '',
        scheduledDate: maintenanceRecord.scheduledDate 
          ? new Date(maintenanceRecord.scheduledDate).toISOString().split('T')[0] 
          : '',
        cost: maintenanceRecord.cost || '',
        status: maintenanceRecord.status || 'scheduled',
        notes: maintenanceRecord.notes || '',
      });
    }
  }, [isEditMode, maintenanceRecord]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && !maintenanceRecord) {
      toast.success(isEditMode ? 'Maintenance updated!' : 'Maintenance scheduled!');
      navigate('/dashboard/maintenance');
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch, isEditMode, maintenanceRecord]);

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

    const maintenanceData = {
      truckId,
      type,
      description,
      scheduledDate,
      cost: cost ? parseFloat(cost) : undefined,
      status,
      notes,
    };

    if (isEditMode) {
      dispatch(updateMaintenanceRecord({ id, maintenanceData }));
    } else {
      dispatch(createMaintenanceRecord(maintenanceData));
    }
  };

  // Get unique active maintenance categories from rules
  const maintenanceTypes = maintenanceRules
    ?.filter(rule => rule.isActive)
    .reduce((acc, rule) => {
      if (!acc.find(item => item.value === rule.category)) {
        acc.push({
          value: rule.category,
          label: rule.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        });
      }
      return acc;
    }, []) || [];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
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
        <Link to="/dashboard/maintenance">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Maintenance
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Maintenance' : 'Schedule Maintenance'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update maintenance details' : 'Schedule a new maintenance task'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Maintenance Details</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the information below to {isEditMode ? 'update' : 'schedule'} maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Type */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-orange" />
                    Maintenance Type
                  </Label>
                  <Select value={type} onValueChange={(value) => onSelectChange('type', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-black border-white/10">
                      {maintenanceTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scheduled Date */}
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate" className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-orange" />
                    Scheduled Date
                  </Label>
                  <Input
                    type="date"
                    name="scheduledDate"
                    id="scheduledDate"
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-brand-orange"
                    value={scheduledDate}
                    onChange={onChange}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Select value={status} onValueChange={(value) => onSelectChange('status', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-black border-white/10">
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost */}
                <div className="space-y-2">
                  <Label htmlFor="cost" className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand-orange" />
                    Estimated Cost
                  </Label>
                  <Input
                    type="number"
                    name="cost"
                    id="cost"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 150.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={cost}
                    onChange={onChange}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-orange" />
                    Description
                  </Label>
                  <Input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="Brief description of the maintenance work"
                    className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                    value={description}
                    onChange={onChange}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes" className="text-white">Additional Notes</Label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={3}
                    placeholder="Any additional notes or instructions..."
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange p-3"
                    value={notes}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Link to="/dashboard/maintenance">
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
                  {isEditMode ? 'Update' : 'Schedule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MaintenanceForm;
