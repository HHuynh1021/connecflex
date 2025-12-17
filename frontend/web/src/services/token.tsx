import { useState, useEffect } from 'react';
import axios from 'axios';

interface UserProp {
  access: string;
  refresh: string;
}

interface TokenState {
  accessToken: string;
  isLoading: boolean;
  error: string | null;
}

const useAccessToken = (user: UserProp) => {
  const [state, setState] = useState<TokenState>({
    accessToken: user?.access || "", // Start with existing access token
    isLoading: false,
    error: null
  });

  const refreshAccessToken = async () => {
    if (!user?.refresh) {
      setState(prev => ({ ...prev, error: "No refresh token available" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const refreshUrl = `${import.meta.env.VITE_BACKEND_URL}/api/token/refresh/`;
    
    try {
      const res = await axios.post(refreshUrl, { refresh: user.refresh });
      setState({
        accessToken: res.data.access, // Extract the 'access' field
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      setState({
        accessToken: "",
        isLoading: false,
        error: error.response?.data?.detail || error.message || "Failed to refresh token"
      });
    }
  };

  // Initialize with user's access token when user changes
  useEffect(() => {
    if (user?.access) {
      setState(prev => ({ ...prev, accessToken: user.access }));
    }
  }, [user?.access]);

  // Only refresh if access token is missing but refresh token exists
  useEffect(() => {
    if (!state.accessToken && user?.refresh && !state.isLoading && !state.error) {
      refreshAccessToken();
    }
  }, [state.accessToken, user?.refresh, state.isLoading, state.error]);

  return state;
};

export default useAccessToken;