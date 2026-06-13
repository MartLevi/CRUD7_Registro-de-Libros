/**
 * validations.js — Funciones de validación puras
 * Sin acceso al DOM, sin efectos secundarios.
 * Retornan null si válido, string de error si inválido.
 */

const CURRENT_YEAR = new Date().getFullYear();

const GENEROS_VALIDOS = [
  'Ficción', 'No-ficción', 'Ciencia ficción', 'Fantasía', 'Terror',
  'Romance', 'Misterio', 'Thriller', 'Historia', 'Biografía',
  'Autoayuda', 'Ciencia', 'Filosofía', 'Poesía', 'Otro'
];

const ESTADOS_VALIDOS = ['leido', 'leyendo', 'no-leido'];

/**
 * Valida todos los campos de un libro.
 * @param {{ titulo, autor, genero, anio, estado, calificacion, notas }} data
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
function validateBook(data) {
  const errors = {};

  const checks = [
    ['titulo',        validateTitulo(data.titulo)],
    ['autor',         validateAutor(data.autor)],
    ['genero',        validateGenero(data.genero)],
    ['anio',          validateAnio(data.anio)],
    ['estado',        validateEstado(data.estado)],
    ['calificacion',  validateCalificacion(data.calificacion, data.estado)]
  ];

  checks.forEach(([field, msg]) => {
    if (msg) errors[field] = msg;
  });

  if (data.notas) {
    const notasErr = validateNotas(data.notas);
    if (notasErr) errors.notas = notasErr;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateTitulo(v) {
  if (!v || !v.trim()) return 'El título es obligatorio.';
  if (v.trim().length < 2) return 'Mínimo 2 caracteres.';
  if (v.trim().length > 200) return 'Máximo 200 caracteres.';
  return null;
}

function validateAutor(v) {
  if (!v || !v.trim()) return 'El autor es obligatorio.';
  if (v.trim().length < 2) return 'Mínimo 2 caracteres.';
  if (v.trim().length > 100) return 'Máximo 100 caracteres.';
  return null;
}

function validateGenero(v) {
  if (!v || !GENEROS_VALIDOS.includes(v)) return 'Selecciona un género válido.';
  return null;
}

function validateAnio(v) {
  const n = parseInt(v, 10);
  if (!v || isNaN(n) || !Number.isInteger(n)) return 'Ingresa un año válido.';
  if (n < 1000 || n > CURRENT_YEAR) return `El año debe estar entre 1000 y ${CURRENT_YEAR}.`;
  return null;
}

function validateEstado(v) {
  if (!v || !ESTADOS_VALIDOS.includes(v)) return 'Selecciona un estado válido.';
  return null;
}

function validateCalificacion(v, estado) {
  const raw = String(v ?? '').trim();
  const estadoNormalizado = String(estado ?? '').trim();
  const n = Number(raw);

  if ((raw === '' || raw === '0') && estadoNormalizado !== 'leido') return null;
  if (estadoNormalizado === 'leido' && (!Number.isInteger(n) || n < 1 || n > 5)) {
    return 'Selecciona una calificación para los libros leídos.';
  }
  if (!Number.isInteger(n) || n < 0 || n > 5) return 'Selecciona una calificación válida (1-5 estrellas).';
  return null;
}

function validateNotas(v) {
  if (v && v.length > 500) return 'Las notas no pueden superar 500 caracteres.';
  return null;
}
