// 1. Configuració de Firebase (SUBSTITUEIX AIXÒ PEL TEU)
const firebaseConfig = {
  apiKey: "EL_TEURE_API_KEY",
  authDomain: "EL_TEURE_PROJECT_ID.firebaseapp.com",
  projectId: "EL_TEURE_PROJECT_ID",
  storageBucket: "EL_TEURE_PROJECT_ID.appspot.com",
  messagingSenderId: "EL_TEURE_SENDER_ID",
  appId: "EL_TEURE_APP_ID"
};

// Inicialitzar Firebase
firebase.initializeApp(firebaseConfig);

// Obtenir referència a Firestore
const db = firebase.firestore();

// Referència a la col·lecció de tasques
const tasquesRef = db.collection("tasques");

// Elements del DOM
const formTasca = document.getElementById("form-tasca");
const inputTasca = document.getElementById("input-tasca");
const llistaTasques = document.getElementById("llista-tasques");

// 2. Afegir una tasca nova
formTasca.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = inputTasca.value.trim();
  if (!text) return;

  try {
    await tasquesRef.add({
      text: text,
      completada: false,
      creatEl: firebase.firestore.FieldValue.serverTimestamp()
    });
    inputTasca.value = "";
  } catch (error) {
    console.error("Error afegint tasca:", error);
  }
});

// 3. Escoltar els canvis en temps real
tasquesRef
  .orderBy("creatEl", "asc")
  .onSnapshot((snapshot) => {
    llistaTasques.innerHTML = "";

    snapshot.forEach((doc) => {
      const tasca = doc.data();
      const li = document.createElement("li");
      li.classList.add("tasca");
      if (tasca.completada) {
        li.classList.add("tasca-completada");
      }

      // Checkbox per marcar completada
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!tasca.completada;
      checkbox.addEventListener("change", () => {
        tasquesRef.doc(doc.id).update({
          completada: checkbox.checked
        });
      });

      // Text de la tasca
      const span = document.createElement("span");
      span.textContent = tasca.text;

      // Botó eliminar
      const botoEliminar = document.createElement("button");
      botoEliminar.textContent = "Esborrar";
      botoEliminar.classList.add("boto-eliminar");
      botoEliminar.addEventListener("click", () => {
        tasquesRef.doc(doc.id).delete().catch((error) => {
          console.error("Error esborrant tasca:", error);
        });
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(botoEliminar);
      llistaTasques.appendChild(li);
    });
  });