'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSetupPage() {
  const [setupToken, setSetupToken] = useState('');
  const [email, setEmail] = useState('contato@lkdigital.org');
  const [password, setPassword] = useState('K5h3s2#195962');
  const [name, setName] = useState('Admin LK Digital');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupToken, email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar admin');
        setLoading(false);
        return;
      }

      setSuccess('✅ Usuário admin criado com sucesso! Você pode fazer login agora.');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (err) {
      setError('Erro ao conectar. Tente novamente.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Admin</h1>
          <p className="text-gray-600">Configure o primeiro usuário administrador</p>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Atenção:</strong> Esta página deve ser usada apenas uma vez. 
            Você precisa do ADMIN_SETUP_TOKEN das variáveis de ambiente.
          </p>
        </div>

        <form onSubmit={handleSetup}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Token
            </label>
            <input
              type="password"
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Cole o ADMIN_SETUP_TOKEN aqui"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Este token está definido na variável de ambiente ADMIN_SETUP_TOKEN
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/admin"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Voltar para Login
          </a>
        </div>
      </div>
    </div>
  );
}
