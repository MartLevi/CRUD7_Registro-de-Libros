/**
 * crud.js — Operaciones CRUD y renderizado de tarjetas
 * Depende de: storage.js, validations.js
 * Llama a:    refreshDashboard() (dashboard.js)
 *             triggerFilter(), refreshGeneroOptions() (filters.js)
 */

/* ID del libro en edición; null = modo creación */
let editingId = null;

/* ═══════════════════════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════════════════════ */

/**
 * Renderiza el array de libros en el grid.
 * @param {Array} books
 */
function renderBooks(books) {
  try {
    const grid       = document.getElementById('books-grid');
    const emptyState = document.getElementById('empty-state');
    const emptyBtn   = document.getElementById('btn-empty-nuevo');
    if (!grid) return;

    grid.innerHTML = '';

    if (books.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      /* Ocultar botón "Agregar" si hay filtros activos */
      const hasFilter =
        (document.getElementById('search-input')?.value || '') ||
        (document.getElementById('filter-estado')?.value !== 'todos') ||
        (document.getElementById('filter-genero')?.value !== 'todos') ||
        (document.getElementById('filter-year-from')?.value || '') ||
        (document.getElementById('filter-year-to')?.value || '') ||
        (document.getElementById('filter-calificacion')?.value || '');
      if (emptyBtn) emptyBtn.style.display = hasFilter ? 'none' : '';
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    books.forEach(book => grid.appendChild(createBookCard(book)));
  } catch (error) {
    console.error('[crud] Error renderizando libros:', error);
  }
}

/**
 * Crea y retorna una tarjeta <article> para el libro.
 * @param {Object} book
 * @returns {HTMLElement}
 */
function createBookCard(book) {
  const article = document.createElement('article');
  article.className = 'book-card';
  article.setAttribute('role', 'listitem');
  article.dataset.id = book.id;

  const badgeClass = {
    leido:      'badge-leido',
    leyendo:    'badge-leyendo',
    'no-leido': 'badge-noleido'
  }[book.estado] || 'badge-noleido';

  article.innerHTML = `
    <div class="book-card-header">
      <span class="book-card-badge ${badgeClass}">${estadoLabel(book.estado)}</span>
      <span class="book-card-stars" aria-label="${book.calificacion} de 5 estrellas">
        ${renderStars(book.calificacion)}
      </span>
    </div>
    <h3 class="book-card-title">${escapeHtml(book.titulo)}</h3>
    <p class="book-card-author">✍️ ${escapeHtml(book.autor)}</p>
    <p class="book-card-meta">📚 ${escapeHtml(book.genero)} &middot; ${book.anio}</p>
    ${book.notas ? `<p class="book-card-notes">"${escapeHtml(book.notas)}"</p>` : ''}
    <div class="book-card-actions">
      <button class="btn btn-edit" data-id="${book.id}">✏️ Editar</button>
      <button class="btn btn-delete" data-id="${book.id}">🗑️ Eliminar</button>
    </div>
  `;

  article.querySelector('.btn-edit').addEventListener('click', () => openEditModal(book.id));
  article.querySelector('.btn-delete').addEventListener('click', () => confirmDelete(book.id));

  return article;
}

/**
 * Genera la representación de estrellas llenas/vacías.
 * @param {number} n  1–5
 * @returns {string}
 */
function renderStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

/**
 * Etiqueta legible del estado.
 * @param {string} estado
 * @returns {string}
 */
function estadoLabel(estado) {
  return { leido: 'Leído', leyendo: 'Leyendo', 'no-leido': 'No leído' }[estado] || estado;
}

/**
 * Escapa caracteres HTML para evitar XSS al insertar en innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

/* ═══════════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════════ */

function openCreateModal() {
  editingId = null;
  resetForm();
  document.getElementById('modal-title').textContent = '📝 Nuevo Libro';
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('field-titulo')?.focus(), 60);
}

/**
 * Abre el modal en modo edición precargando los datos del libro.
 * @param {string} id
 */
function openEditModal(id) {
  try {
    const book = getBookById(id);
    if (!book) return;

    editingId = id;
    resetForm();

    document.getElementById('modal-title').textContent      = '✏️ Editar Libro';
    document.getElementById('field-id').value               = book.id;
    document.getElementById('field-titulo').value           = book.titulo;
    document.getElementById('field-autor').value            = book.autor;
    document.getElementById('field-genero').value           = book.genero;
    document.getElementById('field-anio').value             = book.anio;
    document.getElementById('field-estado').value           = book.estado;
    document.getElementById('field-notas').value            = book.notas || '';

    setStarRating(book.calificacion);

    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('field-titulo')?.focus(), 60);
  } catch (error) {
    console.error('[crud] Error abriendo edición:', error);
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  resetForm();
  editingId = null;
}

function resetForm() {
  try {
    document.getElementById('book-form')?.reset();
    document.querySelectorAll('.error-msg').forEach(el => { el.textContent = ''; });
    setStarRating(0);
  } catch (error) {
    console.error('[crud] Error reseteando formulario:', error);
  }
}

/* ═══════════════════════════════════════════════════════════════
   STAR RATING WIDGET
═══════════════════════════════════════════════════════════════ */

/**
 * Inyecta los 5 botones de estrellas en #star-rating.
 * Llamado una vez desde app.js.
 */
