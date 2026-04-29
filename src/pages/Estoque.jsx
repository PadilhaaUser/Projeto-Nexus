import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, AlertCircle, ImagePlus, Package, ArrowUpDown } from 'lucide-react';
import Modal from '../components/Modal';
import { getProdutos, addProduto, updateProduto, deleteProduto } from '../services/estoque';
import { isCloudinaryConfigured } from '../config/cloudinary';

export default function Estoque() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome_asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduto, setCurrentProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);

  // Form states
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [minQuantidade, setMinQuantidade] = useState(5);
  const [categorias, setCategorias] = useState([]);
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos', error);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (produto) => {
    setSelectedProduto(produto);
    setIsViewModalOpen(true);
  };

  const openModal = (produto = null, e = null) => {
    if (e) e.stopPropagation(); // Previne abrir o modal de visualização
    if (produto) {
      setCurrentProduto(produto);
      setNome(produto.nome);
      setDescricao(produto.descricao || '');
      setPreco(produto.preco);
      setQuantidade(produto.quantidade);
      setMinQuantidade(produto.minQuantidade || 5);
      setCategorias(produto.categoria ? produto.categoria.split(', ') : []);
      setImagemPreview(produto.imageUrl || null);
    } else {
      setCurrentProduto(null);
      setNome('');
      setDescricao('');
      setPreco('');
      setQuantidade('');
      setMinQuantidade(5);
      setCategorias([]);
      setImagemPreview(null);
    }
    setImagem(null);
    setIsModalOpen(true);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagemPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isServico = categorias.includes('Serviços');
    const prodData = {
      nome,
      descricao,
      preco: parseFloat(preco),
      quantidade: isServico ? 9999 : parseInt(quantidade, 10),
      minQuantidade: isServico ? 0 : parseInt(minQuantidade, 10),
      categoria: categorias.join(', '),
    };

    setSaving(true);
    try {
      if (currentProduto) {
        await updateProduto(currentProduto.id, prodData, imagem);
      } else {
        await addProduto(prodData, imagem);
      }
      setIsModalOpen(false);
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto', error);
      alert('Erro ao salvar produto. Verifique as permissões do Firebase.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, imageUrl, e) => {
    e.stopPropagation(); // Previne abrir o modal de visualização
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduto(id, imageUrl);
        fetchProdutos();
      } catch (error) {
        console.error('Erro ao deletar produto', error);
      }
    }
  };

  const filteredProdutos = produtos
    .filter((p) => {
      // Filtrar por tab se houver (considerando categorias fixas sugeridas)
      if (tab) {
        const catStr = (p.categoria || '').toLowerCase();
        if (tab === 'equipamentos' && !catStr.includes('equipamento')) return false;
        if (tab === 'suprimentos' && !catStr.includes('suprimento')) return false;
        if (tab === 'servicos' && !catStr.includes('serviço') && !catStr.includes('servico')) return false;
      }
      return true;
    })
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'nome_asc':   return a.nome.localeCompare(b.nome);
        case 'nome_desc':  return b.nome.localeCompare(a.nome);
        case 'preco_asc':  return (a.preco || 0) - (b.preco || 0);
        case 'preco_desc': return (b.preco || 0) - (a.preco || 0);
        case 'qtd_asc':    return (a.quantidade || 0) - (b.quantidade || 0);
        case 'qtd_desc':   return (b.quantidade || 0) - (a.quantidade || 0);
        default: return 0;
      }
    });

  return (
    <div className="animate-slide-up space-y-5">
      {/* Cabeçalho */}
      {/* Cabeçalho Simplificado */}
      <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-[#1e293b] shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resumo de Inventário</p>
          <p className="text-lg font-bold text-white">{produtos.length} produto{produtos.length !== 1 ? 's' : ''} registrado{produtos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Busca + Ordenação */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search className="text-slate-500 w-4 h-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            className="flex-1 outline-none text-sm text-slate-300 placeholder:text-slate-500 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-400 text-xs">Limpar</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-[#334155] rounded-lg px-2.5 py-1.5 text-slate-400 outline-none focus:border-accent bg-transparent cursor-pointer"
          >
            <option value="nome_asc">Nome A→Z</option>
            <option value="nome_desc">Nome Z→A</option>
            <option value="preco_asc">Menor preço</option>
            <option value="preco_desc">Maior preço</option>
            <option value="qtd_asc">Menor estoque</option>
            <option value="qtd_desc">Maior estoque</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm p-8 text-center">
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-[#1e293b] rounded-xl" />
            ))}
          </div>
        </div>
      ) : filteredProdutos.length === 0 ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm flex flex-col items-center justify-center py-16 text-slate-500">
          <Package className="h-12 w-12 opacity-30 mb-3" />
          <p className="text-sm font-medium">Nenhum produto encontrado</p>
          <p className="text-xs mt-1">Clique em "Novo Produto" para adicionar</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {!tab || tab === 'todos' ? 'Categoria' : 'Descrição'}
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProdutos.map((produto) => (
                <tr
                  key={produto.id}
                  onClick={() => openViewModal(produto)}
                  className="table-row-hover cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#1e293b] border border-[#334155]">
                        {produto.imageUrl ? (
                          <img className="h-20 w-20 object-cover" src={produto.imageUrl} alt={produto.nome} />
                        ) : (
                          <div className="h-20 w-20 flex items-center justify-center text-slate-600">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors">{produto.nome}</p>
                        {(!tab || tab === 'todos') && (
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{produto.descricao}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {!tab || tab === 'todos' ? (
                      produto.categoria ? (
                        <span className="text-xs bg-[#1e293b] text-slate-400 px-2.5 py-1 rounded-full font-medium">
                          {produto.categoria}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 line-clamp-2 max-w-[200px]" title={produto.descricao}>
                        {produto.descricao || '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-200">
                    R$ {produto.preco?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {produto.categoria?.includes('Mão de Obra') ? (
                      <span className="text-sm font-semibold text-slate-400">Serviço</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${produto.quantidade <= (produto.minQuantidade || 5) ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {produto.quantidade} un.
                        </span>
                        {produto.quantidade <= (produto.minQuantidade || 5) && (
                          <AlertCircle className="w-4 h-4 text-rose-400" title="Estoque baixo" />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => openModal(produto, e)}
                        className="p-2 rounded-xl text-violet-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(produto.id, produto.imageUrl, e)}
                        className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Visualização */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Produto"
      >
        {selectedProduto && (
          <div className="space-y-5 pb-2">
            <div className="w-full aspect-video rounded-2xl bg-[#1e293b] overflow-hidden border border-[#1e293b] shadow-inner">
              {selectedProduto.imageUrl ? (
                <img src={selectedProduto.imageUrl} alt={selectedProduto.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <Package className="w-16 h-16 opacity-20 mb-2" />
                  <p className="text-sm">Sem foto cadastrada</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedProduto.nome}</h2>
                  <span className="inline-block mt-1 text-xs bg-accent/10 text-accent-dark px-2.5 py-1 rounded-full font-bold">
                    {selectedProduto.categoria || 'Sem categoria'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">R$ {selectedProduto.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  {!selectedProduto.categoria?.includes('Mão de Obra') && (
                    <p className={`text-sm font-bold ${selectedProduto.quantidade <= (selectedProduto.minQuantidade || 5) ? 'text-rose-400' : 'text-emerald-400'}`}>
                      Estoque: {selectedProduto.quantidade} un.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#1e293b]/50 rounded-xl p-4 border border-[#1e293b]">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Descrição</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {selectedProduto.descricao || 'Nenhuma descrição detalhada fornecida para este produto.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsViewModalOpen(false)}
              className="btn-primary w-full justify-center"
            >
              Fechar Visualização
            </button>
          </div>
        )}
      </Modal>

      {/* Modal Edição/Novo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduto ? 'Editar Produto' : 'Novo Produto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload de imagem via Cloudinary */}
          <div className="flex flex-col items-center">
            {isCloudinaryConfigured ? (
              <div
                className="w-full h-32 rounded-xl border-2 border-dashed border-[#334155] flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-white/5 transition-all duration-200 overflow-hidden relative group"
                onClick={() => document.getElementById('img-upload-produto').click()}
              >
                {imagemPreview ? (
                  <>
                    <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-medium">Clique para trocar</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Clique para adicionar foto</p>
                    <p className="text-xs text-slate-600 mt-0.5">PNG, JPG até 5MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#334155] bg-amber-500/5 flex items-center gap-3">
                <ImagePlus className="h-6 w-6 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-400">Imagens via Cloudinary</p>
                  <p className="text-xs text-amber-500 mt-0.5">Configure o Cloudinary em <code className="bg-amber-500/20 px-1 rounded">src/config/cloudinary.js</code> para ativar</p>
                </div>
              </div>
            )}
            <input
              id="img-upload-produto"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagemChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nome *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-base"
              placeholder="Nome do produto"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="input-base resize-none"
              rows={2}
              placeholder="Descrição opcional..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {categorias.includes('Mão de Obra') ? 'Valor do Serviço (R$) *' : 'Preço (R$) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="input-base"
                placeholder="0,00"
              />
            </div>
            {!categorias.includes('Mão de Obra') && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Quantidade *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="input-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Qtd. Mínima p/ Alerta *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantidade}
                    onChange={(e) => setMinQuantidade(e.target.value)}
                    className="input-base"
                    placeholder="5"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Categorias</label>
            <div className="flex gap-4">
              {['Equipamentos', 'Suprimentos', 'Serviços'].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                  <input
                    type="checkbox"
                    checked={categorias.includes(cat)}
                    onChange={() => {
                      setCategorias(prev => 
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                      );
                    }}
                    className="rounded border-[#475569] text-accent focus:ring-accent"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1 justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
