import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import {authService} from "./authService"

// Define types
interface User {
  id: string
  shop_name?: string;
  role: string
  first_name?: string
  last_name?: string
  email: string
  access?: string
  refresh?: string
  token?: string
}

interface UserInfo {
  id: string
  role: string
  first_name?: string
  last_name?: string
  email: string
  name?: string
}

interface AuthState {
  user: User | null
  userInfo: UserInfo | null
  isError: boolean
  isSuccess: boolean
  isLoading: boolean
  message: string
  token: string
}

interface RegisterData {
  shop_name?: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  re_password: string;
}

interface LoginData {
  email: string
  password: string
}

interface ActivateData {
  uid: string
  token: string
}

interface ResetPasswordData {
  email: string
}

interface ResetPasswordConfirmData {
  uid: string
  token: string
  new_password: string
  re_new_password: string
}

// Get user from localStorage
const userFromStorage = localStorage.getItem("user")
const user = userFromStorage ? JSON.parse(userFromStorage) : null

// Initial state
const initialState: AuthState = {
  user: user,
  userInfo: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  token: ""
}

// Register user
export const register = createAsyncThunk<User, RegisterData, { rejectValue: string }>(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData)
    } catch (error: any) {
      const message = (error.response?.data?.message) ||
        error.message || 
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Login user
export const login = createAsyncThunk<User, LoginData, { rejectValue: string }>(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData)
    } catch (error: any) {
      const message = (error.response?.data?.message) ||
        error.message || 
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Logout user
export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    authService.logout()
  }
)

// Activate account
export const activate = createAsyncThunk<User, ActivateData, { rejectValue: string }>(
  "auth/activate",
  async (userData, thunkAPI) => {
    try {
      return await authService.activate(userData)
    } catch (error: any) {
      const message = (error.response?.data?.message) ||
        error.message || 
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Reset password
export const resetPassword = createAsyncThunk<void, ResetPasswordData, { rejectValue: string }>(
  "auth/resetPassword",
  async (userData, thunkAPI) => {
    try {
      return await authService.resetPassword(userData)
    } catch (error: any) {
      const message = (error.response?.data?.message) ||
        error.message || 
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Reset password confirm
export const resetPasswordConfirm = createAsyncThunk<void, ResetPasswordConfirmData, { rejectValue: string }>(
  "auth/resetPasswordConfirm",
  async (userData, thunkAPI) => {
    try {
      return await authService.resetPasswordConfirm(userData)
    } catch (error: any) {
      const message = (error.response?.data?.message) ||
        error.message || 
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get user info
export const getUserInfo = createAsyncThunk<UserInfo, void, { rejectValue: string, state: { auth: AuthState } }>(
  "auth/getUserInfo",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState()
      const accessToken = state.auth.user?.access || state.auth.token
      
      if (!accessToken) {
        return thunkAPI.rejectWithValue('No access token available')
      }
      
      return await authService.getUserInfo(accessToken)
    } catch (error: any) {
      const message = (error.response?.data?.detail || 
        error.response?.data?.message) ||
        error.message || 
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ""
    },
    clearAuth: (state) => {
      state.user = null
      state.token = ""
      state.userInfo = null
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ""
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = action.payload as string
        state.user = null
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
        state.token = action.payload.access || action.payload.token || ""
        localStorage.setItem("user", JSON.stringify(action.payload))
        if (action.payload.token) {
          localStorage.setItem("token", JSON.stringify(action.payload.token))
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = action.payload as string
        state.user = null
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = ""
        state.userInfo = null
        state.isLoading = false
        state.isError = false
        state.isSuccess = false
        state.message = ""
      })
      
      // Activate
      .addCase(activate.pending, (state) => {
        state.isLoading = true
      })
      .addCase(activate.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
      })
      .addCase(activate.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = action.payload as string
        state.user = null
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = action.payload as string
      })
      
      // Reset Password Confirm
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.isLoading = true
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = action.payload as string
      })
      
      // Get User Info
      .addCase(getUserInfo.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUserInfo.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.isLoading = false
        state.isSuccess = true
        state.userInfo = action.payload
      })
      .addCase(getUserInfo.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
      })
  }
})

export const { reset, clearAuth } = authSlice.actions
export default authSlice.reducer
