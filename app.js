const $a = document.getElementById("a");
const $b = document.getElementById("b");
const $result = document.getElementById("result");
const $error = document.getElementById("error");

const $sumBtn = document.getElementById("sumBtn");
const $clearBtn = document.getElementById("clearBtn");

// Convierte texto a número aceptando coma o punto
function parseNumber(value) {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function setError(msg) {
  $error.textContent = msg || "";
}

function sum() {
  setError("");

  const a = parseNumber($a.value);
  const b = parseNumber($b.value);

  if (a === null || b === null) {
    $result.textContent = "—";
    setError("Pon dos números válidos (ej: 10, 2.5).");
    return;
  }

  const total = a + b;
  // evita mostrar 0.30000000000000004 y similares
  $result.textContent = Number.isInteger(total) ? String(total) : String(+total.toFixed(10));
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

// Enter para sumar desde cualquier input
[$a, $b].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sum();
    }
  });
});
