'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple hardcoded authentication
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Use admin/admin to login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-sm w-full space-y-8 transition-all duration-300 transform hover:scale-105">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            FAQ Admin Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage FAQs
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-2 bg-gray-100 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-2 bg-gray-100 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 bg-opacity-50 p-4 transition-all duration-300">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="rounded-lg bg-blue-100 bg-opacity-50 p-4 transition-all duration-300">
            <div className="text-sm text-blue-800">
              <strong>Demo Credentials:</strong><br />
              Username: admin<br />
              Password: admin
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}