import { useState, useEffect } from 'react';
import { getProdutos } from '../services/estoque';
import { getOrcamentos } from '../services/orcamentos';
import { useRole } from './useRole';

/**
 * Gera notificações automáticas baseadas no estado do sistema:
 * - Produtos com estoque baixo (< 5 unidades)
 * - Orçamentos pendentes há mais de 3 dias
 */
export function useNotificacoes() {
  const { isAdmin } = useRole();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotificacoes = async () => {
    setLoading(true);
    try {
      const [produtos, orcamentos] = await Promise.all([getProdutos(), getOrcamentos()]);

      const notifs = [];

      // 1. Estoque baixo (apenas para admin)
      if (isAdmin) {
        produtos
          .filter(p => !p.categoria?.includes('Mão de Obra') && p.quantidade <= (p.minQuantidade || 5))
          .forEach(p => {
            notifs.push({
              id: `estoque_${p.id}`,
              type: 'warning',
              title: 'Estoque baixo',
              message: `${p.nome} atingiu o nível mínimo (Estoque: ${p.quantidade}, Mín: ${p.minQuantidade || 5}).`,
              route: '/estoque',
              timestamp: new Date().toISOString(),
            });
          });
      }

      // 2. Orçamentos pendentes há > 3 dias
      const tresDiasAtras = new Date();
      tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

      orcamentos
        .filter(o => o.status === 'Pendente' && new Date(o.createdAt) < tresDiasAtras)
        .forEach(o => {
          const diasAtraso = Math.floor(
            (new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24)
          );
          notifs.push({
            id: `orcamento_${o.id}`,
            type: 'info',
            title: 'Orçamento pendente',
            message: `Orçamento #${o.numero} de ${o.clienteNome} está pendente há ${diasAtraso} dias.`,
            route: '/orcamentos',
            timestamp: o.createdAt,
          });
        });

      // Ordena mais recentes primeiro
      notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      const dismissed = JSON.parse(localStorage.getItem('dismissedNotifs') || '[]');
      const activeNotifs = notifs.filter(n => !dismissed.includes(n.id));

      setNotificacoes(activeNotifs);
    } catch (error) {
      console.warn('Erro ao buscar notificações:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
    // Atualiza a cada 5 minutos
    const interval = setInterval(fetchNotificacoes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const clearNotificacoes = () => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedNotifs') || '[]');
    const newDismissed = [...new Set([...dismissed, ...notificacoes.map(n => n.id)])];
    localStorage.setItem('dismissedNotifs', JSON.stringify(newDismissed));
    setNotificacoes([]);
  };

  return { notificacoes, loading, refetch: fetchNotificacoes, clearNotificacoes };
}
