import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Feather, ShieldAlert, Users } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('volunteer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      return setError('Please fill in all details.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    const result = await signup(email, password, role);
    setLoading(false);

    if (result.success) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/register-profile');
      }
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
        {/* Branding header */}
        <div className="text-center space-y-2 mb-6">
          <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-3 rounded-2xl text-white shadow-md shadow-orange-100 inline-block">
            <Feather className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Create Account</h2>
          <p className="text-xs text-slate-400">Join NayePankh Foundation as a volunteer or admin</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1">
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

          {/* Role selection */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">Account Type</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Users className="h-4 w-4" />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
              >
                <option value="volunteer">Volunteer (Profile registration required)</option>
                <option value="admin">Admin (Immediate system access)</option>
              </select>
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
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
                placeholder="Minimum 6 characters"
                className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Footer redirects */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-600 font-bold hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}
