import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import Trucks from './pages/dashboard/Trucks';
import TruckForm from './pages/dashboard/TruckForm';
import Trailers from './pages/dashboard/Trailers';
import TrailerForm from './pages/dashboard/TrailerForm';
import Tires from './pages/dashboard/Tires';
import TireForm from './pages/dashboard/TireForm';
import Trips from './pages/dashboard/Trips';
import TripForm from './pages/dashboard/TripForm';
import Fuel from './pages/dashboard/Fuel';
import FuelForm from './pages/dashboard/FuelForm';
import Maintenance from './pages/dashboard/Maintenance';
import MaintenanceForm from './pages/dashboard/MaintenanceForm';
import Drivers from './pages/dashboard/Drivers';
import DriverForm from './pages/dashboard/DriverForm';
import Reports from './pages/dashboard/Reports';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="trucks" element={<Trucks />} />
            <Route path="trucks/add" element={<TruckForm />} />
            <Route path="trucks/edit/:id" element={<TruckForm />} />
            <Route path="trailers" element={<Trailers />} />
            <Route path="trailers/add" element={<TrailerForm />} />
            <Route path="trailers/edit/:id" element={<TrailerForm />} />
            <Route path="tires" element={<Tires />} />
            <Route path="tires/add" element={<TireForm />} />
            <Route path="tires/edit/:id" element={<TireForm />} />
            <Route path="trips" element={<Trips />} />
            <Route path="trips/add" element={<TripForm />} />
            <Route path="trips/edit/:id" element={<TripForm />} />
            <Route path="fuel" element={<Fuel />} />
            <Route path="fuel/add" element={<FuelForm />} />
            <Route path="fuel/edit/:id" element={<FuelForm />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="maintenance/add" element={<MaintenanceForm />} />
            <Route path="maintenance/edit/:id" element={<MaintenanceForm />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="drivers/add" element={<DriverForm />} />
            <Route path="drivers/edit/:id" element={<DriverForm />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
