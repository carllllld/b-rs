'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Fel email eller lösenord');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">MATCHKVÄLL</h1>
          <p className="text-gray-400">Logga in för att rapportera och kommentera</p>
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
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all"
              required
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
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Inget konto?{' '}
          <Link href="/register" className="text-white hover:underline">
            Registrera dig
          </Link>
        </p>
      </div>
    </div>
  );
}
