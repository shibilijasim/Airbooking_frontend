import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosAuth } from '../api/axios';
import { FormInput } from '../components/FormFields';
import { useFormFields } from '../hooks/useFormFields';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const flashMessage = (location.state as { message?: string } | null)?.message || '';

  const { values, handleChange } = useFormFields({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axiosAuth.post('auth/login/', values);
      const data = response.data;

      const accessToken = data.access || data.token || data.tokens?.access;
      const refreshToken = data.refresh || data.tokens?.refresh;

      if (!accessToken) {
        setErrorMessage(
          'Login succeeded, but no access token was returned by the server.'
        );
        return;
      }

      const isStaff = Boolean(data.is_staff || data.is_admin);

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('username', data.username || values.username);
      localStorage.setItem('is_staff', String(isStaff));
      if (isStaff) {
        localStorage.setItem('is_admin', 'true');
      } else {
        localStorage.removeItem('is_admin');
      }

      window.dispatchEvent(new Event('auth-change'));
      navigate(isStaff ? '/admin/users' : '/search', { replace: true });
    } catch (error: any) {
      setShowForgotPassword(true);
      if (!resetIdentifier && values.username.trim()) {
        setResetIdentifier(values.username.trim());
      }

      if (error.response?.data) {
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
        setErrorMessage(
          'Unable to connect to the server. Please check your connection.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = resetIdentifier.trim() || values.username.trim();
    if (!target) {
      setResetStatus('Please enter your email or username.');
      return;
    }

    setResetSubmitting(true);
    setResetStatus('');

    try {
      const res = await axiosAuth.post('auth/password-reset/', {
        email: target.includes('@') ? target : undefined,
        username: !target.includes('@') ? target : undefined,
        identifier: target,
      });
      setResetStatus(
        res.data?.message ||
          `Password reset instructions sent for "${target}".`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        setResetStatus(
          `Password reset request recorded for "${target}". Contact an administrator if self-service reset is not enabled.`
        );
      } else {
        setResetStatus(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            'Could not process password reset request right now.'
        );
      }
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md space-y-5">
        <h2 className="text-3xl font-bold text-center">Welcome Back</h2>

        {flashMessage && !errorMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
            {flashMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <FormInput
            label="Username"
            name="username"
            type="text"
            required
            value={values.username}
            onChange={handleChange}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            required
            value={values.password}
            onChange={handleChange}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword((prev) => !prev);
                if (!resetIdentifier && values.username.trim()) {
                  setResetIdentifier(values.username.trim());
                }
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {showForgotPassword && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-800">
              Reset Password
            </p>
            <p className="text-xs text-gray-600">
              Enter your registered email or username to request a password reset.
            </p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-2.5">
              <FormInput
                label="Email or Username"
                name="resetIdentifier"
                type="text"
                required
                compact
                placeholder="Email or username"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
              />
              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {resetSubmitting ? 'Sending Request...' : 'Send Reset Request'}
              </button>
            </form>
            {resetStatus && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg">
                {resetStatus}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}