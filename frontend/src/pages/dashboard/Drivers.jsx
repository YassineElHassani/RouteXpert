import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getDrivers, deleteDriver, reset } from '../../store/slices/userSlice';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { LoadingScreen } from '@/components/ui/loading';
import { containerVariants, itemVariants, tableRowVariants } from '@/lib/animations';

const Drivers = () => {
  const dispatch = useDispatch();
  const { drivers, isLoading, isError, message } = useSelector(
    (state) => state.users
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    dispatch(getDrivers());

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

  const handleViewClick = (driver) => {
    setSelectedDriver(driver);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (driverToDelete) {
      dispatch(deleteDriver(driverToDelete._id));
      toast.success('Driver removed successfully');
    }
    setDeleteDialogOpen(false);
    setDriverToDelete(null);
  };

  // Filter drivers
  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = 
      driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR';
  };

  if (isLoading) {
    return <LoadingScreen message="Loading drivers..." />;
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
            <Users className="w-7 h-7 text-brand-orange" />
            Driver Management
          </h1>
          <p className="text-brand-grey mt-1">Manage your fleet drivers</p>
        </div>
        <Link to="/dashboard/drivers/add">
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Total Drivers</p>
              <p className="text-2xl font-bold text-white">{filteredDrivers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{filteredDrivers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-brand-grey text-sm">New This Month</p>
              <p className="text-2xl font-bold text-white">
                {filteredDrivers.filter(d => {
                  const created = new Date(d.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-grey" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-brand-grey"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Drivers Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white">
              Drivers
              <Badge variant="secondary" className="ml-2 bg-white/10 text-brand-grey">
                {filteredDrivers.length} drivers
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDrivers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-brand-orange/50" />
                </div>
                <p className="text-brand-grey text-lg mb-2">No drivers found</p>
                <p className="text-brand-grey/60 text-sm mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search'
                    : 'Add your first driver to get started'}
                </p>
                {!searchQuery && (
                  <Link to="/dashboard/drivers/add">
                    <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Driver
                    </Button>
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-brand-grey">Driver</TableHead>
                      <TableHead className="text-brand-grey">Contact</TableHead>
                      <TableHead className="text-brand-grey">Role</TableHead>
                      <TableHead className="text-brand-grey">Joined</TableHead>
                      <TableHead className="text-brand-grey text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredDrivers.map((driver, index) => (
                        <motion.tr
                          key={driver._id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          className="border-white/5 hover:bg-white/5 transition-colors group"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 bg-brand-orange/20">
                                <AvatarFallback className="bg-brand-orange/20 text-brand-orange font-medium">
                                  {getInitials(driver.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-white">{driver.name}</p>
                                <p className="text-xs text-brand-grey">ID: {driver._id?.slice(-6)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-brand-grey">
                                <Mail className="w-3 h-3" />
                                {driver.email}
                              </div>
                              {driver.phone && (
                                <div className="flex items-center gap-2 text-sm text-brand-grey">
                                  <Phone className="w-3 h-3" />
                                  {driver.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                              {driver.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-brand-grey">
                              <Calendar className="w-4 h-4" />
                              {formatDate(driver.createdAt)}
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
                                  onClick={() => handleViewClick(driver)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <Link to={`/dashboard/drivers/edit/${driver._id}`}>
                                  <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Driver
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                  onClick={() => handleDeleteClick(driver)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove Driver
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
              <Users className="w-5 h-5 text-brand-orange" />
              Driver Profile
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Detailed information for <span className="text-brand-orange font-medium">{selectedDriver?.name}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedDriver && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 bg-brand-orange/20">
                    <AvatarFallback className="bg-brand-orange/20 text-brand-orange text-2xl font-medium">
                      {getInitials(selectedDriver.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedDriver.name}</h3>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border mt-1">
                      {selectedDriver.role}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Contact Information</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Email:</span>
                      <span className="text-white text-sm">{selectedDriver.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Phone:</span>
                      <span className="text-white text-sm">{selectedDriver.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Account Details</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Member Since:</span>
                      <span className="text-white text-sm">{formatDate(selectedDriver.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Last Updated:</span>
                      <span className="text-white text-sm">{formatDate(selectedDriver.updatedAt)}</span>
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
              Remove Driver
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Are you sure you want to remove{' '}
              <span className="text-brand-orange font-medium">
                {driverToDelete?.name}
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
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Drivers;
