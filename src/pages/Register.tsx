import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosAuth } from '../api/axios';
import { FormInput } from '../components/FormFields';
import { useFormFields } from '../hooks/useFormFields';

export default function Register() {
  const navigate = useNavigate();
  const { values, handleChange } = useFormFields({
    username: '',
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await axiosAuth.post('auth/register/', values);
      navigate('/login', {
        state: {
          message:
            'Registration successful. Your account is pending admin approval.',
        },
      });
    } catch (error: any) {
      const data = error.response?.data;
      setErrorMsg(
        data?.username?.[0] ||
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.detail ||
          'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md space-y-5">
        <h2 className="text-3xl font-bold text-center">Create Account</h2>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <FormInput
            label="Username"
            name="username"
            type="text"
            required
            value={values.username}
            onChange={handleChange}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            required
            value={values.email}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}