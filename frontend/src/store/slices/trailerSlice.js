import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  trailers: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all trailers
export const getTrailers = createAsyncThunk(
  'trailers/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/trailers');
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

// Create new trailer
export const createTrailer = createAsyncThunk(
  'trailers/create',
  async (trailerData, thunkAPI) => {
    try {
      const response = await api.post('/trailers', trailerData);
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

// Update trailer
export const updateTrailer = createAsyncThunk(
  'trailers/update',
  async ({ id, trailerData }, thunkAPI) => {
    try {
      const response = await api.put(`/trailers/${id}`, trailerData);
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

// Delete trailer
export const deleteTrailer = createAsyncThunk(
  'trailers/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/trailers/${id}`);
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

export const trailerSlice = createSlice({
  name: 'trailer',
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
      .addCase(getTrailers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrailers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trailers = action.payload;
      })
      .addCase(getTrailers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTrailer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTrailer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trailers.push(action.payload);
      })
      .addCase(createTrailer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTrailer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTrailer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trailers = state.trailers.map((trailer) =>
          trailer._id === action.payload._id ? action.payload : trailer
        );
      })
      .addCase(updateTrailer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteTrailer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTrailer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trailers = state.trailers.filter(
          (trailer) => trailer._id !== action.payload
        );
      })
      .addCase(deleteTrailer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = trailerSlice.actions;
export default trailerSlice.reducer;
