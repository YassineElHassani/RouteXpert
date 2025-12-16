import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Truck,
  CheckCircle,
  AlertTriangle,
  Fuel,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Route,
  Gauge,
  Calendar
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTrucks } from '../../store/slices/truckSlice';
import { getTrips } from '../../store/slices/tripSlice';
import { getPendingMaintenance } from '../../store/slices/maintenanceSlice';
import { getFuelRecords } from '../../store/slices/fuelSlice';
import { containerVariants, itemVariants } from '@/lib/animations';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { trucks } = useSelector((state) => state.trucks);
  const { trips } = useSelector((state) => state.trips);
  const { pendingMaintenance } = useSelector((state) => state.maintenance);
  const { fuelRecords } = useSelector((state) => state.fuel);

  useEffect(() => {
    dispatch(getTrips());
    
    // Only admins can access these endpoints
    if (user?.role === 'admin') {
      dispatch(getTrucks());
      dispatch(getPendingMaintenance());
      dispatch(getFuelRecords());
    }
  }, [dispatch, user?.role]);

  // Calculate stats
  const activeTrucks = trucks?.filter(truck => truck.status === 'in_use').length || 0;
  const availableTrucks = trucks?.filter(truck => truck.status === 'available').length || 0;
  const totalFuel = fuelRecords?.reduce((acc, record) => acc + (record.volume || 0), 0) || 0;
  const completedTrips = trips?.filter(trip => trip.status === 'completed').length || 0;
  const inProgressTrips = trips?.filter(trip => trip.status === 'in_progress').length || 0;

  // Get recent trips
  const recentTrips = [...(trips || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'to_do': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <Card className="glass border-white/10 bg-linear-to-r from-brand-orange/10 via-brand-amber/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-brand-orange/50">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-brand-orange/20 text-brand-orange text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
                  </h1>
                  <p className="text-brand-grey mt-1">
                    Here's what's happening with your fleet today.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-4 hidden md:block">
                  <p className="text-sm text-brand-grey">Today's Date</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <Link to="/dashboard/trips">
                  <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                    <Route className="w-4 h-4 mr-2" />
                    New Trip
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Trips"
            value={trips.length}
            icon={Route}
            color="orange"
            trend={{ value: completedTrips, label: 'completed' }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Active Trucks"
            value={activeTrucks}
            icon={Truck}
            color="blue"
            trend={{ value: availableTrucks, label: 'available' }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Maintenance Alerts"
            value={pendingMaintenance.length}
            icon={AlertTriangle}
            color="red"
            trend={{ value: pendingMaintenance.length > 0 ? 'Needs attention' : 'All clear', isText: true }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Fuel Consumed"
            value={`${(totalFuel / 1000).toFixed(1)}k L`}
            icon={Fuel}
            color="yellow"
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass border-white/10 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-orange" />
                Recent Trips
              </CardTitle>
              <Link to="/dashboard/trips">
                <Button variant="ghost" size="sm" className="text-brand-orange hover:text-brand-orange/80 hover:bg-brand-orange/10">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {recentTrips.length > 0 ? (
                  <div className="space-y-3">
                    {recentTrips.map((trip, index) => (
                      <motion.div
                        key={trip._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                              <span className="text-sm font-medium text-white truncate">
                                {trip.origin}
                              </span>
                              <ArrowRight className="w-3 h-3 text-brand-grey shrink-0" />
                              <span className="text-sm font-medium text-white truncate">
                                {trip.destination}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-brand-grey">
                              <span className="flex items-center gap-1">
                                <Gauge className="w-3 h-3" />
                                {trip.distance} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(trip.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(trip.status)} border text-xs`}>
                            {formatStatus(trip.status)}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-brand-grey">
                    <Route className="w-12 h-12 mb-3 opacity-30" />
                    <p>No trips recorded yet</p>
                    <Link to="/dashboard/trips">
                      <Button variant="link" className="text-brand-orange mt-2">
                        Create your first trip
                      </Button>
                    </Link>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fleet Status */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-white/10 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-orange" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trucks Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-grey">Truck Utilization</span>
                  <span className="text-white font-medium">
                    {trucks?.length > 0 ? Math.round((activeTrucks / trucks.length) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={trucks?.length > 0 ? (activeTrucks / trucks.length) * 100 : 0}
                  className="h-2 bg-white/10"
                />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-lg font-bold text-blue-400">{activeTrucks}</p>
                    <p className="text-xs text-brand-grey">In Use</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-lg font-bold text-green-400">{availableTrucks}</p>
                    <p className="text-xs text-brand-grey">Available</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-lg font-bold text-yellow-400">
                      {trucks?.filter(t => t.status === 'maintenance').length || 0}
                    </p>
                    <p className="text-xs text-brand-grey">Service</p>
                  </div>
                </div>
              </div>

              {/* Trip Progress */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-grey">Trip Completion</span>
                  <span className="text-white font-medium">
                    {trips?.length > 0 ? Math.round((completedTrips / trips.length) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={trips?.length > 0 ? (completedTrips / trips.length) * 100 : 0}
                  className="h-2 bg-white/10"
                />
                <div className="flex items-center justify-between text-xs text-brand-grey mt-2">
                  <span>{completedTrips} completed</span>
                  <span>{inProgressTrips} in progress</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-brand-grey mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/dashboard/trucks">
                    <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 text-white">
                      <Truck className="w-3 h-3 mr-1" />
                      Trucks
                    </Button>
                  </Link>
                  <Link to="/dashboard/maintenance">
                    <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 text-white">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Maintenance
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Maintenance Alerts Section */}
      {pendingMaintenance.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Pending Maintenance ({pendingMaintenance.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingMaintenance.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{item.type}</p>
                        <p className="text-xs text-brand-grey mt-1">
                          Truck: {item.truck?.plateNumber || 'N/A'}
                        </p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs">
                        Pending
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              {pendingMaintenance.length > 3 && (
                <div className="mt-4 text-center">
                  <Link to="/dashboard/maintenance">
                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      View all {pendingMaintenance.length} alerts
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardHome;
