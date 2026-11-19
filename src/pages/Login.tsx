import { useState } from 'react';
import { axiosAuth } from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axiosAuth.post('auth/login/', formData);
      const data = response.data;

      const accessToken = data.access || data.token || data.tokens?.access;
      const refreshToken = data.refresh || data.tokens?.refresh;

      if (!accessToken) {
        setErrorMessage('Login succeeded, but no access token was returned by the server.');
        return;
      }

      const isStaff = Boolean(data.is_staff || data.is_admin);

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('username', data.username || formData.username);
      localStorage.setItem('is_staff', String(isStaff));
      if (isStaff) {
        localStorage.setItem('is_admin', 'true');
      } else {
        localStorage.removeItem('is_admin');
      }

      window.dispatchEvent(new Event('auth-change'));

      if (isStaff) {
        navigate('/admin/users', { replace: true });
      } else {
        navigate('/search', { replace: true });
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.detail) {
          setErrorMessage(data.detail);
        } else if (data.error) {
          setErrorMessage(data.error);
        } else if (data.non_field_errors?.length) {
          setErrorMessage(data.non_field_errors[0]);
        } else if (data.username?.length) {
          setErrorMessage(`Username: ${data.username[0]}`);
        } else if (data.password?.length) {
          setErrorMessage(`Password: ${data.password[0]}`);
        } else {
          setErrorMessage('Invalid username or password. Please try again.');
        }
      } else {
        setErrorMessage('Unable to connect to the server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}