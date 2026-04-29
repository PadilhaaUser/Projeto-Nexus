import { useState } from 'react';
import { LogOut, Menu, Bell, ChevronDown, Package, FileText, AlertCircle, Clock, Layers } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotificacoes } from '../hooks/useNotificacoes';
import { useNavigate, useLocation } from 'react-router-dom';

const routeNames = {
  '/':           { title: 'Painel de Controle',    subtitle: 'Visão geral e métricas' },
  '/estoque':    { title: 'Gestão de Estoque',     subtitle: 'Controle de produtos e insumos' },
  '/clientes':   { title: 'Central de Clientes',   subtitle: 'Gestão de contatos e histórico' },
  '/orcamentos': { title: 'Orçamentos & Vendas',  subtitle: 'Propostas e acompanhamento' },
  '/relatorios': { title: 'Relatórios Mensais',    subtitle: 'Análise de performance' },
  '/historico':  { title: 'Log de Atividades',    subtitle: 'Audit log do sistema' },
};

const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-primary to-accent',
];

const notifIcons = {
  warning: { icon: Package,     bg: 'bg-amber-500/10',  color: 'text-amber-400', dot: 'bg-amber-400' },
  info:    { icon: FileText,    bg: 'bg-blue-500/10',   color: 'text-blue-400',  dot: 'bg-blue-400'  },
  error:   { icon: AlertCircle, bg: 'bg-rose-500/10',   color: 'text-rose-400',  dot: 'bg-rose-400'  },
};

export default function Header({ toggleSidebar, toggleMobile }) {
  const { logout, currentUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const route     = routeNames[location.pathname] || { title: 'Nexus', subtitle: 'Sistema de Gestão' };
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const { notificacoes, loading: loadingNotifs, clearNotificacoes } = useNotificacoes();

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (e) { console.error('Failed to log out', e); }
  };

  const email    = currentUser?.email || 'admin@nexus.com.br';
  const username = email.split('@')[0];
  const initials = username.slice(0, 2).toUpperCase();
  const colorIdx = username.charCodeAt(0) % avatarColors.length;

  const handleNotifClick = (route) => {
    setShowNotifs(false);
    navigate(route);
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10"
      style={{
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Esquerda: botão mobile + título */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight tracking-tight">
              {route.title}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">{route.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Direita: notificação + usuário */}
      <div className="flex items-center gap-1.5">

        {/* Notificação */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowMenu(false); }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-[#1e293b] transition-all duration-200"
            title="Notificações"
          >
            <Bell className="h-4.5 w-4.5" />
            {notificacoes.length > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ background: '#ef4444', minWidth: '16px' }}
              >
                {notificacoes.length > 9 ? '9+' : notificacoes.length}
              </span>
            )}
          </button>

          {/* Painel de Notificações */}
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifs(false)} />
              <div
                className="absolute right-0 top-full mt-1.5 w-80 z-20 rounded-2xl shadow-xl overflow-hidden animate-scale-in"
                style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Notificações</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{notificacoes.length} ativa{notificacoes.length !== 1 ? 's' : ''}</span>
                    {notificacoes.length > 0 && (
                      <button onClick={clearNotificacoes} className="text-xs text-accent hover:text-accent-light font-medium transition-colors">
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {loadingNotifs ? (
                  <div className="p-6 flex justify-center">
                    <svg className="animate-spin h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                ) : notificacoes.length === 0 ? (
                  <div className="px-4 py-8 flex flex-col items-center text-slate-500">
                    <Bell className="h-8 w-8 opacity-20 mb-2" />
                    <p className="text-sm font-medium text-slate-400">Tudo em ordem!</p>
                    <p className="text-xs mt-0.5">Nenhuma notificação no momento</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notificacoes.map((notif) => {
                      const cfg = notifIcons[notif.type] || notifIcons.info;
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif.route)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-[#1e293b]/50 transition-colors text-left"
                        >
                          <div className={`p-2 rounded-xl ${cfg.bg} flex-shrink-0 mt-0.5`}>
                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="px-4 py-2.5 border-t border-[#1e293b] bg-[#1e293b]/50">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Atualiza automaticamente a cada 5 min
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#334155] mx-1" />

        {/* Usuário */}
        <div className="relative">
          <button
            onClick={() => { setShowMenu(!showMenu); setShowNotifs(false); }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#1e293b] transition-all duration-200"
          >
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}
            >
              {initials}
            </div>

            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-semibold text-slate-200 leading-tight capitalize">{username}</span>
              <span className="text-xs text-slate-500 leading-tight">{email}</span>
            </div>

            <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-full mt-1.5 w-52 z-20 rounded-2xl shadow-xl overflow-hidden animate-scale-in"
                style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="px-4 py-3 border-b border-[#1e293b]">
                  <p className="text-xs font-semibold text-white capitalize">{username}</p>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair do sistema
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
