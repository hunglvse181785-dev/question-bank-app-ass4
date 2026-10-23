import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient.js';

export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/quizzes');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách quiz.',
      );
    }
  },
);

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchById',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải quiz.',
      );
    }
  },
);

export const submitQuizAttempt = createAsyncThunk(
  'quizzes/submit',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
        answers,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể nộp bài.',
      );
    }
  },
);

const quizSlice = createSlice({
  name: 'quizzes',
  initialState: {
    list: [],
    current: null,
    result: null,
    listStatus: 'idle',
    detailStatus: 'idle',
    submitStatus: 'idle',
    error: null,
  },
  reducers: {
    clearQuizResult(state) {
      state.result = null;
      state.submitStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.detailStatus = 'loading';
        state.current = null;
        state.result = null;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(submitQuizAttempt.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.result = action.payload;
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearQuizResult } = quizSlice.actions;
export default quizSlice.reducer;