import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getMaintenanceRules, 
  deleteMaintenanceRule, 
  reset 
} from '../../store/slices/maintenanceRuleSlice';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Clock,
  Gauge,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingScreen } from '@/components/ui/loading';
import { containerVariants, itemVariants, tableRowVariants } from '@/lib/animations';

const MaintenanceRules = () => {
  const dispatch = useDispatch();
  const { maintenanceRules, isLoading, isError, message } = useSelector(
    (state) => state.maintenanceRules
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    dispatch(getMaintenanceRules());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleViewClick = (rule) => {
    setSelectedRule(rule);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ruleToDelete) {
      await dispatch(deleteMaintenanceRule(ruleToDelete._id));
      toast.success('Maintenance rule deleted successfully');
    }
    setDeleteDialogOpen(false);
    setRuleToDelete(null);
  };

  // Filter rules
  const filteredRules = maintenanceRules?.filter(rule => {
    const matchesSearch = 
      rule.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'oil_change': return '🛢️';
      case 'tire_rotation': return '🚗';
      case 'brake_inspection': return '🛑';
      case 'filter_replacement': return '🔧';
      case 'general_service': return '⚙️';
      default: return '📋';
    }
  };

  const getCategoryLabel = (category) => {
    return category?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading maintenance rules..." />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-brand-orange" />
            Maintenance Rules
          </h1>
          <p className="text-brand-grey mt-1">Configure maintenance intervals and schedules</p>
        </div>
        <Link to="/dashboard/maintenance-rules/add">
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-grey" />
                <Input
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-brand-grey"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-brand-black border-white/10">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                  <SelectItem value="brake_inspection">Brake Inspection</SelectItem>
                  <SelectItem value="filter_replacement">Filter Replacement</SelectItem>
                  <SelectItem value="general_service">General Service</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rules Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white">
              Maintenance Rules
              <Badge variant="secondary" className="ml-2 bg-white/10 text-brand-grey">
                {filteredRules.length} rules
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRules.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-brand-orange/50" />
                </div>
                <p className="text-brand-grey text-lg mb-2">No maintenance rules found</p>
                <p className="text-brand-grey/60 text-sm mb-4">
                  {searchQuery || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first maintenance rule to get started'}
                </p>
                {!searchQuery && categoryFilter === 'all' && (
                  <Link to="/dashboard/maintenance-rules/add">
                    <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Rule
                    </Button>
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-brand-grey">Rule</TableHead>
                      <TableHead className="text-brand-grey">Category</TableHead>
                      <TableHead className="text-brand-grey">Interval</TableHead>
                      <TableHead className="text-brand-grey">Priority</TableHead>
                      <TableHead className="text-brand-grey">Status</TableHead>
                      <TableHead className="text-brand-grey text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredRules.map((rule, index) => (
                        <motion.tr
                          key={rule._id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          className="border-white/5 hover:bg-white/5 transition-colors group"
                        >
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{rule.name}</p>
                              {rule.description && (
                                <p className="text-brand-grey/60 text-xs truncate max-w-[200px]">
                                  {rule.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getCategoryIcon(rule.category)}</span>
                              <span className="text-white text-sm">{getCategoryLabel(rule.category)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {(rule.intervalType === 'mileage' || rule.intervalType === 'both') && (
                                <div className="flex items-center gap-1 text-brand-grey text-sm">
                                  <Gauge className="w-3 h-3" />
                                  {rule.intervalMileage?.toLocaleString()} km
                                </div>
                              )}
                              {(rule.intervalType === 'time' || rule.intervalType === 'both') && (
                                <div className="flex items-center gap-1 text-brand-grey text-sm">
                                  <Clock className="w-3 h-3" />
                                  {rule.intervalDays} days
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(rule.priority)} border capitalize`}>
                              {rule.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rule.isActive ? (
                              <div className="flex items-center gap-1 text-green-400 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Active
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Inactive
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-brand-grey hover:text-white hover:bg-white/10">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-brand-black border-white/10">
                                <DropdownMenuLabel className="text-brand-grey">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem 
                                  className="text-white hover:bg-white/10 cursor-pointer"
                                  onClick={() => handleViewClick(rule)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <Link to={`/dashboard/maintenance-rules/edit/${rule._id}`}>
                                  <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Rule
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                  onClick={() => handleDeleteClick(rule)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Rule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-brand-black border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-orange" />
              Rule Details
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Detailed information for <span className="text-brand-orange font-medium">{selectedRule?.name}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedRule && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Basic Information</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Category:</span>
                      <span className="text-white text-sm">{getCategoryLabel(selectedRule.category)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-grey/60 text-sm">Priority:</span>
                      <Badge className={`${getPriorityColor(selectedRule.priority)} border capitalize text-xs`}>
                        {selectedRule.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Status:</span>
                      <span className={selectedRule.isActive ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                        {selectedRule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedRule.description && (
                  <div>
                    <h4 className="text-sm font-medium text-brand-grey mb-1">Description</h4>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white text-sm">{selectedRule.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Maintenance Interval</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    {(selectedRule.intervalType === 'mileage' || selectedRule.intervalType === 'both') && (
                      <div className="flex justify-between">
                        <span className="text-brand-grey/60 text-sm">Every (km):</span>
                        <span className="text-white text-sm">{selectedRule.intervalMileage?.toLocaleString()} km</span>
                      </div>
                    )}
                    {(selectedRule.intervalType === 'time' || selectedRule.intervalType === 'both') && (
                      <div className="flex justify-between">
                        <span className="text-brand-grey/60 text-sm">Every (days):</span>
                        <span className="text-white text-sm">{selectedRule.intervalDays} days</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Type:</span>
                      <span className="text-white text-sm capitalize">{selectedRule.intervalType}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Estimates</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Est. Cost:</span>
                      <span className="text-white text-sm">{formatCurrency(selectedRule.estimatedCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Est. Duration:</span>
                      <span className="text-white text-sm">{selectedRule.estimatedDuration || 0} hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setViewDialogOpen(false)}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-brand-black border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Maintenance Rule
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Are you sure you want to delete the rule{' '}
              <span className="text-brand-orange font-medium">{ruleToDelete?.name}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MaintenanceRules;
