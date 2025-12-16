import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrailers, deleteTrailer, reset } from '../../store/slices/trailerSlice';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Container,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Weight,
  Box
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

const Trailers = () => {
  const dispatch = useDispatch();
  const { trailers, isLoading, isError, message } = useSelector(
    (state) => state.trailers
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trailerToDelete, setTrailerToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState(null);

  useEffect(() => {
    dispatch(getTrailers());

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

  const handleViewClick = (trailer) => {
    setSelectedTrailer(trailer);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (trailer) => {
    setTrailerToDelete(trailer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (trailerToDelete) {
      dispatch(deleteTrailer(trailerToDelete._id));
      toast.success('Trailer deleted successfully');
    }
    setDeleteDialogOpen(false);
    setTrailerToDelete(null);
  };

  // Filter trailers
  const filteredTrailers = trailers.filter(trailer => {
    const matchesSearch = 
      trailer.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trailer.type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trailer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_use': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (isLoading) {
    return <LoadingScreen message="Loading trailers..." />;
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
            <Container className="w-7 h-7 text-brand-orange" />
            Trailer Management
          </h1>
          <p className="text-brand-grey mt-1">Manage your fleet trailers</p>
        </div>
        <Link to="/dashboard/trailers/add">
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Trailer
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
                  placeholder="Search by plate number or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-brand-grey"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-brand-black border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trailers Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white">
              Trailer Fleet
              <Badge variant="secondary" className="ml-2 bg-white/10 text-brand-grey">
                {filteredTrailers.length} trailers
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTrailers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <Container className="w-8 h-8 text-brand-orange/50" />
                </div>
                <p className="text-brand-grey text-lg mb-2">No trailers found</p>
                <p className="text-brand-grey/60 text-sm mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first trailer to get started'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link to="/dashboard/trailers/add">
                    <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Trailer
                    </Button>
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-brand-grey">Trailer</TableHead>
                      <TableHead className="text-brand-grey">Type</TableHead>
                      <TableHead className="text-brand-grey">Capacity</TableHead>
                      <TableHead className="text-brand-grey">Status</TableHead>
                      <TableHead className="text-brand-grey text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredTrailers.map((trailer, index) => (
                        <motion.tr
                          key={trailer._id}
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
                                <Container className="w-5 h-5 text-brand-orange" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{trailer.plateNumber}</p>
                                <p className="text-xs text-brand-grey">ID: {trailer._id?.slice(-6)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-brand-grey">
                              <Box className="w-3 h-3" />
                              {trailer.type || 'Standard'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-brand-grey">
                              <Weight className="w-3 h-3" />
                              {trailer.capacity} tons
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(trailer.status)} border`}>
                              {formatStatus(trailer.status)}
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
                                  onClick={() => handleViewClick(trailer)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <Link to={`/dashboard/trailers/edit/${trailer._id}`}>
                                  <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Trailer
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                  onClick={() => handleDeleteClick(trailer)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Trailer
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
              <Container className="w-5 h-5 text-brand-orange" />
              Trailer Details
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Detailed information for trailer <span className="text-brand-orange font-medium">{selectedTrailer?.plateNumber}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrailer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Trailer Information</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Plate Number:</span>
                      <span className="text-white text-sm">{selectedTrailer.plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Type:</span>
                      <span className="text-white text-sm">{selectedTrailer.type || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grey/60 text-sm">Capacity:</span>
                      <span className="text-white text-sm">{selectedTrailer.capacity} tons</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-brand-grey mb-1">Status & Condition</h4>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-grey/60 text-sm">Status:</span>
                      <Badge className={`${getStatusColor(selectedTrailer.status)} border`}>
                        {formatStatus(selectedTrailer.status)}
                      </Badge>
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
              Delete Trailer
            </DialogTitle>
            <DialogDescription className="text-brand-grey">
              Are you sure you want to delete trailer <span className="text-brand-orange font-medium">{trailerToDelete?.plateNumber}</span>? This action cannot be undone.
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

export default Trailers;
