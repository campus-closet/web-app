import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Admin Login</h1>
        <p className="text-center text-white/60 mb-8">Enter your credentials to access the admin panel</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input w-full"
              placeholder="admin@campuscloset.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="glass rounded-xl p-3 bg-red-500/20 border-red-500/50">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <button type="submit" className="glass-button w-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
