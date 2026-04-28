import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { logAction } from './auditLog';

const COLLECTION_NAME = 'orcamentos';

export const getOrcamentos = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addOrcamento = async (orcamento) => {
  const numero = Math.floor(1000 + Math.random() * 9000).toString();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...orcamento,
    numero,
    status: 'Pendente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  await logAction('created', 'orcamento', docRef.id, `Orçamento #${numero} — ${orcamento.clienteNome}`);
  return { id: docRef.id, numero };
};

export const updateOrcamentoStatus = async (id, status, clienteNome = '', numero = '') => {
  const orcamentoRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(orcamentoRef, { status, updatedAt: new Date().toISOString() });
  await logAction(
    status === 'Cancelado' ? 'cancelled' : 'updated',
    'orcamento',
    id,
    `Orçamento #${numero} — ${clienteNome}`,
    { status }
  );
};

// Transação para confirmar orçamento e dar baixa no estoque
// Agora recebe o objeto completo do orçamento (com numero e clienteNome)
export const confirmarOrcamento = async (orcamento, itens) => {
  const orcamentoId = orcamento.id;
  const origemLabel = `Orçamento #${orcamento.numero} — ${orcamento.clienteNome}`;

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Ler todos os produtos para verificar estoque
      const produtosRefs = itens.map(item => doc(db, 'produtos', item.produtoId));
      const produtosDocs = await Promise.all(produtosRefs.map(ref => transaction.get(ref)));

      const updates = [];

      for (let i = 0; i < produtosDocs.length; i++) {
        const prodDoc = produtosDocs[i];
        if (!prodDoc.exists()) {
          throw new Error(`Produto não encontrado!`);
        }
        const novaQtd = prodDoc.data().quantidade - itens[i].quantidade;
        if (novaQtd < 0) {
          throw new Error(`Estoque insuficiente para ${prodDoc.data().nome}`);
        }
        updates.push({ ref: prodDoc.ref, novaQtd });
      }

      // 2. Aplicar as baixas no estoque
      updates.forEach(update => {
        transaction.update(update.ref, { quantidade: update.novaQtd });
      });

      // 3. Registrar movimentação (saída) para cada item — com referência legível
      itens.forEach(item => {
        const movRef = doc(collection(db, 'movimentacoes'));
        transaction.set(movRef, {
          produtoId: item.produtoId,
          produtoNome: item.nome,
          quantidade: item.quantidade,
          tipo: 'saida',
          origem: origemLabel,
          data: new Date().toISOString()
        });
      });

      // 4. Mudar status do orçamento para 'Confirmado'
      const orcRef = doc(db, COLLECTION_NAME, orcamentoId);
      transaction.update(orcRef, { status: 'Confirmado', updatedAt: new Date().toISOString() });
    });

    await logAction('confirmed', 'orcamento', orcamentoId, origemLabel, {
      itens: itens.map(i => `${i.quantidade}x ${i.nome}`)
    });
    return true;
  } catch (error) {
    console.error("Transação falhou: ", error);
    throw error;
  }
};

export const deleteOrcamento = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    await logAction('delete', 'orcamento', id, 'Orçamento Excluído');
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    throw error;
  }
};
