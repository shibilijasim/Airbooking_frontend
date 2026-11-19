import axios from 'axios';

const baseURL = 'http://localhost:8000/api/';

export const axiosAuth = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPrivate = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Access Token
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token ONLY on 401 Unauthorized
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;

    if (error?.response?.status === 401 && !prevRequest?._retry) {
      prevRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axiosAuth.post('auth/token/refresh/', {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);

          prevRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          return axiosPrivate(prevRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.dispatchEvent(new Event('auth-change'));
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.clear();
        window.dispatchEvent(new Event('auth-change'));
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);