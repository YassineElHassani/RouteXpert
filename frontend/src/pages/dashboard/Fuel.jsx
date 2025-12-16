import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFuelRecords, deleteFuelRecord, getFuelConsumptionReport, reset } from '../../store/slices/fuelSlice';
import { getTrucks } from '../../store/slices/truckSlice';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Fuel as FuelIcon,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  DollarSign,
  Droplet,
  Calendar,
  TrendingUp,
  BarChart3
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

const Fuel = () => {
  const dispatch = useDispatch();
  const { fuelRecords, consumptionReport, isLoading, isError, message } = useSelector(
    (state) => state.fuel
  );
  const { trucks } = useSelector((state) => state.trucks);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [truckFilter, setTruckFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    dispatch(getFuelRecords());
    dispatch(getTrucks());
    dispatch(getFuelConsumptionReport());

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

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      dispatch(deleteFuelRecord(recordToDelete._id));
      toast.success('Fuel record deleted successfully');
    }
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  // Filter fuel records
  const filteredRecords = fuelRecords?.filter(record => {
    const matchesSearch = 
      record.station?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.truckId?.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTruck = truckFilter === 'all' || record.truckId?._id === truckFilter;
    
    return matchesSearch && matchesTruck;
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
    }).format(amount);
  };

  // Calculate totals
  const totalVolume = filteredRecords.reduce((sum, r) => sum + (r.volume || 0), 0);
  const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
  const avgPricePerLiter = totalVolume > 0 ? totalCost / totalVolume : 0;

  if (isLoading) {
    return <LoadingScreen message="Loading fuel records..." />;
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
            <FuelIcon className="w-7 h-7 text-brand-orange" />
            Fuel Management
          </h1>
          <p className="text-brand-grey mt-1">Track fuel consumption and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-white/10 text-white hover:bg-white/5"
            onClick={() => setShowReport(!showReport)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showReport ? 'Hide Report' : 'Show Report'}
          </Button>
          <Link to="/dashboard/fuel/add">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white">{totalVolume.toFixed(1)} L</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Total Cost</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Avg. Price/L</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(avgPricePerLiter)}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Consumption Report */}
      <AnimatePresence>
        {showReport && consumptionReport && consumptionReport.length > 0 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-orange" />
                  Consumption Report by Truck
                </CardTitle>
                <CardDescription className="text-brand-grey">
                  Fuel efficiency analysis for each truck
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {consumptionReport.map((report) => (
                    <div 
                      key={report._id} 
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Truck className="w-4 h-4 text-brand-orange" />
                        <span className="font-medium text-white">
                          {report.truckInfo?.plateNumber || 'Unknown'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-brand-grey">Total Volume</p>
                          <p className="text-white font-medium">{report.totalVolume?.toFixed(1)} L</p>
                        </div>
                        <div>
                          <p className="text-brand-grey">Total Cost</p>
                          <p className="text-white font-medium">{formatCurrency(report.totalCost)}</p>
                        </div>
                        <div>
                          <p className="text-brand-grey">Records</p>
                          <p className="text-white font-medium">{report.recordCount}</p>
                        </div>
                        <div>
                          <p className="text-brand-grey">Avg. Cost</p>
                          <p className="text-white font-medium">
                            {formatCurrency(report.totalCost / report.recordCount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-grey" />
                <Input
                  placeholder="Search by station or truck..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-brand-grey"
                />
              </div>
              {user?.role === 'admin' && (
                <Select value={truckFilter} onValueChange={setTruckFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by truck" />
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
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fuel Records Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white">
              Fuel Records
              <Badge variant="secondary" className="ml-2 bg-white/10 text-brand-grey">
                {filteredRecords.length} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <FuelIcon className="w-8 h-8 text-brand-orange/50" />
                </div>
                <p className="text-brand-grey text-lg mb-2">No fuel records found</p>
                <p className="text-brand-grey/60 text-sm mb-4">
                  {searchQuery || truckFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first fuel record to get started'}
                </p>
                {!searchQuery && truckFilter === 'all' && (
                  <Link to="/dashboard/fuel/add">
                    <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Record
                    </Button>
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-brand-grey">Date</TableHead>
                      <TableHead className="text-brand-grey">Truck</TableHead>
                      <TableHead className="text-brand-grey">Station</TableHead>
                      <TableHead className="text-brand-grey">Volume</TableHead>
                      <TableHead className="text-brand-grey">Price/L</TableHead>
                      <TableHead className="text-brand-grey">Total</TableHead>
                      <TableHead className="text-brand-grey text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredRecords.map((record, index) => (
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
                              {formatDate(record.date)}
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
                          <TableCell className="text-brand-grey">
                            {record.station || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Droplet className="w-3 h-3 text-blue-400" />
                              <span className="text-white">{record.volume?.toFixed(1)} L</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-brand-grey">
                            {formatCurrency(record.pricePerLiter)}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                              {formatCurrency(record.cost)}
                            </Badge>
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
                                <Link to={`/dashboard/fuel/edit/${record._id}`}>
                                  <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Record
                                  </DropdownMenuItem>
                                </Link>
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
              <FuelIcon className="w-5 h-5 text-brand-orange" />
              Fuel Record Details
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Detailed information for fuel record at <span className="text-brand-orange font-medium">{selectedRecord?.station}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Transaction Details</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Date:</span>
                      <span className="text-white text-sm">{formatDate(selectedRecord.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Station:</span>
                      <span className="text-white text-sm">{selectedRecord.station}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Invoice Number:</span>
                      <span className="text-white text-sm">{selectedRecord.invoiceNumber || 'N/A'}</span>
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
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Fuel & Cost</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Volume:</span>
                      <span className="text-white text-sm">{selectedRecord.volume?.toFixed(1)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Price per Liter:</span>
                      <span className="text-white text-sm">{formatCurrency(selectedRecord.pricePerLiter)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-grey/60 text-sm">Total Cost:</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                        {formatCurrency(selectedRecord.cost)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedRecord.remarks && (
                  <div>
                    <h4 className="text-sm font-medium text-brand-grey mb-1">Remarks</h4>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white text-sm">{selectedRecord.remarks}</p>
                    </div>
                  </div>
                )}
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
              Delete Fuel Record
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Are you sure you want to delete this fuel record from{' '}
              <span className="text-brand-orange font-medium">
                {recordToDelete?.station} ({formatDate(recordToDelete?.date)})
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
    </motion.div>
  );
};

export default Fuel;
