import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import Modal from '../components/Modal';
import { getClientes, addCliente, updateCliente, deleteCliente } from '../services/clientes';
import { useRole } from '../hooks/useRole';

export default function Clientes() {
  const { isAdmin } = useRole();
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [nomeProjeto, setNomeProjeto] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cliente = null) => {
    if (cliente) {
      setCurrentCliente(cliente);
      setNome(cliente.nome);
      setDocumento(cliente.documento || '');
      setTelefone(cliente.telefone || '');
      setEmail(cliente.email || '');
      setEndereco(cliente.endereco || '');
      setNomeProjeto(cliente.nomeProjeto || '');
    } else {
      setCurrentCliente(null);
      setNome('');
      setDocumento('');
      setTelefone('');
      setEmail('');
      setEndereco('');
      setNomeProjeto('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cliData = { nome, documento, telefone, email, endereco, nomeProjeto };
    setSaving(true);
    try {
      if (currentCliente) {
        await updateCliente(currentCliente.id, cliData);
      } else {
        await addCliente(cliData);
      }
      setIsModalOpen(false);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente', error);
      alert('Erro ao salvar cliente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCliente(id);
        fetchClientes();
      } catch (error) {
        console.error('Erro ao deletar cliente', error);
      }
    }
  };

  const filteredClientes = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.documento && c.documento.includes(searchTerm))
  );

  const avatarColor = (nome) => {
    const colors = [
      'from-violet-500 to-purple-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-pink-500 to-rose-500',
    ];
    const idx = nome.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="animate-slide-up space-y-5">
      {/* Cabeçalho */}
      {/* Cabeçalho Simplificado */}
      <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-[#1e293b] shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base de Contatos</p>
          <p className="text-lg font-bold text-white">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm px-4 py-3 flex items-center gap-3">
        <Search className="text-slate-500 w-4 h-4 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF/CNPJ..."
          className="flex-1 outline-none text-sm text-slate-300 placeholder:text-slate-500 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-400 text-xs">
            Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm p-8">
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-[#1e293b] rounded-xl" />
            ))}
          </div>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm flex flex-col items-center justify-center py-16 text-slate-500">
          <Users className="h-12 w-12 opacity-30 mb-3" />
          <p className="text-sm font-medium">Nenhum cliente encontrado</p>
          <p className="text-xs mt-1">Clique em "Novo Cliente" para adicionar</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">CPF / CNPJ</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 flex-shrink-0 rounded-xl bg-gradient-to-br ${avatarColor(cliente.nome)} flex items-center justify-center text-white text-sm font-bold overflow-hidden`}>
                        {cliente.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{cliente.nome}</p>
                        <p className="text-xs text-slate-500">{cliente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {cliente.documento || <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {cliente.telefone || <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openModal(cliente)}
                        className="p-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCliente ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nome Completo *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-base"
              placeholder="Nome do cliente"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nome do Projeto</label>
            <input
              type="text"
              value={nomeProjeto}
              onChange={(e) => setNomeProjeto(e.target.value)}
              className="input-base"
              placeholder="Ex: Jardim de Inverno - Casa Alphaville"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">CPF / CNPJ</label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="input-base"
              placeholder="000.000.000-00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="input-base"
                placeholder="(41) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Endereço Completo</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="input-base"
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          {/* Espaço para manter layout consistente */}
          <div className="pt-2"></div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
