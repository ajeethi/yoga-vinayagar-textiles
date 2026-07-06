// ================================================================
//  YOGA VINAYAGAR TEXTILES — Firebase Database Layer
//  Handles: Orders, Wholesale Leads, Contact Messages, Products
// ================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Initialize ────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            window.YV_FIREBASE_API_KEY,
  authDomain:        window.YV_FIREBASE_AUTH_DOMAIN,
  projectId:         window.YV_FIREBASE_PROJECT_ID,
  storageBucket:     window.YV_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.YV_FIREBASE_MESSAGING_SENDER_ID,
  appId:             window.YV_FIREBASE_APP_ID
};

let app, db;

function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db  = getFirestore(app);
    return true;
  } catch(e) {
    console.warn("Firebase init failed:", e);
    return false;
  }
}

// ── ORDERS ────────────────────────────────────────────────────

/** Save a new order to Firestore. Returns the order ID. */
async function saveOrder(orderData) {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
      status: "pending"
    });
    return ref.id;
  } catch(e) {
    console.error("saveOrder error:", e);
    return null;
  }
}

/** Get all orders (latest first) */
async function getOrders() {
  if (!db) return [];
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.error("getOrders error:", e);
    return [];
  }
}

/** Listen to orders in real-time */
function listenOrders(callback) {
  if (!db) return;
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

/** Update order status */
async function updateOrderStatus(orderId, status) {
  if (!db) return;
  await updateDoc(doc(db, "orders", orderId), { status });
}

// ── WHOLESALE LEADS ───────────────────────────────────────────

async function saveWholesaleLead(data) {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, "wholesale_leads"), {
      ...data,
      createdAt: serverTimestamp(),
      status: "new"
    });
    return ref.id;
  } catch(e) {
    console.error("saveWholesaleLead error:", e);
    return null;
  }
}

async function getWholesaleLeads() {
  if (!db) return [];
  try {
    const q = query(collection(db, "wholesale_leads"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}

function listenWholesaleLeads(callback) {
  if (!db) return;
  const q = query(collection(db, "wholesale_leads"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// ── CONTACT MESSAGES ──────────────────────────────────────────

async function saveContactMessage(data) {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, "messages"), {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    });
    return ref.id;
  } catch(e) { return null; }
}

async function getMessages() {
  if (!db) return [];
  try {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}

// ── EXPORT ────────────────────────────────────────────────────
export {
  initFirebase, db,
  saveOrder, getOrders, listenOrders, updateOrderStatus,
  saveWholesaleLead, getWholesaleLeads, listenWholesaleLeads,
  saveContactMessage, getMessages
};
