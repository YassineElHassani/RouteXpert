import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getMaintenanceRecords, 
  deleteMaintenanceRecord, 
  getPendingMaintenance,
  getOverdueMaintenance,
  completeMaintenance,
  reset 
} from '../../store/slices/maintenanceSlice';
import { getTrucks } from '../../store/slices/truckSlice';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wrench,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingScreen } from '@/components/ui/loading';
import { containerVariants, itemVariants, tableRowVariants } from '@/lib/animations';

const Maintenance = () => {
  const dispatch = useDispatch();
  const { 
    maintenanceRecords, 
    pendingMaintenance, 
    overdueMaintenance, 
    isLoading, 
    isError, 
    message 
  } = useSelector((state) => state.maintenance);
  const { trucks } = useSelector((state) => state.trucks);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [truckFilter, setTruckFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordToComplete, setRecordToComplete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    dispatch(getMaintenanceRecords());
    dispatch(getTrucks());
    dispatch(getPendingMaintenance());
    dispatch(getOverdueMaintenance());

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

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (recordToDelete) {
      await dispatch(deleteMaintenanceRecord(recordToDelete._id));
      toast.success('Maintenance record deleted successfully');
    }
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const handleCompleteClick = (record) => {
    setRecordToComplete(record);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (recordToComplete) {
      await dispatch(completeMaintenance({ id: recordToComplete._id, completionData: {} }));
      toast.success('Maintenance marked as completed');
    }
    setCompleteDialogOpen(false);
    setRecordToComplete(null);
  };

  // Filter maintenance records
  const filteredRecords = maintenanceRecords?.filter(record => {
    const matchesSearch = 
      record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.truckId?.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesTruck = truckFilter === 'all' || record.truckId?._id === truckFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesTruck;
  }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'scheduled': return Clock;
      case 'pending': return AlertTriangle;
      case 'overdue': return XCircle;
      default: return Clock;
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatType = (type) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const maintenanceTypes = [
    { value: 'oil_change', label: 'Oil Change' },
    { value: 'tire_rotation', label: 'Tire Rotation' },
    { value: 'brake_inspection', label: 'Brake Inspection' },
    { value: 'engine_checkup', label: 'Engine Checkup' },
    { value: 'transmission', label: 'Transmission' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'general', label: 'General' },
  ];

  // Calculate stats
  const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
  const completedCount = filteredRecords.filter(r => r.status === 'completed').length;
  const pendingCount = (pendingMaintenance?.length || 0) + (overdueMaintenance?.length || 0);

  if (isLoading) {
    return <LoadingScreen message="Loading maintenance records..." />;
  }

  const renderMaintenanceTable = (records, showCompleteAction = true) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-brand-grey">Date</TableHead>
            <TableHead className="text-brand-grey">Truck</TableHead>
            <TableHead className="text-brand-grey">Type</TableHead>
            <TableHead className="text-brand-grey">Description</TableHead>
            <TableHead className="text-brand-grey">Status</TableHead>
            <TableHead className="text-brand-grey">Cost</TableHead>
            <TableHead className="text-brand-grey text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {records.map((record, index) => {
              const StatusIcon = getStatusIcon(record.status);
              
              return (
                <motion.tr
                  key={record._id}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  className="border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <TableCell>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 text-brand-grey" />
                      {formatDate(record.scheduledDate || record.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-brand-orange" />
                      </div>
                      <span className="text-white font-medium">
                        {record.truckId?.plateNumber || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 text-brand-grey">
                      {formatType(record.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-brand-grey max-w-[200px] truncate">
                    {record.description || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(record.status)} border flex items-center gap-1 w-fit`}>
                      <StatusIcon className="w-3 h-3" />
                      {formatStatus(record.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-white font-medium">
                      {formatCurrency(record.cost)}
                    </span>
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
                          onClick={() => handleViewClick(record)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <Link to={`/dashboard/maintenance/edit/${record._id}`}>
                          <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Record
                          </DropdownMenuItem>
                        </Link>
                        {showCompleteAction && record.status !== 'completed' && (
                          <DropdownMenuItem 
                            className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                            onClick={() => handleCompleteClick(record)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem 
                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          onClick={() => handleDeleteClick(record)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );

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
            <Wrench className="w-7 h-7 text-brand-orange" />
            Maintenance Management
          </h1>
          <p className="text-brand-grey mt-1">Schedule and track vehicle maintenance</p>
        </div>
        <Link to="/dashboard/maintenance/add">
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Maintenance
          </Button>
        </Link>
      </motion.div>

      {/* Alert Cards */}
      {(pendingMaintenance?.length > 0 || overdueMaintenance?.length > 0) && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {overdueMaintenance?.length > 0 && (
            <Card className="glass border-red-500/30 bg-red-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-red-400 text-sm font-medium">Overdue Maintenance</p>
                  <p className="text-2xl font-bold text-white">{overdueMaintenance.length} vehicles</p>
                </div>
              </CardContent>
            </Card>
          )}
          {pendingMaintenance?.length > 0 && (
            <Card className="glass border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Pending Maintenance</p>
                  <p className="text-2xl font-bold text-white">{pendingMaintenance.length} scheduled</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Total Records</p>
              <p className="text-2xl font-bold text-white">{filteredRecords.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Total Cost</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-grey" />
                <Input
                  placeholder="Search by description, type, or truck..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-brand-grey"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-black border-white/10">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-black border-white/10">
                    <SelectItem value="all">All Types</SelectItem>
                    {maintenanceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={truckFilter} onValueChange={setTruckFilter}>
                  <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Truck" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-black border-white/10">
                    <SelectItem value="all">All Trucks</SelectItem>
                    {trucks?.map((truck) => (
                      <SelectItem key={truck._id} value={truck._id}>
                        {truck.plateNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Maintenance Records Table with Tabs */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <Tabs defaultValue="all" className="w-full">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg font-semibold text-white">
                  Maintenance Records
                </CardTitle>
                <TabsList className="bg-white/5">
                  <TabsTrigger value="all" className="data-[state=active]:bg-brand-orange">
                    All ({filteredRecords.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-brand-orange">
                    Pending ({pendingMaintenance?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="overdue" className="data-[state=active]:bg-brand-orange">
                    Overdue ({overdueMaintenance?.length || 0})
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="all" className="mt-0">
                {filteredRecords.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
                      <Wrench className="w-8 h-8 text-brand-orange/50" />
                    </div>
                    <p className="text-brand-grey text-lg mb-2">No maintenance records found</p>
                    <p className="text-brand-grey/60 text-sm mb-4">
                      {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || truckFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Schedule your first maintenance to get started'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && truckFilter === 'all' && (
                      <Link to="/dashboard/maintenance/add">
                        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Schedule Maintenance
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                ) : (
                  renderMaintenanceTable(filteredRecords)
                )}
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                {pendingMaintenance?.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400/50" />
                    <p className="text-brand-grey">No pending maintenance</p>
                  </div>
                ) : (
                  renderMaintenanceTable(pendingMaintenance || [])
                )}
              </TabsContent>
              <TabsContent value="overdue" className="mt-0">
                {overdueMaintenance?.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400/50" />
                    <p className="text-brand-grey">No overdue maintenance</p>
                  </div>
                ) : (
                  renderMaintenanceTable(overdueMaintenance || [])
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-brand-black border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-orange" />
              Maintenance Details
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Detailed information for maintenance record
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Service Information</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Type:</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        {formatType(selectedRecord.type)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Date:</span>
                      <span className="text-white text-sm">{formatDate(selectedRecord.scheduledDate || selectedRecord.date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-grey/60 text-sm">Status:</span>
                      <Badge className={`${getStatusColor(selectedRecord.status)} border`}>
                        {formatStatus(selectedRecord.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Vehicle Information</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Truck:</span>
                      <span className="text-white text-sm">{selectedRecord.truckId?.plateNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Mileage:</span>
                      <span className="text-white text-sm">{selectedRecord.mileage?.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Cost & Provider</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Service Provider:</span>
                      <span className="text-white text-sm">{selectedRecord.serviceProvider || 'In-house'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Cost:</span>
                      <span className="text-white text-sm font-bold">{formatCurrency(selectedRecord.cost)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Description & Notes</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <p className="text-white text-sm">{selectedRecord.description || 'No description provided.'}</p>
                    {selectedRecord.notes && (
                      <>
                        <div className="h-px bg-white/10 my-2" />
                        <p className="text-brand-grey text-xs">Notes:</p>
                        <p className="text-white text-sm">{selectedRecord.notes}</p>
                      </>
                    )}
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
              Delete Maintenance Record
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Are you sure you want to delete this maintenance record for{' '}
              <span className="text-brand-orange font-medium">
                {recordToDelete?.truckId?.plateNumber} - {formatType(recordToDelete?.type)}
              </span>
              ? This action cannot be undone.
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

      {/* Complete Confirmation Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="bg-brand-black border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Complete Maintenance
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Mark this maintenance as completed for{' '}
              <span className="text-brand-orange font-medium">
                {recordToComplete?.truckId?.plateNumber} - {formatType(recordToComplete?.type)}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteConfirm}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Maintenance;
