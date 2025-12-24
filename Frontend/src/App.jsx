import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from './darkmode';

export default function AuthInterface() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
      setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
      localStorage.setItem('access_token', data.access_token);

      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } else {
        setError(data.detail || 'Something went wrong');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
                    bg-gray-50 dark:bg-gray-900
                    text-gray-900 dark:text-gray-100">

      {/* 🌙 Dark mode toggle */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-slate-900 dark:bg-slate-700
                          rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isLogin
              ? 'Welcome back! Please enter your details.'
              : 'Get started with your free account.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        rounded-xl shadow-sm p-8">

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition
                ${isLogin
                  ? 'bg-white dark:bg-gray-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'}`}
            >
              Sign In
            </button>

            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition
                ${!isLogin
                  ? 'bg-white dark:bg-gray-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                                text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none
                            bg-white dark:bg-gray-900
                            border border-gray-300 dark:border-gray-700
                            text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                                text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg outline-none
                            bg-white dark:bg-gray-900
                            border border-gray-300 dark:border-gray-700
                            text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                            text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium
                        bg-slate-900 dark:bg-slate-700
                        text-white hover:opacity-90
                        transition disabled:opacity-50"
            >
              {loading ? 'Loading…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
