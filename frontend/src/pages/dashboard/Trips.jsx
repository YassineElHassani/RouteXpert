import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrips, deleteTrip, downloadTripPDF, updateTripStatus, reset } from '../../store/slices/tripSlice';
import { getUsers } from '../../store/slices/userSlice';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  FileText, 
  Search, 
  Filter,
  Route,
  MapPin,
  ArrowRight,
  User,
  Truck,
  Calendar,
  MoreHorizontal,
  Download,
  Eye,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const Trips = () => {
  const dispatch = useDispatch();
  const { trips, isLoading, isError, message } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);

  const [filters, setFilters] = useState({
    status: '',
    driverId: '',
    startDate: '',
    endDate: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [tripToUpdateStatus, setTripToUpdateStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getTrips(filters));
    if (user.role === 'admin') {
      dispatch(getUsers());
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, user.role]);

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    dispatch(getTrips(filters));
  };

  const handleViewClick = (trip) => {
    setSelectedTrip(trip);
    setViewDialogOpen(true);
  };

  const handleStatusClick = (trip) => {
    setTripToUpdateStatus(trip);
    setNewStatus(trip.status);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (tripToUpdateStatus && newStatus) {
      try {
        await dispatch(updateTripStatus({ id: tripToUpdateStatus._id, status: newStatus })).unwrap();
        toast.success('Trip status updated successfully');
        dispatch(getTrips(filters));
      } catch (error) {
        toast.error('Failed to update trip status');
      }
    }
    setStatusDialogOpen(false);
    setTripToUpdateStatus(null);
  };

  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (tripToDelete) {
      await dispatch(deleteTrip(tripToDelete._id));
      toast.success('Trip deleted successfully');
    }
    setDeleteDialogOpen(false);
    setTripToDelete(null);
  };

  const handleDownloadPDF = async (id) => {
    try {
      await dispatch(downloadTripPDF(id)).unwrap();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  // Filter drivers from users list
  const drivers = users.filter(u => u.role === 'driver');

  // Filter trips by search
  const filteredTrips = trips.filter(trip => {
    const searchLower = searchQuery.toLowerCase();
    return (
      trip.origin?.toLowerCase().includes(searchLower) ||
      trip.destination?.toLowerCase().includes(searchLower) ||
      trip.driverId?.name?.toLowerCase().includes(searchLower) ||
      trip.truckId?.plateNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'to_do': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatStatus = (status) => {
    if (status === 'to_do') return 'To Do';
    if (status === 'in_progress') return 'In Progress';
    return status?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (isLoading) {
    return <LoadingScreen message="Loading trips..." />;
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
            <Route className="w-7 h-7 text-brand-orange" />
            Trip Management
          </h1>
          <p className="text-brand-grey mt-1">Track and manage all your fleet trips</p>
        </div>
        {user.role === 'admin' && (
          <Link to="/dashboard/trips/add">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Trip
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-grey" />
                  <Input
                    placeholder="Search trips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-brand-grey"
                  />
                </div>
              </div>
              
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-brand-black border-white/10">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {user.role === 'admin' && (
                <Select value={filters.driverId} onValueChange={(value) => handleFilterChange('driverId', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-black border-white/10">
                    <SelectItem value="all">All Drivers</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver._id} value={driver._id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Start Date"
              />

              <Button
                onClick={applyFilters}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trips Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
              <span>Trip Records</span>
              <Badge variant="secondary" className="bg-white/10 text-brand-grey">
                {filteredTrips.length} trips
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTrips.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <Route className="w-8 h-8 text-brand-orange/50" />
                </div>
                <p className="text-brand-grey text-lg mb-2">No trips found</p>
                <p className="text-brand-grey/60 text-sm mb-4">
                  {searchQuery || filters.status
                    ? 'Try adjusting your search or filters'
                    : 'Create your first trip to get started'}
                </p>
                {user.role === 'admin' && !searchQuery && !filters.status && (
                  <Link to="/dashboard/trips/add">
                    <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Trip
                    </Button>
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-brand-grey">Route</TableHead>
                      <TableHead className="text-brand-grey">Driver</TableHead>
                      <TableHead className="text-brand-grey">Vehicle</TableHead>
                      <TableHead className="text-brand-grey">Status</TableHead>
                      <TableHead className="text-brand-grey">Date</TableHead>
                      <TableHead className="text-brand-grey text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredTrips.map((trip, index) => (
                        <motion.tr
                          key={trip._id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          className="border-white/5 hover:bg-white/5 transition-colors group"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                                <MapPin className="w-5 h-5 text-brand-orange" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1 text-white font-medium">
                                  <span className="truncate max-w-[100px]">{trip.origin}</span>
                                  <ArrowRight className="w-3 h-3 text-brand-grey" />
                                  <span className="truncate max-w-[100px]">{trip.destination}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-brand-grey">
                                  <Gauge className="w-3 h-3" />
                                  {trip.distance} km
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-brand-grey" />
                              <div>
                                <p className="text-white text-sm">
                                  {trip.driverId ? trip.driverId.name : 'Unassigned'}
                                </p>
                                {trip.driverId?.phone && (
                                  <p className="text-xs text-brand-grey">{trip.driverId.phone}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-brand-grey" />
                              <div>
                                <p className="text-white text-sm">
                                  {trip.truckId ? trip.truckId.plateNumber : 'No Truck'}
                                </p>
                                {trip.trailerId && (
                                  <p className="text-xs text-brand-grey">+ {trip.trailerId.plateNumber}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(trip.status)} border`}>
                              {formatStatus(trip.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-brand-grey text-sm">
                              <Calendar className="w-3 h-3" />
                              {new Date(trip.departureDate).toLocaleDateString()}
                            </div>
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
                                  onClick={() => handleViewClick(trip)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-white hover:bg-white/10 cursor-pointer"
                                  onClick={() => handleDownloadPDF(trip._id)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                {(user.role === 'driver' && trip.driverId?._id === user.id) && (
                                  <>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem 
                                      className="text-white hover:bg-white/10 cursor-pointer"
                                      onClick={() => handleStatusClick(trip)}
                                    >
                                      <Gauge className="w-4 h-4 mr-2" />
                                      Update Status
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {user.role === 'admin' && (
                                  <>
                                    <Link to={`/dashboard/trips/edit/${trip._id}`}>
                                      <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit Trip
                                      </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem 
                                      className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                      onClick={() => handleDeleteClick(trip)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Trip
                                    </DropdownMenuItem>
                                  </>
                                )}
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
              <Route className="w-5 h-5 text-brand-orange" />
              Trip Details
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Detailed information for trip from <span className="text-brand-orange font-medium">{selectedTrip?.origin}</span> to <span className="text-brand-orange font-medium">{selectedTrip?.destination}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrip && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Route Information</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Origin:</span>
                      <span className="text-white text-sm">{selectedTrip.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Destination:</span>
                      <span className="text-white text-sm">{selectedTrip.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Distance:</span>
                      <span className="text-white text-sm">{selectedTrip.distance} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-grey/60 text-sm">Status:</span>
                      <Badge className={`${getStatusColor(selectedTrip.status)} border`}>
                        {formatStatus(selectedTrip.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Schedule</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Departure:</span>
                      <span className="text-white text-sm">{new Date(selectedTrip.departureDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Arrival:</span>
                      <span className="text-white text-sm">{new Date(selectedTrip.arrivalDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Assignment</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Driver:</span>
                      <span className="text-white text-sm">{selectedTrip.driverId?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Truck:</span>
                      <span className="text-white text-sm">{selectedTrip.truckId?.plateNumber || 'No Truck'}</span>
                    </div>
                    {selectedTrip.trailerId && (
                      <div className="flex justify-between">
                        <span className="text-brand-grey/60 text-sm">Trailer:</span>
                        <span className="text-white text-sm">{selectedTrip.trailerId.plateNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTrip.cargoDetails && (
                  <div>
                    <h4 className="text-sm font-medium text-brand-grey mb-1">Cargo Details</h4>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white text-sm">{selectedTrip.cargoDetails}</p>
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

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-brand-black border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-brand-orange" />
              Update Trip Status
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Update the status for trip from{' '}
              <span className="text-brand-orange font-medium">
                {tripToUpdateStatus?.origin}
              </span>{' '}
              to{' '}
              <span className="text-brand-orange font-medium">
                {tripToUpdateStatus?.destination}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="status" className="text-white mb-2 block">
              Select New Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-brand-black border-white/10">
                <SelectItem value="to_do">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    To Do
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              Update Status
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
              Delete Trip
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Are you sure you want to delete this trip from <span className="text-brand-orange font-medium">{tripToDelete?.origin}</span> to <span className="text-brand-orange font-medium">{tripToDelete?.destination}</span>? This action cannot be undone.
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

export default Trips;
