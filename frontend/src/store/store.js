import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import truckReducer from './slices/truckSlice';
import trailerReducer from './slices/trailerSlice';
import tireReducer from './slices/tireSlice';
import tripReducer from './slices/tripSlice';
import userReducer from './slices/userSlice';
import fuelReducer from './slices/fuelSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import maintenanceRuleReducer from './slices/maintenanceRuleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trucks: truckReducer,
    trailers: trailerReducer,
    tires: tireReducer,
    trips: tripReducer,
    users: userReducer,
    fuel: fuelReducer,
    maintenance: maintenanceReducer,
    maintenanceRules: maintenanceRuleReducer,
  },
});
