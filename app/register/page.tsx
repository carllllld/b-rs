'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Något gick fel');
        setLoading(false);
        return;
      }

      router.push('/login');
    } catch (error) {
      setError('Något gick fel');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">MATCHKVÄLL</h1>
          <p className="text-gray-400">Skapa konto</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all"
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Användarnamn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Skapar konto...' : 'Skapa konto'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Har redan konto?{' '}
          <Link href="/login" className="text-white hover:underline">
            Logga in
          </Link>
        </p>
      </div>
    </div>
  );
}
