import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  trucks: [],
  truck: null,
  truckTires: [],
  truckFuel: [],
  truckMaintenance: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all trucks
export const getTrucks = createAsyncThunk(
  'trucks/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/trucks');
      return response.data.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new truck
export const createTruck = createAsyncThunk(
  'trucks/create',
  async (truckData, thunkAPI) => {
    try {
      const response = await api.post('/trucks', truckData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update truck
export const updateTruck = createAsyncThunk(
  'trucks/update',
  async ({ id, truckData }, thunkAPI) => {
    try {
      const response = await api.put(`/trucks/${id}`, truckData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete truck
export const deleteTruck = createAsyncThunk(
  'trucks/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/trucks/${id}`);
      return id;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update truck mileage
export const updateTruckMileage = createAsyncThunk(
  'trucks/updateMileage',
  async ({ id, mileage }, thunkAPI) => {
    try {
      const response = await api.patch(`/trucks/${id}/mileage`, { mileage });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get truck tires
export const getTruckTires = createAsyncThunk(
  'trucks/getTires',
  async (truckId, thunkAPI) => {
    try {
      const response = await api.get(`/trucks/${truckId}/tires`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get truck fuel records
export const getTruckFuel = createAsyncThunk(
  'trucks/getFuel',
  async (truckId, thunkAPI) => {
    try {
      const response = await api.get(`/trucks/${truckId}/fuel`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get truck maintenance
export const getTruckMaintenance = createAsyncThunk(
  'trucks/getMaintenance',
  async (truckId, thunkAPI) => {
    try {
      const response = await api.get(`/trucks/${truckId}/maintenance`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const truckSlice = createSlice({
  name: 'truck',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearTruckDetails: (state) => {
      state.truck = null;
      state.truckTires = [];
      state.truckFuel = [];
      state.truckMaintenance = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrucks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrucks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trucks = action.payload;
      })
      .addCase(getTrucks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTruck.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTruck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trucks.push(action.payload);
      })
      .addCase(createTruck.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTruck.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTruck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trucks = state.trucks.map((truck) =>
          truck._id === action.payload._id ? action.payload : truck
        );
      })
      .addCase(updateTruck.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteTruck.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTruck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trucks = state.trucks.filter(
          (truck) => truck._id !== action.payload
        );
      })
      .addCase(deleteTruck.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update mileage
      .addCase(updateTruckMileage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTruckMileage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trucks = state.trucks.map((truck) =>
          truck._id === action.payload._id ? action.payload : truck
        );
      })
      .addCase(updateTruckMileage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get truck tires
      .addCase(getTruckTires.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTruckTires.fulfilled, (state, action) => {
        state.isLoading = false;
        state.truckTires = action.payload;
      })
      .addCase(getTruckTires.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get truck fuel
      .addCase(getTruckFuel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTruckFuel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.truckFuel = action.payload;
      })
      .addCase(getTruckFuel.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get truck maintenance
      .addCase(getTruckMaintenance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTruckMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.truckMaintenance = action.payload;
      })
      .addCase(getTruckMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearTruckDetails } = truckSlice.actions;
export default truckSlice.reducer;
