import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, FileText, BarChart3, X, Layers, Menu, ClipboardList, ChevronRight } from 'lucide-react';
import { useRole } from '../hooks/useRole';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard',  icon: LayoutDashboard, path: '/',           adminOnly: false },
  { name: 'Estoque',    icon: Package,          path: '/estoque',   adminOnly: true,
    sublinks: [
      { name: 'Todos', path: '/estoque' },
      { name: 'Equipamentos', path: '/estoque?tab=equipamentos' },
      { name: 'Suprimentos', path: '/estoque?tab=suprimentos' },
      { name: 'Serviços', path: '/estoque?tab=servicos' }
    ]
  },
  { name: 'Clientes',   icon: Users,            path: '/clientes',  adminOnly: false },
  { name: 'Orçamentos', icon: FileText,         path: '/orcamentos',adminOnly: false },
  { name: 'Relatórios', icon: BarChart3,        path: '/relatorios',adminOnly: true  },
  { name: 'Histórico',  icon: ClipboardList,    path: '/historico', adminOnly: true  },
];



export default function Sidebar({ isOpen, mobileOpen, toggleSidebar, closeMobile }) {
  const { isAdmin } = useRole();
  const location = useLocation();
  const navItems = ALL_NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-20 md:hidden transition-all duration-300 ${
          mobileOpen ? 'bg-gray-900/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out
          md:static md:inset-auto md:flex
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'w-64' : 'w-16'}
        `}
        style={{
          background: 'rgba(5, 3, 20, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)'
        }}
      >

        {/* Starry background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-80">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>

        {/* Textura sutil original */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

        {/* Wrapper z-10 para conteúdo */}
        <div className="relative z-10 flex flex-col h-full w-full">

        {/* Topo: logo + hambúrguer (apenas na sidebar) */}
        <div className={`relative flex flex-col border-b border-white/10 flex-shrink-0 transition-all duration-300 ${isOpen ? 'items-center pt-8 pb-6 px-6' : 'items-center pt-4 pb-4 px-2'}`}>
          {/* Fechar mobile */}
          <button onClick={closeMobile} className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-[#0f172a]/10 transition-colors">
            <X className="h-5 w-5" />
          </button>

          {/* Hambúrguer desktop */}
          <button
            onClick={toggleSidebar}
            className={`hidden md:flex items-center justify-center p-2 rounded-xl text-white/60 hover:text-white hover:bg-[#0f172a]/10 transition-colors ${isOpen ? 'self-end mb-4' : 'mb-3'}`}
            title={isOpen ? 'Recolher menu' : 'Expandir menu'}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo Original */}
          {isOpen ? (
            <div className="relative flex flex-col items-center justify-center mb-5 animate-fade-in mt-2">
              <img src="/logo-nexus.png" alt="Nexus Logo" className="w-40 h-auto object-contain drop-shadow-md" />
            </div>
          ) : (
            <div className="flex items-center justify-center mb-4 mt-2">
              <img src="/logo-nexus.png" alt="Nexus Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            </div>
          )}

          {/* Tag sistema */}
          {isOpen && (
            <div className="px-3 py-1.5 rounded-full flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">
                {isAdmin ? 'Administrador' : 'Colaborador'}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {isOpen && (
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <div key={item.name} className="flex flex-col">
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={(e) => {
                    if (item.sublinks && isOpen) {
                      // Se tem sublinks, pode apenas expandir (opcional), mas vamos navegar para a página "Todos"
                    } else {
                      closeMobile();
                    }
                  }}
                  className={`group flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    isItemActive ? 'bg-white/10 text-white shadow-lg' : 'text-white/65 hover:bg-white/5 hover:text-white'
                  }`}
                  title={!isOpen ? item.name : undefined}
                >
                  {isItemActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #a855f7 0%, #ec4899 100%)' }} />
                  )}
                  <span className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
                    isItemActive ? 'bg-accent/50 text-white' : 'group-hover:bg-white/10 text-white/60 group-hover:text-white'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {isOpen && <span className="flex-1 whitespace-nowrap overflow-hidden">{item.name}</span>}
                  {isOpen && isItemActive && !item.sublinks && (
                    <span className="w-2 h-2 rounded-full bg-accent-light animate-pulse flex-shrink-0" />
                  )}
                  {isOpen && item.sublinks && (
                    <ChevronRight className={`w-3.5 h-3.5 text-white/50 transition-transform ${isItemActive ? 'rotate-90' : ''}`} />
                  )}
                </NavLink>

                {/* Sublinks */}
                {isOpen && item.sublinks && isItemActive && (
                  <div className="ml-10 mt-1 flex flex-col gap-1 border-l border-white/10 pl-2">
                    {item.sublinks.map((sub) => {
                      const isSubActive = location.pathname + location.search === sub.path || (location.pathname === sub.path && !location.search && sub.path === item.path);
                      return (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          onClick={closeMobile}
                          className={`text-xs py-2 px-3 rounded-lg transition-colors ${
                            isSubActive
                              ? 'text-white bg-white/10 font-bold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-accent-light flex-shrink-0" />}
                            {sub.name}
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/10 flex-shrink-0 ${isOpen ? 'p-4' : 'p-2'}`}>
          <div className={`flex items-center ${isOpen ? 'gap-2 px-2' : 'justify-center'} py-2 rounded-xl`}
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Layers className="w-3.5 h-3.5 text-accent-light" />
            </div>
            {isOpen && (
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Nexus</p>
                <p className="text-white/30 text-[10px]">Space Edition</p>
              </div>
            )}
          </div>
        </div>
        
        </div> {/* Fim wrapper z-10 */}
      </div>
    </>
  );
}
