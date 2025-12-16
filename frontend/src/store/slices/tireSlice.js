import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  tires: [],
  tiresNeedingReplacement: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all tires
export const getTires = createAsyncThunk(
  'tires/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/tires');
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

// Create new tire
export const createTire = createAsyncThunk(
  'tires/create',
  async (tireData, thunkAPI) => {
    try {
      const response = await api.post('/tires', tireData);
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

// Update tire
export const updateTire = createAsyncThunk(
  'tires/update',
  async ({ id, tireData }, thunkAPI) => {
    try {
      const response = await api.put(`/tires/${id}`, tireData);
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

// Delete tire
export const deleteTire = createAsyncThunk(
  'tires/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/tires/${id}`);
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

// Update tire condition
export const updateTireCondition = createAsyncThunk(
  'tires/updateCondition',
  async ({ id, condition }, thunkAPI) => {
    try {
      const response = await api.patch(`/tires/${id}/condition`, { condition });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get tires needing replacement
export const getTiresNeedingReplacement = createAsyncThunk(
  'tires/getNeedingReplacement',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/tires/alerts/replacement');
      return response.data.data;
    } catch (error) {
      const message =
        (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const tireSlice = createSlice({
  name: 'tire',
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
      .addCase(getTires.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTires.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tires = action.payload;
      })
      .addCase(getTires.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTire.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tires.push(action.payload);
      })
      .addCase(createTire.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTire.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tires = state.tires.map((tire) =>
          tire._id === action.payload._id ? action.payload : tire
        );
      })
      .addCase(updateTire.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteTire.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tires = state.tires.filter(
          (tire) => tire._id !== action.payload
        );
      })
      .addCase(deleteTire.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update condition
      .addCase(updateTireCondition.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTireCondition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tires = state.tires.map((tire) =>
          tire._id === action.payload._id ? action.payload : tire
        );
      })
      .addCase(updateTireCondition.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get tires needing replacement
      .addCase(getTiresNeedingReplacement.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTiresNeedingReplacement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tiresNeedingReplacement = action.payload;
      })
      .addCase(getTiresNeedingReplacement.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = tireSlice.actions;
export default tireSlice.reducer;