function initStarRating() {
  const container = document.getElementById('star-rating');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'star-btn';
    btn.dataset.value = i;
    btn.textContent = '☆';
    btn.setAttribute('aria-label', `${i} estrella${i > 1 ? 's' : ''}`);

    btn.addEventListener('click',      () => setStarRating(i));
    btn.addEventListener('mouseenter', () => highlightStars(i));
    btn.addEventListener('mouseleave', () => {
      const cur = parseInt(document.getElementById('field-calificacion').value || '0', 10);
      highlightStars(cur);
    });

    container.appendChild(btn);
  }
}

/**
 * Establece la calificación visual y en el campo oculto.
 * @param {number} value  0–5
 */
function setStarRating(value) {
  try {
    document.getElementById('field-calificacion').value = value;
    highlightStars(value);
  } catch (error) {
    console.error('[crud] Error ajustando calificación:', error);
  }
}

/**
 * Rellena visualmente las estrellas hasta `value`.
 * @param {number} value
 */
function highlightStars(value) {
  document.querySelectorAll('.star-btn').forEach(btn => {
    const v = parseInt(btn.dataset.value, 10);
    btn.textContent = v <= value ? '★' : '☆';
    btn.classList.toggle('active', v <= value);
  });
}

/* ═══════════════════════════════════════════════════════════════
   CRUD OPERATIONS
═══════════════════════════════════════════════════════════════ */

/**
 * Manejador del submit del formulario.
 * @param {Event} event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  try {
    const raw = readFormValues();
    const { valid, errors } = validateBook(raw);

    if (!valid) {
      showFieldErrors(errors);
      return;
    }

    clearFieldErrors();
    editingId ? updateBook(raw) : createBook(raw);

  } catch (error) {
    console.error('[crud] Error en submit:', error);
    showToast('Error inesperado al guardar el libro.', 'error');
  }
}

/**
 * Lee todos los valores actuales del formulario.
 * @returns {Object}
 */
function readFormValues() {
  return {
    titulo:        document.getElementById('field-titulo').value,
    autor:         document.getElementById('field-autor').value,
    genero:        document.getElementById('field-genero').value,
    anio:          document.getElementById('field-anio').value,
    estado:        document.getElementById('field-estado').value,
    calificacion:  document.getElementById('field-calificacion').value,
    notas:         document.getElementById('field-notas').value
  };
}

function createBook(raw) {
  try {
    const now     = new Date().toISOString();
    const newBook = {
      id:                generateId(),
      titulo:            raw.titulo.trim(),
      autor:             raw.autor.trim(),
      genero:            raw.genero,
      anio:              parseInt(raw.anio, 10),
      estado:            raw.estado,
      calificacion:      parseInt(raw.calificacion, 10) || 0,
      notas:             raw.notas.trim(),
      fechaCreacion:     now,
      fechaModificacion: now
    };

    const books = getAllBooks();
    books.push(newBook);
    saveAllBooks(books);

    closeModal();
    triggerFilter();
    refreshDashboard();
    refreshGeneroOptions();
    showToast('✅ Libro guardado correctamente.', 'success');
  } catch (error) {
    console.error('[crud] Error creando libro:', error);
    showToast('Error al crear el libro.', 'error');
  }
}

function updateBook(raw) {
  try {
    const books = getAllBooks();
    const idx   = books.findIndex(b => b.id === editingId);
    if (idx === -1) return;

    books[idx] = {
      ...books[idx],
      titulo:            raw.titulo.trim(),
      autor:             raw.autor.trim(),
      genero:            raw.genero,
      anio:              parseInt(raw.anio, 10),
      estado:            raw.estado,
      calificacion:      parseInt(raw.calificacion, 10) || 0,
      notas:             raw.notas.trim(),
      fechaModificacion: new Date().toISOString()
    };

    saveAllBooks(books);
    closeModal();
    triggerFilter();
    refreshDashboard();
    refreshGeneroOptions();
    showToast('✅ Libro actualizado correctamente.', 'success');
  } catch (error) {
    console.error('[crud] Error actualizando libro:', error);
    showToast('Error al actualizar el libro.', 'error');
  }
}

/**
 * Pide confirmación al usuario antes de eliminar.
 * @param {string} id
 */
function confirmDelete(id) {
  const book = getBookById(id);
  const name = book ? `"${book.titulo}"` : 'este libro';

  if (window.confirm(`¿Eliminar ${name}?\n\nEsta acción no se puede deshacer.`)) {
    deleteBook(id);
  }
}

function deleteBook(id) {
  try {
    const books = getAllBooks().filter(b => b.id !== id);
    saveAllBooks(books);

    triggerFilter();
    refreshDashboard();
    refreshGeneroOptions();
    showToast('📕 Libro eliminado.', 'info');
  } catch (error) {
    console.error('[crud] Error eliminando libro:', error);
    showToast('Error al eliminar el libro.', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════════════════════ */

/**
 * Genera un ID único para un nuevo libro.
 * @returns {string}
 */
function generateId() {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

/**
 * Muestra los mensajes de error por campo bajo cada input.
 * @param {Object} errors  { campo: 'mensaje' }
 */
function showFieldErrors(errors) {
  Object.entries(errors).forEach(([field, msg]) => {
    const el = document.getElementById(`err-${field}`);
    if (el) el.textContent = msg;
  });
}

function clearFieldErrors() {
  document.querySelectorAll('.error-msg').forEach(el => { el.textContent = ''; });
}

/**
 * Muestra una notificación toast temporal.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  try {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className   = `toast toast-${type}`;
    toast.classList.remove('hidden');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), 3500);
  } catch (error) {
    console.error('[crud] Error mostrando toast:', error);
  }
}
