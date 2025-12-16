import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  users: [],
  drivers: [],
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all users
export const getUsers = createAsyncThunk(
  'users/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/auth/users');
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

// Get all drivers (users with role 'driver')
export const getDrivers = createAsyncThunk(
  'users/getDrivers',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/auth/users');
      const drivers = response.data.data.filter(user => user.role === 'driver');
      return drivers;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new driver (register)
export const createDriver = createAsyncThunk(
  'users/createDriver',
  async (driverData, thunkAPI) => {
    try {
      const response = await api.post('/auth/register', {
        ...driverData,
        role: 'driver',
      });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update driver
export const updateDriver = createAsyncThunk(
  'users/updateDriver',
  async ({ id, driverData }, thunkAPI) => {
    try {
      const response = await api.put(`/auth/users/${id}`, driverData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete driver
export const deleteDriver = createAsyncThunk(
  'users/deleteDriver',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/auth/users/${id}`);
      return id;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get drivers
      .addCase(getDrivers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drivers = action.payload;
      })
      .addCase(getDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create driver
      .addCase(createDriver.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drivers.push(action.payload);
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update driver
      .addCase(updateDriver.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.drivers.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete driver
      .addCase(deleteDriver.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drivers = state.drivers.filter((d) => d._id !== action.payload);
      })
      .addCase(deleteDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = userSlice.actions;
export default userSlice.reducer;
