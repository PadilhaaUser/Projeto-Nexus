import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';

export const getMovimentacoes = async (mes, ano) => {
  const inicioMes = new Date(ano, mes, 1).toISOString();
  const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59).toISOString();
  
  const q = query(
    collection(db, 'movimentacoes'),
    where('data', '>=', inicioMes),
    where('data', '<=', fimMes),
    orderBy('data', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
