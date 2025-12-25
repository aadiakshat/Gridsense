import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from './darkmode';

export default function AuthInterface() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Invalid credentials');
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      navigate('/dashboard');
    } catch {
      setError('Server unreachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Dark mode */}
      <div className="fixed top-5 right-5 z-50">
        <DarkModeToggle />
      </div>
      
      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-xl shadow-sm px-7 py-8">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="mx-auto w-11 h-11 rounded-lg
              bg-indigo-600
              flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>

            <h1 className="mt-4 text-xl font-semibold">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign in to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-sm
              text-red-600 dark:text-red-400
              bg-red-50 dark:bg-red-950/30
              border border-red-200 dark:border-red-900
              rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                  w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md
                    bg-white dark:bg-slate-950
                    border border-slate-300 dark:border-slate-700
                    text-sm
                    focus:outline-none focus:ring-1
                    focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                  w-4.5 h-4.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-md
                    bg-white dark:bg-slate-950
                    border border-slate-300 dark:border-slate-700
                    text-sm
                    focus:outline-none focus:ring-1
                    focus:ring-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                    text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2 py-2 rounded-md
                bg-indigo-600 hover:bg-indigo-700
                text-sm font-medium text-white
                transition disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
