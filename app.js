// Firebase (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";

// Firestore
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Tu configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBt0GuV5OugDOkfDL0H3GsRbspYvSQOzdE",
  authDomain: "netlify-5e45b.firebaseapp.com",
  projectId: "netlify-5e45b",
  storageBucket: "netlify-5e45b.firebasestorage.app",
  messagingSenderId: "1079682356278",
  appId: "1:1079682356278:web:441e1a3dc4692f393a7497",
  measurementId: "G-L6SSB5R54W"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Analytics puede fallar en local/HTTP; no pasa nada si lo envuelves
try { getAnalytics(app); } catch (_) {}

const db = getFirestore(app);
const opsCol = collection(db, "operations");

// DOM
const $a = document.getElementById("a");
const $b = document.getElementById("b");
const $result = document.getElementById("result");
const $error = document.getElementById("error");
const $history = document.getElementById("history");

const $sumBtn = document.getElementById("sumBtn");
const $clearBtn = document.getElementById("clearBtn");

// Helpers
function parseNumber(value) {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function setError(msg) {
  $error.textContent = msg || "";
}

function formatNumber(n) {
  return Number.isInteger(n) ? String(n) : String(+n.toFixed(10));
}

async function trimHistory(max = 10) {
  // Trae más de max para poder borrar sobrantes
  const snap = await getDocs(query(opsCol, orderBy("createdAt", "desc"), limit(50)));
  const docs = snap.docs;

  if (docs.length <= max) return;

  const toDelete = docs.slice(max);
  await Promise.all(
    toDelete.map(d => deleteDoc(doc(db, "operations", d.id)))
  );
}

async function saveOperation(a, b, total) {
  await addDoc(opsCol, {
    a,
    b,
    total,
    createdAt: serverTimestamp()
  });

  // Mantener solo las últimas 10
  await trimHistory(10);
}

function renderHistory(items) {
  $history.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Aún no hay operaciones.";
    $history.appendChild(li);
    return;
  }

  for (const op of items) {
    const li = document.createElement("li");
    li.textContent = `${formatNumber(op.a)} + ${formatNumber(op.b)} = ${formatNumber(op.total)}`;
    $history.appendChild(li);
  }
}

// Listener en tiempo real (últimas 10)
onSnapshot(
  query(opsCol, orderBy("createdAt", "desc"), limit(10)),
  (snap) => {
    const items = snap.docs.map(d => d.data()).filter(x => x && x.a != null);
    renderHistory(items);
  },
  (err) => {
    console.error(err);
    setError("No se pudo cargar el historial (revisa Firestore Rules).");
  }
);

// App (sumar)
async function sum() {
  setError("");

  const a = parseNumber($a.value);
  const b = parseNumber($b.value);

  if (a === null || b === null) {
    $result.textContent = "—";
    setError("Pon dos números válidos (ej: 10, 2.5).");
    return;
  }

  const total = a + b;
  $result.textContent = formatNumber(total);

  // Guardar en Firestore
  try {
    await saveOperation(a, b, total);
  } catch (e) {
    console.error(e);
    setError("No se pudo guardar en Firebase. Revisa reglas o conexión.");
  }
}

function clearAll() {
  $a.value = "";
  $b.value = "";
  $result.textContent = "—";
  setError("");
  $a.focus();
}

$sumBtn.addEventListener("click", sum);
$clearBtn.addEventListener("click", clearAll);

[$a, $b].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sum();
    }
  });
});
