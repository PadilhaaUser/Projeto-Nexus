import { useState, useEffect } from 'react';
import { Download, BarChart3, TrendingUp, FileCheck, FileX, DollarSign } from 'lucide-react';
import { getOrcamentos } from '../services/orcamentos';
import { getMovimentacoes } from '../services/movimentacoes';
import { gerarRelatorioPDF } from '../utils/gerarPDF';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export default function Relatorios() {
  const [mes, setMes]   = useState(new Date().getMonth());
  const [ano, setAno]   = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);

  const [movimentacoes, setMovimentacoes]   = useState([]);
  const [orcamentosMes, setOrcamentosMes]   = useState([]);

  useEffect(() => { fetchDadosRelatorio(); }, [mes, ano]);

  const fetchDadosRelatorio = async () => {
    setLoading(true);
    try {
      const movs     = await getMovimentacoes(Number(mes), Number(ano));
      setMovimentacoes(movs);

      const todosOrc = await getOrcamentos();
      const orcsMes  = todosOrc.filter((orc) => {
        const d = new Date(orc.createdAt);
        return d.getMonth() === Number(mes) && d.getFullYear() === Number(ano);
      });
      setOrcamentosMes(orcsMes);
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    } finally {
      setLoading(false);
    }
  };

  const orcamentosConfirmados = orcamentosMes.filter((o) => o.status === 'Confirmado');
  const orcamentosCancelados  = orcamentosMes.filter((o) => o.status === 'Cancelado');
  const valorTotalConfirmado  = orcamentosConfirmados.reduce((acc, o) => acc + (o.valorTotal || 0), 0);

  const exportarPDF = async () => {
    setExportando(true);
    try {
      await gerarRelatorioPDF({
        mes,
        ano,
        MESES,
        orcamentosMes,
        orcamentosConfirmados,
        orcamentosCancelados,
        valorTotalConfirmado,
        movimentacoes,
      });
    } finally {
      setExportando(false);
    }
  };

  const anosDisponiveis = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const statCards = [
    {
      label: 'Gerados',
      value: orcamentosMes.length,
      icon: BarChart3,
      bg: 'bg-[#1e293b]/50',
      text: 'text-slate-300',
      icon_color: 'text-slate-500',
    },
    {
      label: 'Confirmados',
      value: orcamentosConfirmados.length,
      icon: FileCheck,
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      icon_color: 'text-green-400',
    },
    {
      label: 'Cancelados',
      value: orcamentosCancelados.length,
      icon: FileX,
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      icon_color: 'text-red-400',
    },
    {
      label: 'Valor Confirmado',
      value: `R$ ${valorTotalConfirmado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      bg: 'bg-accent/10',
      text: 'text-accent',
      icon_color: 'text-accent',
    },
  ];

  return (
    <div className="animate-slide-up space-y-5">
      {/* Cabeçalho Simplificado */}
      <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-[#1e293b] shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Painel Analítico</p>
          <p className="text-lg font-bold text-white">Período: {MESES[Number(mes)]} / {ano}</p>
        </div>
        <button
          onClick={exportarPDF}
          disabled={exportando}
          className="btn-primary shadow-lg shadow-primary/20"
        >
          <Download className="w-4 h-4" />
          {exportando ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm px-5 py-4 flex items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mês</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="input-base w-40"
          >
            {MESES.map((nome, idx) => (
              <option key={idx} value={idx}>{nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ano</label>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="input-base w-28"
          >
            {anosDisponiveis.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm text-slate-500">
          {MESES[Number(mes)]} / {ano}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-[#334155] rounded-2xl" />
          <div className="h-48 bg-[#334155] rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Cards de Resumo */}
          <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e293b]">
              <h2 className="text-sm font-semibold text-white">
                Resumo de Orçamentos — {MESES[Number(mes)]} / {ano}
              </h2>
            </div>
            <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`${card.bg} p-4 rounded-xl flex items-start gap-3`}>
                    <div className={`p-2 rounded-lg bg-[#0f172a]/60 ${card.icon_color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">{card.label}</p>
                      <p className={`text-xl font-bold ${card.text}`}>{card.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabela de Movimentações */}
          <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Saídas Confirmadas no Estoque</h2>
              <TrendingUp className="h-4 w-4 text-slate-500" />
            </div>
            {movimentacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <BarChart3 className="h-10 w-10 opacity-20 mb-2" />
                <p className="text-sm">Nenhuma movimentação registrada neste mês</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#1e293b]">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Qtd</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movimentacoes.map((mov) => (
                    <tr key={mov.id} className="table-row-hover">
                      <td className="px-6 py-3.5 text-sm text-slate-400">
                        {new Date(mov.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium text-white">{mov.produtoNome}</td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                          -{mov.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-400">{mov.origem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
