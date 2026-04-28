import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { logAction } from './auditLog';

const COLLECTION_NAME = 'clientes';

export const getClientes = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('nome'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addCliente = async (cliente) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...cliente,
    createdAt: new Date().toISOString(),
  });
  await logAction('created', 'cliente', docRef.id, cliente.nome);
  return docRef.id;
};

export const updateCliente = async (id, cliente) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...cliente,
    updatedAt: new Date().toISOString(),
  });
  await logAction('updated', 'cliente', id, cliente.nome);
};

export const deleteCliente = async (id, nomeCliente = '') => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
  await logAction('deleted', 'cliente', id, nomeCliente || id);
};
