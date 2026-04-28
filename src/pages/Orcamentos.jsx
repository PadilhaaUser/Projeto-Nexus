import { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle, XCircle, Search, Trash2, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import { getOrcamentos, addOrcamento, updateOrcamentoStatus, confirmarOrcamento, deleteOrcamento } from '../services/orcamentos';
import { getClientes } from '../services/clientes';
import { getProdutos } from '../services/estoque';
import { gerarOrcamentoPDF } from '../utils/gerarPDF';
import { useRole } from '../hooks/useRole';

const statusConfig = {
  Pendente:  { label: 'Pendente',  class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  Confirmado:{ label: 'Confirmado',class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  Cancelado: { label: 'Cancelado', class: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
};

export default function Orcamentos() {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState('Paisagismo');
  const categorias = ['Paisagismo', 'Irrigação', 'Mão de Obra'];
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [orcamentos, setOrcamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentOrcamento, setCurrentOrcamento] = useState(null);

  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [itens, setItens] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState(1);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orcData, cliData, prodData] = await Promise.all([
        getOrcamentos(), getClientes(), getProdutos()
      ]);
      setOrcamentos(orcData);
      setClientes(cliData);
      setProdutos(prodData);
    } catch (error) {
      console.error('Erro ao carregar dados', error);
    } finally {
      setLoading(false);
    }
  };

  const openNovoModal = () => {
    setClienteSelecionado('');
    setItens([]);
    setProdutoSelecionado('');
    setQuantidadeProduto(1);
    setObservacoes('');
    setIsModalOpen(true);
  };

  const adicionarItem = () => {
    if (!produtoSelecionado) return;
    const produto = produtos.find((p) => p.id === produtoSelecionado);
    if (!produto) return;

    const isMaoDeObra = (produto.categoria || '').includes('Mão de Obra');
    const qtd = isMaoDeObra ? 1 : quantidadeProduto;

    if (qtd <= 0) return;

    if (!isMaoDeObra && qtd > produto.quantidade) {
      alert(`Quantidade indisponível. Estoque atual: ${produto.quantidade}`);
      return;
    }
    const itemExistente = itens.find((i) => i.produtoId === produto.id);
    if (itemExistente) {
      if (!isMaoDeObra && itemExistente.quantidade + Number(qtd) > produto.quantidade) {
        alert(`Quantidade total excede o estoque. Estoque: ${produto.quantidade}`);
        return;
      }
      setItens(itens.map((i) =>
        i.produtoId === produto.id
          ? { ...i, quantidade: i.quantidade + parseInt(qtd) }
          : i
      ));
    } else {
      setItens([...itens, {
        produtoId: produto.id,
        nome: produto.nome,
        precoUnitario: produto.preco,
        quantidade: parseInt(qtd),
        imageUrl: produto.imageUrl,
        categoria: produto.categoria || 'Sem categoria',
      }]);
    }
    setProdutoSelecionado('');
    setQuantidadeProduto(1);
  };

  const removerItem = (produtoId) => setItens(itens.filter((i) => i.produtoId !== produtoId));
  const calcularTotal = () => itens.reduce((t, i) => t + i.precoUnitario * i.quantidade, 0);

  const handleSalvar = async () => {
    if (!clienteSelecionado) { alert('Selecione um cliente.'); return; }
    if (itens.length === 0) { alert('Adicione pelo menos um produto.'); return; }
    const cliente = clientes.find((c) => c.id === clienteSelecionado);
    const orcamento = {
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      clienteDocumento: cliente.documento,
      clienteEmail: cliente.email,
      clienteTelefone: cliente.telefone,
      clienteNomeProjeto: cliente.nomeProjeto || '',
      itens,
      valorTotal: calcularTotal(),
      observacoes,
    };
    setSaving(true);
    try {
      await addOrcamento(orcamento);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar orçamento', error);
      alert('Erro ao salvar orçamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmar = async (orc) => {
    if (window.confirm('Confirmar orçamento e dar baixa no estoque? Esta ação não pode ser desfeita.')) {
      try {
        // Passa o objeto completo para usar numero e clienteNome na origem
        await confirmarOrcamento(orc, orc.itens);
        fetchData();
      } catch (error) { alert(error.message); }
    }
  };

  const handleCancelar = async (orc) => {
    if (window.confirm('Cancelar este orçamento?')) {
      try {
        await updateOrcamentoStatus(orc.id, 'Cancelado', orc.clienteNome, orc.numero);
        fetchData();
      }
      catch (error) { console.error('Erro ao cancelar', error); }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento permanentemente?')) {
      try {
        await deleteOrcamento(id);
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  const filteredOrcamentos = orcamentos.filter(o => filtroStatus === 'Todos' || o.status === filtroStatus);

  return (
    <div className="animate-slide-up space-y-5">
      {/* Cabeçalho Simplificado */}
      <div className="flex justify-between items-center bg-slate-200 p-4 rounded-2xl border border-slate-300 shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Resumo de Propostas</p>
          <p className="text-lg font-bold text-slate-900">{filteredOrcamentos.length} orçamento{filteredOrcamentos.length !== 1 ? 's' : ''} emitido{filteredOrcamentos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNovoModal} className="btn-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </button>
      </div>

      {/* Sublinks de Filtro */}
      <div className="flex space-x-2 border-b border-[#1e293b] pb-1 -mt-2">
        {['Todos', 'Pendente', 'Confirmado', 'Cancelado'].map(status => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${filtroStatus === status ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-slate-300 hover:bg-[#1e293b]/50'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm p-8">
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-[#1e293b] rounded-xl" />)}
          </div>
        </div>
      ) : filteredOrcamentos.length === 0 ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm flex flex-col items-center justify-center py-16 text-slate-500">
          <FileText className="h-12 w-12 opacity-30 mb-3" />
          <p className="text-sm font-medium">Nenhum orçamento encontrado</p>
          <p className="text-xs mt-1">Clique em "Novo Orçamento" para começar ou limpe os filtros</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nº</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrcamentos.map((orc) => {
                const sc = statusConfig[orc.status] || { label: orc.status, class: 'bg-[#1e293b] text-slate-400' };
                return (
                  <tr key={orc.id} className="table-row-hover">
                    <td className="px-6 py-4 text-sm font-bold text-primary">#{orc.numero}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(orc.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{orc.clienteNome}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-200">
                      R$ {orc.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sc.class}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setCurrentOrcamento(orc); setIsViewModalOpen(true); }}
                          className="p-2 rounded-xl text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => gerarOrcamentoPDF(orc)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-300 hover:bg-[#1e293b] transition-colors"
                          title="Gerar PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {orc.status === 'Pendente' && (
                          <>
                            <button
                              onClick={() => handleConfirmar(orc)}
                              className="p-2 rounded-xl text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                              title="Confirmar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelar(orc)}
                              className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(orc.id)}
                            className="p-2 rounded-xl text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Orçamento */}
      <Modal fullScreen isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Criar Novo Orçamento">
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-shrink-0">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cliente *</label>
            <select
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
              className="input-base"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} {c.documento ? `(${c.documento})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col md:flex-row gap-4 min-h-0">
            {/* Esquerda: Adicionar Produtos (Categorias) */}
            <div className="md:w-1/2 flex flex-col border border-[#1e293b] rounded-xl bg-[#1e293b]/50/50 p-4 min-h-0">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Produtos por Categoria</h4>
              
              {/* Tabs */}
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${activeTab === cat ? 'bg-primary text-white shadow-sm' : 'bg-[#334155] text-slate-400 hover:bg-gray-300'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Selecionar e Adicionar */}
              <div className="flex gap-2 items-end mb-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Produto</label>
                  <select
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                    className="input-base"
                  >
                    <option value="">Selecione um produto</option>
                    {produtos
                      .filter(p => {
                        const catStr = (p.categoria || '').toLowerCase();
                        if (activeTab === 'Paisagismo') return catStr.includes('paisagismo');
                        if (activeTab === 'Irrigação') return catStr.includes('irriga');
                        if (activeTab === 'Mão de Obra') return catStr.includes('obra');
                        return false;
                      })
                      .map((p) => {
                        const isSvc = (p.categoria || '').includes('Mão de Obra');
                        return (
                          <option key={p.id} value={p.id}>
                            {p.nome} — R$ {p.preco?.toFixed(2)} {!isSvc ? `(Est: ${p.quantidade})` : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
                {(!produtoSelecionado || !(produtos.find(p => p.id === produtoSelecionado)?.categoria || '').includes('Mão de Obra')) && (
                  <div className="w-20">
                    <label className="block text-xs text-slate-400 mb-1">Qtd.</label>
                    <input
                      type="number"
                      min="1"
                      value={quantidadeProduto}
                      onChange={(e) => setQuantidadeProduto(e.target.value)}
                      className="input-base"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="btn-primary px-3 py-2.5"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Direita: Lista de Itens Adicionados */}
            <div className="md:w-1/2 flex flex-col border border-[#1e293b] rounded-xl bg-[#0f172a] min-h-0 overflow-hidden shadow-sm">
              <div className="p-3 bg-[#1e293b]/50 border-b border-[#1e293b]">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Itens do Orçamento</h4>
              </div>
              
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {itens.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                    Nenhum produto adicionado
                  </div>
                ) : (
                  itens.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 flex justify-between items-center text-sm hover:bg-[#1e293b]/50/50">
                      <div>
                        <span className="font-medium text-white">{item.nome}</span>
                        <span className="text-slate-500 ml-2 text-xs">
                          {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-200">
                          R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removerItem(item.produtoId)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="px-4 py-4 bg-[#1e293b]/50 flex justify-between items-center border-t border-[#334155] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total Geral</span>
                <span className="text-xl font-bold text-primary">
                  R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows="2"
              className="input-base resize-none"
              placeholder="Anotações para o cliente ou internas..."
            />
          </div>

          <div className="flex gap-3 pt-2 flex-shrink-0 mt-auto">

            <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Criando...' : 'Criar Orçamento'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Visualizar */}
      {currentOrcamento && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Orçamento #${currentOrcamento.numero}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e293b]/50 rounded-xl p-3">
                <span className="text-xs text-slate-400 block mb-1">Cliente</span>
                <span className="text-sm font-semibold text-white">{currentOrcamento.clienteNome}</span>
              </div>
              <div className="bg-[#1e293b]/50 rounded-xl p-3">
                <span className="text-xs text-slate-400 block mb-1">Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusConfig[currentOrcamento.status]?.class || 'bg-[#1e293b] text-slate-400'}`}>
                  {currentOrcamento.status}
                </span>
              </div>
              <div className="bg-[#1e293b]/50 rounded-xl p-3">
                <span className="text-xs text-slate-400 block mb-1">Data</span>
                <span className="text-sm font-semibold text-white">
                  {new Date(currentOrcamento.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="bg-[#1e293b]/50 rounded-xl p-3">
                <span className="text-xs text-slate-400 block mb-1">Valor Total</span>
                <span className="text-sm font-bold text-primary">
                  R$ {currentOrcamento.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Itens</h4>
              <div className="bg-[#1e293b]/50 rounded-xl overflow-hidden border border-[#1e293b]">
                <div className="divide-y divide-gray-100">
                  {currentOrcamento.itens.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 flex justify-between text-sm">
                      <span className="text-slate-300">{item.quantidade}x {item.nome}</span>
                      <span className="font-semibold text-white">
                        R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-primary/5 flex justify-between border-t border-[#1e293b]">
                  <span className="text-sm font-medium text-slate-400">Total</span>
                  <span className="text-base font-bold text-primary">
                    R$ {currentOrcamento.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {currentOrcamento.observacoes && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observações</h4>
                <p className="text-sm text-slate-400 bg-[#1e293b]/50 p-3 rounded-xl border border-[#1e293b]">
                  {currentOrcamento.observacoes}
                </p>
              </div>
            )}

            <button
              onClick={() => gerarOrcamentoPDF(currentOrcamento)}
              className="btn-primary w-full justify-center"
            >
              <FileText className="w-4 h-4" />
              Baixar PDF
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
