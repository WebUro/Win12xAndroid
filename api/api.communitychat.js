// api.communitychat.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- Live Chat API ---

// Send a message
async function sendMessage(chatRoom, sender, message) {
  try {
    const docRef = await addDoc(collection(db, `chats/${chatRoom}/messages`), {
      sender,
      message,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
}

// Listen to live messages in a chat room
function listenMessages(chatRoom, callback) {
  const q = query(
    collection(db, `chats/${chatRoom}/messages`),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  }, (error) => {
    console.error("Live listener error:", error);
  });
}

export {
  app,
  analytics,
  db,
  sendMessage,
  listenMessages
};
