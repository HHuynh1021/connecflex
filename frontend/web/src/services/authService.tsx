import axios from "axios";
import api from "./api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const REGISTER_URL = `${API_BASE_URL}/auth/users/`
const LOGIN_URL = `${API_BASE_URL}/auth/jwt/create/`
const ACTIVATE_URL = `${API_BASE_URL}/auth/users/activation/`
const RESET_PASSWORD_URL = `${API_BASE_URL}/auth/users/reset_password/`
const RESET_PASSWORD_CONFIRM_URL = `${API_BASE_URL}/auth/users/reset_password_confirm/`
const GET_USER_INFO = `${API_BASE_URL}/auth/users/me/`


interface RegisterShopDataProp {
  shop_name: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  re_password: string
}
interface ShopDataProp {
  id: string
  shop_name: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;

}
interface AccessTokenProp {
  token: string
  refresh: string;
}

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

const getUserInfo = async (accessToken:string) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    }

    const response = await axios.get(GET_USER_INFO, config)

    return response.data
}

export const authService = {
  register,
  login,
  logout,
  activate,
  resetPassword,
  resetPasswordConfirm,
  getUserInfo,
};