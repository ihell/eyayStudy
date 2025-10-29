// lib/chatService.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export const chatService = {
  // Simpan pesan ke Firestore
  async sendMessage(userId, message, role = 'user') {
    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        userId,
        message,
        role,
        timestamp: serverTimestamp(),
        subject: 'general' // bisa dikembangkan untuk multiple subjects
      });
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Listen untuk real-time messages
  subscribeToMessages(userId, callback) {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  },

  // Simpan AI response
  async saveAIResponse(userId, message) {
    return this.sendMessage(userId, message, 'assistant');
  }
};