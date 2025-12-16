import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { getTrucks } from '../../store/slices/truckSlice';
import { getTrips } from '../../store/slices/tripSlice';
import { getFuelRecords, getFuelConsumptionReport } from '../../store/slices/fuelSlice';
import { getMaintenanceRecords } from '../../store/slices/maintenanceSlice';
import { getDrivers } from '../../store/slices/userSlice';
import { 
  BarChart3, 
  TrendingUp, 
  Truck, 
  Route, 
  Fuel, 
  Wrench,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  Droplet,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LoadingScreen } from '@/components/ui/loading';
import { containerVariants, itemVariants } from '@/lib/animations';

const Reports = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState('month');
  
  const { trucks } = useSelector((state) => state.trucks);
  const { trips } = useSelector((state) => state.trips);
  const { fuelRecords, consumptionReport } = useSelector((state) => state.fuel);
  const { maintenanceRecords } = useSelector((state) => state.maintenance);
  const { drivers } = useSelector((state) => state.users);
  
  const isLoading = useSelector((state) => 
    state.trucks.isLoading || 
    state.trips.isLoading || 
    state.fuel.isLoading || 
    state.maintenance.isLoading
  );

  useEffect(() => {
    dispatch(getTrucks());
    dispatch(getTrips());
    dispatch(getFuelRecords());
    dispatch(getFuelConsumptionReport());
    dispatch(getMaintenanceRecords());
    dispatch(getDrivers());
  }, [dispatch]);

  // Calculate stats
  const totalFuelCost = fuelRecords?.reduce((sum, r) => sum + (r.totalCost || 0), 0) || 0;
  const totalFuelVolume = fuelRecords?.reduce((sum, r) => sum + (r.volume || 0), 0) || 0;
  const totalMaintenanceCost = maintenanceRecords?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;
  const completedTrips = trips?.filter(t => t.status === 'completed').length || 0;
  const activeTrips = trips?.filter(t => t.status === 'in_progress').length || 0;
  const activeTrucks = trucks?.filter(t => t.status === 'active').length || 0;

  // Calculate trip distance
  const totalDistance = trips?.reduce((sum, t) => sum + (t.distance || 0), 0) || 0;

  // Get fuel efficiency data
  const fuelEfficiencyData = consumptionReport?.map(report => ({
    truck: report.truckInfo?.plateNumber || 'Unknown',
    totalVolume: report.totalVolume,
    totalCost: report.totalCost,
    avgCost: report.totalCost / report.recordCount,
    recordCount: report.recordCount,
  })) || [];

  // Get maintenance by type
  const maintenanceByType = maintenanceRecords?.reduce((acc, record) => {
    const type = record.type || 'other';
    if (!acc[type]) acc[type] = { count: 0, cost: 0 };
    acc[type].count++;
    acc[type].cost += record.cost || 0;
    return acc;
  }, {}) || {};

  // Get trip status distribution
  const tripStatusDistribution = trips?.reduce((acc, trip) => {
    const status = trip.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading reports..." />;
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
            <BarChart3 className="w-7 h-7 text-brand-orange" />
            Reports & Analytics
          </h1>
          <p className="text-brand-grey mt-1">Fleet performance insights and statistics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-brand-black border-white/10">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-grey text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalFuelCost + totalMaintenanceCost)}</p>
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-grey text-sm">Active Fleet</p>
                <p className="text-2xl font-bold text-white mt-1">{activeTrucks}/{trucks?.length || 0}</p>
                <p className="text-xs text-brand-grey mt-1">trucks operational</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-brand-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-grey text-sm">Total Distance</p>
                <p className="text-2xl font-bold text-white mt-1">{formatNumber(totalDistance)} km</p>
                <p className="text-xs text-brand-grey mt-1">{completedTrips} trips completed</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Route className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-grey text-sm">Active Drivers</p>
                <p className="text-2xl font-bold text-white mt-1">{drivers?.length || 0}</p>
                <p className="text-xs text-brand-grey mt-1">{activeTrips} on route</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Reports */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="fuel" className="w-full">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="fuel" className="data-[state=active]:bg-brand-orange">
              <Fuel className="w-4 h-4 mr-2" />
              Fuel Analysis
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-brand-orange">
              <Wrench className="w-4 h-4 mr-2" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="trips" className="data-[state=active]:bg-brand-orange">
              <Route className="w-4 h-4 mr-2" />
              Trips
            </TabsTrigger>
            <TabsTrigger value="fleet" className="data-[state=active]:bg-brand-orange">
              <Truck className="w-4 h-4 mr-2" />
              Fleet
            </TabsTrigger>
          </TabsList>

          {/* Fuel Analysis Tab */}
          <TabsContent value="fuel" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Fuel Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Total Volume</span>
                    <span className="text-white font-medium">{totalFuelVolume.toFixed(1)} L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Total Cost</span>
                    <span className="text-white font-medium">{formatCurrency(totalFuelCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Avg. Price/L</span>
                    <span className="text-white font-medium">
                      {formatCurrency(totalFuelVolume > 0 ? totalFuelCost / totalFuelVolume : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Records</span>
                    <span className="text-white font-medium">{fuelRecords?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Consumption by Truck</CardTitle>
                  <CardDescription className="text-brand-grey">Fuel usage comparison across fleet</CardDescription>
                </CardHeader>
                <CardContent>
                  {fuelEfficiencyData.length === 0 ? (
                    <p className="text-brand-grey text-center py-8">No fuel data available</p>
                  ) : (
                    <div className="space-y-4">
                      {fuelEfficiencyData.slice(0, 5).map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-brand-orange" />
                              <span className="text-white font-medium">{item.truck}</span>
                            </div>
                            <span className="text-brand-grey text-sm">{item.totalVolume.toFixed(1)} L</span>
                          </div>
                          <Progress 
                            value={(item.totalVolume / Math.max(...fuelEfficiencyData.map(f => f.totalVolume))) * 100} 
                            className="h-2 bg-white/10"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Maintenance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Total Cost</span>
                    <span className="text-white font-medium">{formatCurrency(totalMaintenanceCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Total Records</span>
                    <span className="text-white font-medium">{maintenanceRecords?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Completed</span>
                    <span className="text-green-400 font-medium">
                      {maintenanceRecords?.filter(m => m.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Pending</span>
                    <span className="text-yellow-400 font-medium">
                      {maintenanceRecords?.filter(m => m.status === 'pending' || m.status === 'scheduled').length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Maintenance by Type</CardTitle>
                  <CardDescription className="text-brand-grey">Breakdown of maintenance activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(maintenanceByType).length === 0 ? (
                    <p className="text-brand-grey text-center py-8">No maintenance data available</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(maintenanceByType).map(([type, data]) => (
                        <div key={type} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="w-4 h-4 text-brand-orange" />
                            <span className="text-white font-medium capitalize">
                              {type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-brand-grey">Count</p>
                              <p className="text-white font-medium">{data.count}</p>
                            </div>
                            <div>
                              <p className="text-brand-grey">Cost</p>
                              <p className="text-white font-medium">{formatCurrency(data.cost)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Trip Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Total Trips</span>
                    <span className="text-white font-medium">{trips?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Completed</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                      {completedTrips}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">In Progress</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                      {activeTrips}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Total Distance</span>
                    <span className="text-white font-medium">{formatNumber(totalDistance)} km</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Trip Status Distribution</CardTitle>
                  <CardDescription className="text-brand-grey">Current status of all trips</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(tripStatusDistribution).length === 0 ? (
                    <p className="text-brand-grey text-center py-8">No trip data available</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(tripStatusDistribution).map(([status, count]) => {
                        const total = trips?.length || 1;
                        const percentage = (count / total) * 100;
                        const statusColors = {
                          completed: 'bg-green-500',
                          in_progress: 'bg-blue-500',
                          scheduled: 'bg-yellow-500',
                          cancelled: 'bg-red-500',
                        };
                        
                        return (
                          <div key={status} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium capitalize">{status.replace(/_/g, ' ')}</span>
                              <span className="text-brand-grey">{count} trips ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fleet Tab */}
          <TabsContent value="fleet" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Fleet Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Total Trucks</span>
                    <span className="text-white font-medium">{trucks?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Active</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                      {activeTrucks}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">In Maintenance</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                      {trucks?.filter(t => t.status === 'maintenance').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-grey">Inactive</span>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 border">
                      {trucks?.filter(t => t.status === 'inactive').length || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Fleet Utilization</CardTitle>
                  <CardDescription className="text-brand-grey">Truck status and mileage overview</CardDescription>
                </CardHeader>
                <CardContent>
                  {trucks?.length === 0 ? (
                    <p className="text-brand-grey text-center py-8">No fleet data available</p>
                  ) : (
                    <div className="space-y-4">
                      {trucks?.slice(0, 5).map((truck) => (
                        <div key={truck._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                              <Truck className="w-5 h-5 text-brand-orange" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{truck.plateNumber}</p>
                              <p className="text-xs text-brand-grey">{truck.brand} {truck.model}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${
                              truck.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              truck.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            } border`}>
                              {truck.status}
                            </Badge>
                            <p className="text-xs text-brand-grey mt-1">{formatNumber(truck.mileage)} km</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Reports;
