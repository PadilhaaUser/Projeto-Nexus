import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { logAction } from './auditLog';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary';

const COLLECTION_NAME = 'produtos';

export const getProdutos = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('nome'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addProduto = async (produto, imageFile) => {
  // Tenta Cloudinary se configurado; caso contrário, salva sem imagem
  let imageUrl = null;
  if (imageFile && isCloudinaryConfigured) {
    try {
      imageUrl = await uploadToCloudinary(imageFile);
    } catch (err) {
      console.warn('Upload Cloudinary falhou:', err.message);
    }
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...produto,
    imageUrl,
    createdAt: new Date().toISOString(),
  });
  await logAction('created', 'produto', docRef.id, produto.nome, {
    preco: produto.preco,
    quantidade: produto.quantidade,
    categoria: produto.categoria,
  });
  return docRef.id;
};

export const updateProduto = async (id, produto, imageFile) => {
  const updateData = { ...produto, updatedAt: new Date().toISOString() };

  if (imageFile && isCloudinaryConfigured) {
    try {
      const url = await uploadToCloudinary(imageFile);
      if (url) updateData.imageUrl = url;
    } catch (err) {
      console.warn('Upload Cloudinary falhou:', err.message);
    }
  }

  await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
  await logAction('updated', 'produto', id, produto.nome, {
    preco: produto.preco,
    quantidade: produto.quantidade,
  });
};

export const deleteProduto = async (id, _imageUrl, nomeProduto = '') => {
  // Cloudinary não permite deleção gratuita via API pública — imagem permanece (sem custo)
  await deleteDoc(doc(db, COLLECTION_NAME, id));
  await logAction('deleted', 'produto', id, nomeProduto || id);
};
