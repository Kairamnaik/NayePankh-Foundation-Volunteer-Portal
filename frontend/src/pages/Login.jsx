import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Feather, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Determine redirection pathway based on user role and profiles
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        if (!result.user.hasProfile) {
          navigate('/register-profile');
        } else {
          navigate('/dashboard');
        }
      }
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
        {/* Branding header */}
        <div className="text-center space-y-2 mb-8">
          <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-3 rounded-2xl text-white shadow-md shadow-orange-100 inline-block">
            <Feather className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to manage your volunteer activities</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        {/* Footer redirection links */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-orange-600 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
