// api.chatbot.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import OpenAI from "https://cdn.jsdelivr.net/npm/openai@latest/dist/openai.min.js";

// --- Firebase config ---
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

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: "<YOUR_OPENAI_API_KEY>"
});

// --- Helper Functions ---

// Send a message to chat
async function sendMessage(chatRoom, sender, message) {
  return await addDoc(collection(db, `chats/${chatRoom}/messages`), {
    sender,
    message,
    timestamp: serverTimestamp()
  });
}

// Queue a message for GPT processing
async function queueForGPT(chatRoom, messageId, message) {
  return await addDoc(collection(db, "pendingGpt"), {
    chatRoom,
    messageId,
    message,
    processed: false,
    timestamp: serverTimestamp()
  });
}

// Process pending GPT messages (server-side or Cloud Function)
async function processQueue() {
  const q = query(
    collection(db, "pendingGpt"),
    where("processed", "==", false),
    orderBy("timestamp", "asc")
  );

  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const { chatRoom, messageId, message } = docSnap.data();
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant in a community chat." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 250
      });

      const botMessage = response.choices[0].message.content;

      // Send GPT response
      await sendMessage(chatRoom, "ChatBot", botMessage);

      // Mark as processed
      await updateDoc(doc(db, "pendingGpt", docSnap.id), { processed: true });
    } catch (error) {
      console.error("GPT queue processing error:", error);
      // Retry on next run
    }
  }
}

// --- Live Listener for Users ---
/**
 * Listen for new user messages and automatically queue them for GPT.
 * @param {string} chatRoom
 */
function startLiveChat(chatRoom) {
  const q = query(
    collection(db, `chats/${chatRoom}/messages`),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === "added") {
        const msg = change.doc.data();
        const sender = msg.sender;

        // Skip messages from ChatBot
        if (sender === "ChatBot") continue;

        // Queue message if not already queued
        if (!msg.queuedForGpt) {
          await queueForGPT(chatRoom, change.doc.id, msg.message);
          await updateDoc(change.doc.ref, { queuedForGpt: true });
        }
      }
    }
  });
}

export {
  app,
  db,
  sendMessage,
  startLiveChat,
  processQueue
};
