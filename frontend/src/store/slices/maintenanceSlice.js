import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  maintenanceRecords: [],
  maintenanceRecord: null,
  pendingMaintenance: [],
  overdueMaintenance: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all maintenance records
export const getMaintenanceRecords = createAsyncThunk(
  'maintenance/getAll',
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/maintenance?${params}`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single maintenance record
export const getMaintenanceRecord = createAsyncThunk(
  'maintenance/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/maintenance/${id}`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get pending maintenance
export const getPendingMaintenance = createAsyncThunk(
  'maintenance/getPending',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/maintenance/alerts/pending');
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get overdue maintenance
export const getOverdueMaintenance = createAsyncThunk(
  'maintenance/getOverdue',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/maintenance/alerts/overdue');
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create maintenance record
export const createMaintenanceRecord = createAsyncThunk(
  'maintenance/create',
  async (maintenanceData, thunkAPI) => {
    try {
      const response = await api.post('/maintenance', maintenanceData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update maintenance record
export const updateMaintenanceRecord = createAsyncThunk(
  'maintenance/update',
  async ({ id, maintenanceData }, thunkAPI) => {
    try {
      const response = await api.put(`/maintenance/${id}`, maintenanceData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Complete maintenance
export const completeMaintenance = createAsyncThunk(
  'maintenance/complete',
  async ({ id, completionData }, thunkAPI) => {
    try {
      const response = await api.patch(`/maintenance/${id}/complete`, completionData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete maintenance record
export const deleteMaintenanceRecord = createAsyncThunk(
  'maintenance/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/maintenance/${id}`);
      return id;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.maintenanceRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all
      .addCase(getMaintenanceRecords.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMaintenanceRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maintenanceRecords = action.payload;
      })
      .addCase(getMaintenanceRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get one
      .addCase(getMaintenanceRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMaintenanceRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maintenanceRecord = action.payload;
      })
      .addCase(getMaintenanceRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get pending
      .addCase(getPendingMaintenance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPendingMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingMaintenance = action.payload;
      })
      .addCase(getPendingMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get overdue
      .addCase(getOverdueMaintenance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOverdueMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overdueMaintenance = action.payload;
      })
      .addCase(getOverdueMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create
      .addCase(createMaintenanceRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMaintenanceRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.maintenanceRecords.unshift(action.payload);
      })
      .addCase(createMaintenanceRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateMaintenanceRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMaintenanceRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.maintenanceRecords = state.maintenanceRecords.map((record) =>
          record._id === action.payload._id ? action.payload : record
        );
      })
      .addCase(updateMaintenanceRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Complete
      .addCase(completeMaintenance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.maintenanceRecords = state.maintenanceRecords.map((record) =>
          record._id === action.payload._id ? action.payload : record
        );
        state.pendingMaintenance = state.pendingMaintenance.filter(
          (record) => record._id !== action.payload._id
        );
      })
      .addCase(completeMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteMaintenanceRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMaintenanceRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maintenanceRecords = state.maintenanceRecords.filter(
          (record) => record._id !== action.payload
        );
      })
      .addCase(deleteMaintenanceRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
