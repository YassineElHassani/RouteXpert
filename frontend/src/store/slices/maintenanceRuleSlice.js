import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  maintenanceRules: [],
  maintenanceRule: null,
  upcomingMaintenance: [],
  dashboard: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all maintenance rules
export const getMaintenanceRules = createAsyncThunk(
  'maintenanceRules/getAll',
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/maintenance-rules?${params}`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single maintenance rule
export const getMaintenanceRule = createAsyncThunk(
  'maintenanceRules/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/maintenance-rules/${id}`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create maintenance rule
export const createMaintenanceRule = createAsyncThunk(
  'maintenanceRules/create',
  async (ruleData, thunkAPI) => {
    try {
      const response = await api.post('/maintenance-rules', ruleData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update maintenance rule
export const updateMaintenanceRule = createAsyncThunk(
  'maintenanceRules/update',
  async ({ id, ruleData }, thunkAPI) => {
    try {
      const response = await api.put(`/maintenance-rules/${id}`, ruleData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete maintenance rule
export const deleteMaintenanceRule = createAsyncThunk(
  'maintenanceRules/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/maintenance-rules/${id}`);
      return id;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get upcoming maintenance for truck
export const getUpcomingMaintenance = createAsyncThunk(
  'maintenanceRules/upcoming',
  async (truckId, thunkAPI) => {
    try {
      const response = await api.get(`/trucks/${truckId}/upcoming-maintenance`);
      return response.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get maintenance dashboard
export const getMaintenanceDashboard = createAsyncThunk(
  'maintenanceRules/dashboard',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/maintenance-rules/dashboard');
      return response.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const maintenanceRuleSlice = createSlice({
  name: 'maintenanceRules',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.maintenanceRule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all
      .addCase(getMaintenanceRules.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMaintenanceRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maintenanceRules = action.payload;
      })
      .addCase(getMaintenanceRules.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get one
      .addCase(getMaintenanceRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMaintenanceRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maintenanceRule = action.payload;
      })
      .addCase(getMaintenanceRule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create
      .addCase(createMaintenanceRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMaintenanceRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.maintenanceRules.push(action.payload);
      })
      .addCase(createMaintenanceRule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateMaintenanceRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMaintenanceRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.maintenanceRules = state.maintenanceRules.map((rule) =>
          rule._id === action.payload._id ? action.payload : rule
        );
      })
      .addCase(updateMaintenanceRule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteMaintenanceRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMaintenanceRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maintenanceRules = state.maintenanceRules.filter(
          (rule) => rule._id !== action.payload
        );
      })
      .addCase(deleteMaintenanceRule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Upcoming maintenance
      .addCase(getUpcomingMaintenance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUpcomingMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingMaintenance = action.payload.data;
      })
      .addCase(getUpcomingMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Dashboard
      .addCase(getMaintenanceDashboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMaintenanceDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(getMaintenanceDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = maintenanceRuleSlice.actions;
export default maintenanceRuleSlice.reducer;
