import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  fuelRecords: [],
  fuelRecord: null,
  consumptionReport: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all fuel records
export const getFuelRecords = createAsyncThunk(
  'fuel/getAll',
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/fuel?${params}`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single fuel record
export const getFuelRecord = createAsyncThunk(
  'fuel/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/fuel/${id}`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new fuel record
export const createFuelRecord = createAsyncThunk(
  'fuel/create',
  async (fuelData, thunkAPI) => {
    try {
      const response = await api.post('/fuel', fuelData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update fuel record
export const updateFuelRecord = createAsyncThunk(
  'fuel/update',
  async ({ id, fuelData }, thunkAPI) => {
    try {
      const response = await api.put(`/fuel/${id}`, fuelData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete fuel record
export const deleteFuelRecord = createAsyncThunk(
  'fuel/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/fuel/${id}`);
      return id;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get fuel consumption report
export const getFuelConsumptionReport = createAsyncThunk(
  'fuel/getConsumptionReport',
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/fuel/reports/consumption?${params}`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fuelSlice = createSlice({
  name: 'fuel',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.fuelRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all
      .addCase(getFuelRecords.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFuelRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fuelRecords = action.payload;
      })
      .addCase(getFuelRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get one
      .addCase(getFuelRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFuelRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fuelRecord = action.payload;
      })
      .addCase(getFuelRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create
      .addCase(createFuelRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFuelRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.fuelRecords.unshift(action.payload);
      })
      .addCase(createFuelRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateFuelRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFuelRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.fuelRecords = state.fuelRecords.map((record) =>
          record._id === action.payload._id ? action.payload : record
        );
      })
      .addCase(updateFuelRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteFuelRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFuelRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.fuelRecords = state.fuelRecords.filter(
          (record) => record._id !== action.payload
        );
      })
      .addCase(deleteFuelRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get consumption report
      .addCase(getFuelConsumptionReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFuelConsumptionReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.consumptionReport = action.payload;
      })
      .addCase(getFuelConsumptionReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = fuelSlice.actions;
export default fuelSlice.reducer;
