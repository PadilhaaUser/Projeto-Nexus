import { useState, useEffect } from 'react';
import { ClipboardList, RefreshCw, Package, Users, FileText, CheckCircle, XCircle, Trash2, Edit2, Plus } from 'lucide-react';
import { getAuditLog } from '../services/auditLog';

const actionConfig = {
  created:   { label: 'Criado',     icon: Plus,         bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-400' },
  updated:   { label: 'Editado',    icon: Edit2,        bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-400'  },
  deleted:   { label: 'Excluído',   icon: Trash2,       bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400'   },
  confirmed: { label: 'Confirmado', icon: CheckCircle,  bg: 'bg-primary/8', text: 'text-primary',    dot: 'bg-accent'    },
  cancelled: { label: 'Cancelado',  icon: XCircle,      bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400'},
};

const entityConfig = {
  produto:   { label: 'Produto',   icon: Package,  color: 'text-indigo-500',  bg: 'bg-indigo-50'  },
  cliente:   { label: 'Cliente',   icon: Users,    color: 'text-teal-500',    bg: 'bg-teal-50'    },
  orcamento: { label: 'Orçamento', icon: FileText, color: 'text-amber-500',   bg: 'bg-amber-50'   },
};

const tempoRelativo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  if (min < 1)  return 'Agora mesmo';
  if (min < 60) return `há ${min} min`;
  if (h < 24)   return `há ${h}h`;
  if (d < 7)    return `há ${d} dia${d !== 1 ? 's' : ''}`;
  return new Date(iso).toLocaleDateString('pt-BR');
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEntity, setFiltroEntity] = useState('todos');
  const [filtroAction, setFiltroAction] = useState('todos');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLog(100);
      setLogs(data);
    } catch (error) {
      console.error('Erro ao buscar audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(log => {
    const matchEntity = filtroEntity === 'todos' || log.entity === filtroEntity;
    const matchAction = filtroAction === 'todos' || log.action === filtroAction;
    return matchEntity && matchAction;
  });

  return (
    <div className="animate-slide-up space-y-5">
      {/* Cabeçalho Simplificado */}
      <div className="flex justify-between items-center bg-slate-200 p-4 rounded-2xl border border-slate-300 shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Rastreabilidade</p>
          <p className="text-lg font-bold text-slate-900">Histórico de Atividades</p>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="btn-primary shadow-lg shadow-primary/20">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm px-5 py-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Módulo</label>
          <select
            value={filtroEntity}
            onChange={e => setFiltroEntity(e.target.value)}
            className="input-base w-36"
          >
            <option value="todos">Todos</option>
            <option value="produto">Produto</option>
            <option value="cliente">Cliente</option>
            <option value="orcamento">Orçamento</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ação</label>
          <select
            value={filtroAction}
            onChange={e => setFiltroAction(e.target.value)}
            className="input-base w-36"
          >
            <option value="todos">Todas</option>
            <option value="created">Criados</option>
            <option value="updated">Editados</option>
            <option value="deleted">Excluídos</option>
            <option value="confirmed">Confirmados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
        <div className="ml-auto flex items-end">
          <span className="text-sm text-slate-500">{filtered.length} evento{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Lista de eventos */}
      {loading ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-[#1e293b] rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#1e293b] rounded w-1/3" />
                  <div className="h-3 bg-[#1e293b] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm flex flex-col items-center justify-center py-16 text-slate-500">
          <ClipboardList className="h-12 w-12 opacity-20 mb-3" />
          <p className="text-sm font-medium">Nenhum evento encontrado</p>
          <p className="text-xs mt-1">As ações no sistema aparecerão aqui</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((log) => {
              const ac = actionConfig[log.action] || actionConfig.updated;
              const ec = entityConfig[log.entity] || entityConfig.produto;
              const ActionIcon = ac.icon;
              const EntityIcon = ec.icon;

              return (
                <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-[#1e293b]/50/60 transition-colors">
                  {/* Ícone da ação */}
                  <div className={`p-2.5 rounded-xl ${ac.bg} flex-shrink-0`}>
                    <ActionIcon className={`h-4 w-4 ${ac.text}`} />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Badge entidade */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${ec.bg}`}>
                        <EntityIcon className={`h-3 w-3 ${ec.color}`} />
                        <span className={`text-xs font-semibold ${ec.color}`}>{ec.label}</span>
                      </div>
                      {/* Badge ação */}
                      <span className={`text-xs font-semibold ${ac.text}`}>{ac.label}</span>
                    </div>
                    <p className="text-sm font-medium text-white mt-1 truncate">{log.entityName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-slate-500">por <span className="font-medium text-slate-400">{log.userEmail}</span></p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="text-xs text-slate-600">
                          {Object.entries(log.details)
                            .filter(([, v]) => v !== undefined && v !== null)
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                            .join(' · ')
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-medium text-slate-400">{tempoRelativo(log.timestamp)}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
