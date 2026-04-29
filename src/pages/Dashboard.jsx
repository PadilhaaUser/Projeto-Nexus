import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Users, FileText, TrendingUp, ArrowUpRight, Layers,
  AlertCircle, BarChart3, CheckCircle2, Plus, RefreshCw,
} from 'lucide-react';
import { getProdutos } from '../services/estoque';
import { getClientes } from '../services/clientes';
import { getOrcamentos } from '../services/orcamentos';
import { useRole } from '../hooks/useRole';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ─── Dashboard do Colaborador ────────────────────────────────────────────────
function ColaboradorDashboard() {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats]   = useState({ totalClientes: 0, orcamentosRecentes: [] });

  useEffect(() => {
    (async () => {
      try {
        const [clientes, orcamentos] = await Promise.all([getClientes(), getOrcamentos()]);
        setStats({ totalClientes: clientes.length, orcamentosRecentes: orcamentos.slice(0, 6) });
      } finally { setLoading(false); }
    })();
  }, []);

  const statusConfig = {
    Pendente:   { class: 'bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]', dot: 'bg-[#fbbf24]' },
    Confirmado: { class: 'bg-[#f0fdf4] text-[#15803d] border border-[#dcfce7]', dot: 'bg-[#4ade80]' },
    Cancelado:  { class: 'bg-[#fff1f2] text-[#be123c] border border-[#ffe4e6]', dot: 'bg-[#fb7185]' },
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Saudação */}
      <div className="rounded-2xl p-6 text-white overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%)', boxShadow: '0 4px 20px rgba(109,40,217,0.35)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <Layers className="absolute bottom-4 right-6 h-20 w-20 text-white/5" />
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium">Olá, bem-vindo</p>
          <h2 className="text-2xl font-bold mt-1">Área do Colaborador</h2>
          <p className="text-white/55 text-sm mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/clientes')}
          className="flex items-center gap-4 p-5 bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
        >
          <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Clientes</p>
            {loading ? (
              <p className="text-xs text-slate-500 mt-0.5">Carregando...</p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">{stats.totalClientes} cadastrado{stats.totalClientes !== 1 ? 's' : ''}</p>
            )}
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
        </button>

        <button
          onClick={() => navigate('/orcamentos')}
          className="flex items-center gap-4 p-5 bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
        >
          <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <FileText className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Orçamentos</p>
            <p className="text-xs text-slate-500 mt-0.5">Criar e gerenciar propostas</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors" />
        </button>
      </div>

      {/* Orçamentos recentes */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Orçamentos Recentes</h2>
            <p className="text-xs text-slate-500">Últimas propostas criadas</p>
          </div>
          <button onClick={() => navigate('/orcamentos')} className="text-xs text-accent hover:underline font-medium">
            Ver todos
          </button>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-[#1e293b] rounded-xl animate-pulse" />)}
          </div>
        ) : stats.orcamentosRecentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <FileText className="h-10 w-10 opacity-20 mb-2" />
            <p className="text-sm font-medium text-slate-400">Nenhum orçamento criado</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {stats.orcamentosRecentes.map((orc) => {
              const sc = statusConfig[orc.status] || { class: 'bg-[#1e293b] text-slate-400', dot: 'bg-gray-400' };
              return (
                <div key={orc.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#1e293b]/50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                      {orc.clienteNome?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{orc.clienteNome}</p>
                      <p className="text-xs text-slate-300">#{orc.numero} · {new Date(orc.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-200">
                      R$ {orc.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${sc.class}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {orc.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard do Admin ─────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { isAdmin } = useRole();

  // Colaborador vê o dashboard simplificado
  if (!isAdmin) return <ColaboradorDashboard />;

  return <AdminDashboard />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState({
    totalProdutos: 0, totalClientes: 0,
    orcamentosMes: 0, valorMes: 0,
    produtosBaixoEstoque: [], orcamentosRecentes: [],
    orcamentosConfirmados: 0,
    orcamentosPendentes: [],
  });
  const [loading, setLoading] = useState(true);
  const mesAtual = MESES[new Date().getMonth()];

  useEffect(() => { fetchDados(); }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const [produtos, clientes, orcamentos] = await Promise.all([
        getProdutos(), getClientes(), getOrcamentos(),
      ]);
      const agora = new Date();
      const orcamentosMes = orcamentos.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
      });
      const valorMes = orcamentosMes
        .filter((o) => o.status === 'Confirmado')
        .reduce((acc, o) => acc + (o.valorTotal || 0), 0);

      setDados({
        totalProdutos: produtos.length,
        totalClientes: clientes.length,
        orcamentosMes: orcamentosMes.length,
        orcamentosConfirmados: orcamentosMes.filter(o => o.status === 'Confirmado').length,
        valorMes,
        produtosBaixoEstoque: produtos.filter((p) => p.quantidade < 5),
        orcamentosRecentes: orcamentos.slice(0, 5),
        orcamentosPendentes: orcamentos.filter(o => o.status === 'Pendente').slice(0, 5),
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      name: 'Produtos', value: dados.totalProdutos, suffix: 'em estoque',
      icon: Package, from: 'rgba(168,85,247,0.15)', to: 'rgba(236,72,153,0.15)',
      iconBg: 'rgba(168,85,247,0.2)', route: '/estoque',
    },
    {
      name: 'Clientes', value: dados.totalClientes, suffix: 'cadastrados',
      icon: Users, from: 'rgba(168,85,247,0.15)', to: 'rgba(236,72,153,0.15)',
      iconBg: 'rgba(168,85,247,0.25)', route: '/clientes',
    },
    {
      name: 'Orçamentos', value: dados.orcamentosMes, suffix: `em ${mesAtual}`,
      icon: FileText, from: 'rgba(168,85,247,0.15)', to: 'rgba(236,72,153,0.15)',
      iconBg: 'rgba(236,72,153,0.2)', route: '/orcamentos',
    },
    {
      name: 'Receita Confirmada',
      value: `R$ ${dados.valorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      suffix: `${dados.orcamentosConfirmados} confirmado${dados.orcamentosConfirmados !== 1 ? 's' : ''}`,
      icon: TrendingUp, from: 'rgba(168,85,247,0.15)', to: 'rgba(236,72,153,0.15)',
      iconBg: 'rgba(236,72,153,0.25)', route: '/relatorios',
    },
  ];

  const statusConfig = {
    Pendente:   { class: 'bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]', dot: 'bg-[#fbbf24]' },
    Confirmado: { class: 'bg-[#f0fdf4] text-[#15803d] border border-[#dcfce7]', dot: 'bg-[#4ade80]' },
    Cancelado:  { class: 'bg-[#fff1f2] text-[#be123c] border border-[#ffe4e6]', dot: 'bg-[#fb7185]' },
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-56 skeleton rounded-2xl" />
          <div className="h-56 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-5">
      {/* Cabeçalho Simplificado */}
      <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-[#1e293b] shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resumo Estratégico</p>
          <p className="text-lg font-bold text-white">Olá, Administrador</p>
        </div>
        <button onClick={fetchDados} className="text-xs text-slate-400 hover:text-accent transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-800">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar Dados
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              onClick={() => navigate(metric.route)}
              className="relative rounded-2xl p-5 overflow-hidden cursor-pointer group bg-[#0f172a] border border-[#1e293b]"
              style={{
                background: `linear-gradient(145deg, ${metric.from} 0%, ${metric.to} 100%)`,
                boxShadow: `0 4px 20px ${metric.from}44`,
                animationDelay: `${idx * 60}ms`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${metric.from}66`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 20px ${metric.from}44`; }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 65%)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute right-4 bottom-3 pointer-events-none" style={{ opacity: 0.12 }}>
                <Icon className="h-16 w-16 text-white" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl" style={{ background: metric.iconBg }}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/50 group-hover:text-white/90 transition-colors" />
                </div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider leading-none mb-1.5">{metric.name}</p>
                <p className="text-2xl font-bold text-white leading-none">{metric.value}</p>
                <p className="text-white/55 text-xs mt-1">{metric.suffix}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Orçamentos Recentes */}
        <div className="lg:col-span-2 bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Orçamentos Recentes</h2>
              <p className="text-xs text-slate-300">Últimas propostas criadas</p>
            </div>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>

          {dados.orcamentosRecentes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-[#1e293b] flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 opacity-60 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-300">Nenhum orçamento criado</p>
              <p className="text-xs mt-1 text-slate-400">Acesse Orçamentos para começar</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1e293b]">
              {dados.orcamentosRecentes.map((orc) => {
                const sc = statusConfig[orc.status] || { class: 'bg-[#1e293b] text-slate-400', dot: 'bg-gray-400' };
                return (
                  <div key={orc.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#1e293b]/50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {orc.clienteNome?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">{orc.clienteNome}</p>
                        <p className="text-xs text-slate-300">#{orc.numero} · {new Date(orc.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-200">
                        R$ {orc.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${sc.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {orc.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Centro de Alertas */}
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Centro de Alertas</h2>
              <p className="text-xs text-slate-300">Itens que requerem atenção</p>
            </div>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px]">
            {/* Alertas de Estoque */}
            <div className="px-5 py-3 bg-[#1e293b]/50">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-3 h-3 text-slate-300" /> Estoque Baixo
              </p>
            </div>
            {dados.produtosBaixoEstoque.length === 0 ? (
              <div className="px-5 py-4 text-center">
                <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tudo em dia
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e293b]">
                {dados.produtosBaixoEstoque.map((p) => (
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <p className="text-sm font-medium text-white truncate pr-2">{p.nome}</p>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      {p.quantidade} un.
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Orçamentos Pendentes */}
            <div className="px-5 py-3 bg-[#1e293b]/50 border-t border-[#1e293b]">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3 text-slate-300" /> Orçamentos Pendentes
              </p>
            </div>
            {dados.orcamentosPendentes.length === 0 ? (
              <div className="px-5 py-4 text-center">
                <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Nenhum pendente
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e293b]">
                {dados.orcamentosPendentes.map((orc) => (
                  <div key={orc.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/orcamentos')}>
                    <p className="text-sm font-medium text-white truncate pr-2">{orc.clienteNome}</p>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      R$ {orc.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-[#1e293b]/30 border-t border-[#1e293b] text-center">
            <button onClick={fetchDados} className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center justify-center gap-1 mx-auto hover:underline">
              <RefreshCw className="w-2.5 h-2.5" /> Atualizar alertas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
