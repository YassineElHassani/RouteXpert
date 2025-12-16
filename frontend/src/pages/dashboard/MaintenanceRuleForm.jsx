import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  createMaintenanceRule, 
  updateMaintenanceRule, 
  getMaintenanceRule, 
  reset 
} from '../../store/slices/maintenanceRuleSlice';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { containerVariants, itemVariants } from '@/lib/animations';

const MaintenanceRuleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const { maintenanceRule, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.maintenanceRules
  );

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    intervalType: '',
    intervalMileage: '',
    intervalDays: '',
    description: '',
    priority: 'medium',
    estimatedCost: '',
    estimatedDuration: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEditMode) {
      dispatch(getMaintenanceRule(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && maintenanceRule) {
      setFormData({
        name: maintenanceRule.name || '',
        category: maintenanceRule.category || '',
        intervalType: maintenanceRule.intervalType || '',
        intervalMileage: maintenanceRule.intervalMileage || '',
        intervalDays: maintenanceRule.intervalDays || '',
        description: maintenanceRule.description || '',
        priority: maintenanceRule.priority || 'medium',
        estimatedCost: maintenanceRule.estimatedCost || '',
        estimatedDuration: maintenanceRule.estimatedDuration || '',
        isActive: maintenanceRule.isActive ?? true,
      });
    }
  }, [isEditMode, maintenanceRule]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess) {
      if (isEditMode) {
        toast.success('Maintenance rule updated successfully!');
      } else {
        toast.success('Maintenance rule created successfully!');
      }
      navigate('/dashboard/maintenance-rules');
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch, isEditMode]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.intervalType) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate interval fields based on type
    if ((formData.intervalType === 'mileage' || formData.intervalType === 'both') && !formData.intervalMileage) {
      toast.error('Mileage interval is required');
      return;
    }

    if ((formData.intervalType === 'time' || formData.intervalType === 'both') && !formData.intervalDays) {
      toast.error('Time interval is required');
      return;
    }

    const ruleData = {
      ...formData,
      intervalMileage: formData.intervalMileage ? Number(formData.intervalMileage) : undefined,
      intervalDays: formData.intervalDays ? Number(formData.intervalDays) : undefined,
      estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
      estimatedDuration: formData.estimatedDuration ? Number(formData.estimatedDuration) : undefined,
    };

    if (isEditMode) {
      dispatch(updateMaintenanceRule({ id, ruleData }));
    } else {
      dispatch(createMaintenanceRule(ruleData));
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
        <Link to="/dashboard/maintenance-rules">
          <Button variant="ghost" className="text-brand-grey hover:text-white hover:bg-white/5 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rules
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Maintenance Rule' : 'Create New Rule'}
            </h1>
            <p className="text-brand-grey">
              {isEditMode ? 'Update rule details' : 'Configure a new maintenance interval'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Rule Details</CardTitle>
            <CardDescription className="text-brand-grey">
              Fill in the information below to {isEditMode ? 'update' : 'create'} a maintenance rule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand-orange">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="name" className="text-white">Rule Name *</Label>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="e.g., Engine Oil Change"
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        <SelectItem value="oil_change">Oil Change</SelectItem>
                        <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                        <SelectItem value="brake_inspection">Brake Inspection</SelectItem>
                        <SelectItem value="filter_replacement">Filter Replacement</SelectItem>
                        <SelectItem value="general_service">General Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleSelectChange('priority', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      name="description"
                      id="description"
                      rows={3}
                      placeholder="Brief description of the maintenance task..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange resize-none"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Interval Configuration */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-brand-orange">Maintenance Interval</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Interval Type *</Label>
                    <Select
                      value={formData.intervalType}
                      onValueChange={(value) => handleSelectChange('intervalType', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-black border-white/10">
                        <SelectItem value="mileage">Mileage Based</SelectItem>
                        <SelectItem value="time">Time Based</SelectItem>
                        <SelectItem value="both">Both (Whichever First)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.intervalType === 'mileage' || formData.intervalType === 'both') && (
                    <div className="space-y-2">
                      <Label htmlFor="intervalMileage" className="text-white">
                        Every (km) {formData.intervalType === 'both' ? '' : '*'}
                      </Label>
                      <Input
                        type="number"
                        name="intervalMileage"
                        id="intervalMileage"
                        min="0"
                        placeholder="e.g., 10000"
                        className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                        value={formData.intervalMileage}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  {(formData.intervalType === 'time' || formData.intervalType === 'both') && (
                    <div className="space-y-2">
                      <Label htmlFor="intervalDays" className="text-white">
                        Every (days) {formData.intervalType === 'both' ? '' : '*'}
                      </Label>
                      <Input
                        type="number"
                        name="intervalDays"
                        id="intervalDays"
                        min="0"
                        placeholder="e.g., 90"
                        className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                        value={formData.intervalDays}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Estimates */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-brand-orange">Estimates (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost" className="text-white">Estimated Cost ($)</Label>
                    <Input
                      type="number"
                      name="estimatedCost"
                      id="estimatedCost"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 150.00"
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                      value={formData.estimatedCost}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration" className="text-white">Estimated Duration (hours)</Label>
                    <Input
                      type="number"
                      name="estimatedDuration"
                      id="estimatedDuration"
                      min="0"
                      step="0.5"
                      placeholder="e.g., 2.5"
                      className="bg-white/5 border-white/10 text-white placeholder:text-brand-grey focus:border-brand-orange"
                      value={formData.estimatedDuration}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-orange focus:ring-brand-orange"
                  />
                  <Label htmlFor="isActive" className="text-white cursor-pointer">
                    Rule is active
                  </Label>
                </div>
                <p className="text-brand-grey/60 text-xs">
                  Inactive rules won't be considered when calculating upcoming maintenance
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Link to="/dashboard/maintenance-rules">
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
                  {isEditMode ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MaintenanceRuleForm;
