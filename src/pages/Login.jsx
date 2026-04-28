import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, LogIn } from 'lucide-react';


/* ── Componente principal ──────────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch {
      setError('E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 sm:px-10 relative overflow-hidden"
      style={{
        background: '#020617',
      }}
    >

      {/* Glow central suave */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
      />

      {/* ── Card ── */}
      <div className="relative w-full max-w-[420px] z-10 animate-scale-in">
        <div
          className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          {/* Header verde */}
          <div
            className="px-8 pt-14 pb-12 flex flex-col items-center relative overflow-hidden text-center"
            style={{
              background: 'linear-gradient(155deg, #0f172a 0%, #1e293b 100%)',
            }}
          >
            {/* Brilho de canto no header */}
            <div
              className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 65%)',
                transform: 'translate(30%, -30%)',
              }}
            />

            {/* Logo Textual Nexus */}
            <div className="relative z-10 flex flex-col items-center mt-4">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-[#0f172a]/10 flex items-center justify-center border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">NEXUS</h1>
            </div>

            <div
              className="mt-6 px-4 py-1.5 rounded-full relative z-10"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Sistema de Gestão Interno</p>
            </div>
          </div>

          {/* Formulário */}
          <div className="px-8 py-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Bem-vindo de volta 👋</h2>
              <p className="text-sm text-slate-400 mt-1">Faça login para acessar o sistema</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar no Sistema
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-5">
          Nexus © {new Date().getFullYear()} — Acesso exclusivo para colaboradores
        </p>
      </div>
    </div>
  );
}
