import axios from "axios";

const API_BASE_URL=import.meta.env.VITE_API_BASE_URL
const REGISTER_URL=`${API_BASE_URL}/api/auth/users/`
const LOGIN_URL=`${API_BASE_URL}/api/auth/jwt/create/`
const ACTIVATE_URL=`${API_BASE_URL}/api/auth/users/activation/`
const RESET_PASSWORD_URL=`${API_BASE_URL}/api/auth/users/reset_password/`
const RESET_PASSWORD_CONFIRM_URL=`${API_BASE_URL}/api/auth/users/reset_password_confirm/`
const GET_USER_INFO=`${API_BASE_URL}/api/auth/users/me/`
const TOKEN=`${API_BASE_URL}/api/token/`
const REFRESH_TOKEN=`${API_BASE_URL}/api/token/refresh/`


interface RegisterShopDataProp {
  name: string
  email: string
  password: string
}
interface ShopDataProp {
  id: string
  name: string
  email: string
  password: string
}
interface AccessTokenProp {
  token: string
  refresh: string;
}
// Create axios instance with interceptor for adding token
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const persistedState = localStorage.getItem("persist:auth");
    if (persistedState) {
      const authState = JSON.parse(persistedState);
      const token = authState.token ? JSON.parse(authState.token) : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register user
const register = async (shopData: RegisterShopDataProp) => {
  const config = {
        headers: {
            "Content-type": "application/json"
        }
    }
  const response = await api.post(REGISTER_URL, shopData, config);

  return response.data
};

// Login user
const login = async (shopData: ShopDataProp) => {
  const config = {
        headers: {
            "Content-type": "application/json"
        }
    }
  const response = await api.post(LOGIN_URL, shopData, config);

  return response.data
};

// Logout user
const logout = () => {
  return localStorage.removeItem("user")
};
const activate = async (shopData: ShopDataProp) => {
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    const response = await axios.post(ACTIVATE_URL, shopData, config)

    return response.data
}
const resetPassword = async (shopData: ShopDataProp) => {
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    const response = await axios.post(RESET_PASSWORD_URL, shopData, config)

    return response.data
}
const resetPasswordConfirm = async (shopData: ShopDataProp) => {
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    const response = await axios.post(RESET_PASSWORD_CONFIRM_URL, shopData, config)

    return response.data
}

// Get User Info

const getUserInfo = async (accessToken: AccessTokenProp) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    }

    const response = await axios.get(GET_USER_INFO, config)

    return response.data
}

// Create axios instance for authenticated requests
export const createAuthenticatedApi = (token: string) => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Example: Get authenticated data
export const getProtectedData = async (token: string) => {
  const authApi = createAuthenticatedApi(token);
  const response = await authApi.get("protected-endpoint/");
  return response.data;
};

export const authService = {
  register,
  login,
  logout,
  activate,
  resetPassword,
  resetPasswordConfirm,
  getUserInfo,
};