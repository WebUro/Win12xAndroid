// api.reportcommunitychat.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config (same as your main chat)
const firebaseConfig = {
  apiKey: "AIzaSyBox7pfFVTYrJ7vhBfhQGHiDnPwQVmiD_M",
  authDomain: "win12xandroid.firebaseapp.com",
  projectId: "win12xandroid",
  storageBucket: "win12xandroid.firebasestorage.app",
  messagingSenderId: "1014906104440",
  appId: "1:1014906104440:web:a88a2858b5009dd8a61b8d",
  measurementId: "G-LJ7836G738"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Report Chat API ---

/**
 * Report a message
 * @param {string} chatRoom - The chat room ID
 * @param {string} messageId - The ID of the message being reported
 * @param {string} reporter - The user reporting
 * @param {string} reason - Reason for reporting
 */
async function reportMessage(chatRoom, messageId, reporter, reason) {
  try {
    const docRef = await addDoc(collection(db, `chats/${chatRoom}/reports`), {
      messageId,
      reporter,
      reason,
      timestamp: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error reporting message:", error);
    return { success: false, error };
  }
}

/**
 * Get all reports for a chat room
 * @param {string} chatRoom - The chat room ID
 */
async function getReports(chatRoom) {
  try {
    const q = query(
      collection(db, `chats/${chatRoom}/reports`),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export {
  app,
  db,
  reportMessage,
  getReports
};
