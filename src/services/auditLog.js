import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from './firebase';

const COLLECTION = 'auditLog';

/**
 * Registra uma ação no audit log.
 * @param {'created'|'updated'|'deleted'|'confirmed'|'cancelled'} action
 * @param {'produto'|'cliente'|'orcamento'} entity
 * @param {string} entityId
 * @param {string} entityName - Nome legível do item (ex: nome do produto)
 * @param {object} [details]  - Detalhes extras opcionais
 */
export const logAction = async (action, entity, entityId, entityName, details = {}) => {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, COLLECTION), {
      action,
      entity,
      entityId,
      entityName,
      userId: user?.uid || 'system',
      userEmail: user?.email || 'system',
      timestamp: new Date().toISOString(),
      details,
    });
  } catch (error) {
    // Silencia erros do audit log — nunca deve quebrar a operação principal
    console.warn('Audit log falhou (não crítico):', error.message);
  }
};

/**
 * Busca os últimos N eventos do audit log.
 * @param {number} maxResults
 */
export const getAuditLog = async (maxResults = 50) => {
  const q = query(
    collection(db, COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
