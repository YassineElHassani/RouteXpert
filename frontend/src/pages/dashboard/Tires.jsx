import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTires, deleteTire, reset } from '../../store/slices/tireSlice';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Circle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  Container,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const Tires = () => {
  const dispatch = useDispatch();
  const { tires, isLoading, isError, message } = useSelector(
    (state) => state.tires
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tireToDelete, setTireToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState(null);

  useEffect(() => {
    dispatch(getTires());

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

  const handleViewClick = (tire) => {
    setSelectedTire(tire);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (tire) => {
    setTireToDelete(tire);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tireToDelete) {
      dispatch(deleteTire(tireToDelete._id));
      toast.success('Tire deleted successfully');
    }
    setDeleteDialogOpen(false);
    setTireToDelete(null);
  };

  // Filter tires
  const filteredTires = tires.filter(tire => {
    const matchesSearch = 
      tire.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.truckId?.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.trailerId?.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCondition = conditionFilter === 'all' || tire.condition === conditionFilter;
    
    return matchesSearch && matchesCondition;
  });

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'good': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'worn': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'needs_replacement': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCondition = (condition) => {
    return condition?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getInstalledOn = (tire) => {
    if (tire.truckId) return { type: 'truck', label: tire.truckId.plateNumber, icon: Truck };
    if (tire.trailerId) return { type: 'trailer', label: tire.trailerId.plateNumber, icon: Container };
    return { type: 'stock', label: 'In Stock', icon: Circle };
  };

  if (isLoading) {
    return <LoadingScreen message="Loading tires..." />;
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
            <Circle className="w-7 h-7 text-brand-orange" />
            Tire Management
          </h1>
          <p className="text-brand-grey mt-1">Track and manage all fleet tires</p>
        </div>
        <Link to="/dashboard/tires/add">
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Tire
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
                  placeholder="Search by brand, position, or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-brand-grey"
                />
              </div>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by condition" />
                </SelectTrigger>
                <SelectContent className="bg-brand-black border-white/10">
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                  <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tires Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white">
              Tire Inventory
              <Badge variant="secondary" className="ml-2 bg-white/10 text-brand-grey">
                {filteredTires.length} tires
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTires.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <Circle className="w-8 h-8 text-brand-orange/50" />
                </div>
                <p className="text-brand-grey text-lg mb-2">No tires found</p>
                <p className="text-brand-grey/60 text-sm mb-4">
                  {searchQuery || conditionFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first tire to get started'}
                </p>
                {!searchQuery && conditionFilter === 'all' && (
                  <Link to="/dashboard/tires/add">
                    <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Tire
                    </Button>
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-brand-grey">Tire</TableHead>
                      <TableHead className="text-brand-grey">Position</TableHead>
                      <TableHead className="text-brand-grey">Installed On</TableHead>
                      <TableHead className="text-brand-grey">Condition</TableHead>
                      <TableHead className="text-brand-grey text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredTires.map((tire, index) => {
                        const installedOn = getInstalledOn(tire);
                        const IconComponent = installedOn.icon;
                        
                        return (
                          <motion.tr
                            key={tire._id}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            custom={index}
                            className="border-white/5 hover:bg-white/5 transition-colors group"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                                  <Circle className="w-5 h-5 text-brand-orange" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{tire.brand}</p>
                                  <p className="text-xs text-brand-grey">ID: {tire._id?.slice(-6)}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-brand-grey">
                                <MapPin className="w-3 h-3" />
                                {tire.position || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-brand-grey" />
                                <span className={`text-sm ${installedOn.type === 'stock' ? 'text-brand-grey' : 'text-white'}`}>
                                  {installedOn.label}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getConditionColor(tire.condition)} border`}>
                                {formatCondition(tire.condition)}
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
                                  onClick={() => handleViewClick(tire)}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <Link to={`/dashboard/tires/edit/${tire._id}`}>
                                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Tire
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                    onClick={() => handleDeleteClick(tire)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Tire
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
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-brand-black border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Circle className="w-5 h-5 text-brand-orange" />
              Tire Details
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Detailed information for tire <span className="text-brand-orange font-medium">{selectedTire?.brand}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedTire && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Tire Information</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Brand:</span>
                      <span className="text-white text-sm">{selectedTire.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Position:</span>
                      <span className="text-white text-sm">{selectedTire.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Serial Number:</span>
                      <span className="text-white text-sm">{selectedTire.serialNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Status & Condition</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-grey/60 text-sm">Condition:</span>
                      <Badge className={`${getConditionColor(selectedTire.condition)} border`}>
                        {formatCondition(selectedTire.condition)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Installed On:</span>
                      <span className="text-white text-sm">
                        {selectedTire.truckId ? `Truck: ${selectedTire.truckId.plateNumber}` : 
                         selectedTire.trailerId ? `Trailer: ${selectedTire.trailerId.plateNumber}` : 
                         'In Stock'}
                      </span>
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
              Delete Tire
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Are you sure you want to delete tire <span className="text-brand-orange font-medium">{tireToDelete?.brand} - {tireToDelete?.position}</span>? This action cannot be undone.
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

export default Tires;
