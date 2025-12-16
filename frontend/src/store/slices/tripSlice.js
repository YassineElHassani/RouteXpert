import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  trips: [],
  trip: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all trips (or my trips if driver)
export const getTrips = createAsyncThunk(
  'trips/getAll',
  async (filters = {}, thunkAPI) => {
    try {
      // Convert filters object to query string
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/trips?${params}`);
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

// Get single trip
export const getTrip = createAsyncThunk(
  'trips/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/trips/${id}`);
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

// Create new trip
export const createTrip = createAsyncThunk(
  'trips/create',
  async (tripData, thunkAPI) => {
    try {
      const response = await api.post('/trips', tripData);
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

// Update trip
export const updateTrip = createAsyncThunk(
  'trips/update',
  async ({ id, tripData }, thunkAPI) => {
    try {
      const response = await api.put(`/trips/${id}`, tripData);
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

// Delete trip
export const deleteTrip = createAsyncThunk(
  'trips/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/trips/${id}`);
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

// Download PDF
export const downloadTripPDF = createAsyncThunk(
  'trips/downloadPDF',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/trips/${id}/pdf`, {
        responseType: 'blob', // Important for files
      });
      
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
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

// Update trip status
export const updateTripStatus = createAsyncThunk(
  'trips/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await api.patch(`/trips/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update trip mileage
export const updateTripMileage = createAsyncThunk(
  'trips/updateMileage',
  async ({ id, mileageData }, thunkAPI) => {
    try {
      const response = await api.patch(`/trips/${id}/mileage`, mileageData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my trips (for drivers)
export const getMyTrips = createAsyncThunk(
  'trips/getMyTrips',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/trips/my-trips');
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get trip fuel records
export const getTripFuel = createAsyncThunk(
  'trips/getFuel',
  async (tripId, thunkAPI) => {
    try {
      const response = await api.get(`/trips/${tripId}/fuel`);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.trip = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrips.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload;
      })
      .addCase(getTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trip = action.payload;
      })
      .addCase(getTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips.unshift(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = state.trips.map((trip) =>
          trip._id === action.payload._id ? action.payload : trip
        );
        state.trip = action.payload;
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = state.trips.filter(
          (trip) => trip._id !== action.payload
        );
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update status
      .addCase(updateTripStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTripStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = state.trips.map((trip) =>
          trip._id === action.payload._id ? action.payload : trip
        );
        if (state.trip?._id === action.payload._id) {
          state.trip = action.payload;
        }
      })
      .addCase(updateTripStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update mileage
      .addCase(updateTripMileage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTripMileage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = state.trips.map((trip) =>
          trip._id === action.payload._id ? action.payload : trip
        );
        if (state.trip?._id === action.payload._id) {
          state.trip = action.payload;
        }
      })
      .addCase(updateTripMileage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get my trips
      .addCase(getMyTrips.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = action.payload;
      })
      .addCase(getMyTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = tripSlice.actions;
export default tripSlice.reducer;
