/**
 * app.js — Punto de entrada principal
 * Orquesta la inicialización y la navegación entre vistas.
 * Se carga al final del <body>; todos los demás módulos ya están disponibles.
 */

let currentView    = 'libros';
let weatherLoaded  = false;   /* la API de clima solo se solicita una vez */

/* ═══════════════════════════════════════════════════════════════
   INICIALIZACIÓN
═══════════════════════════════════════════════════════════════ */

function initApp() {
  try {
    initSession();          // SessionStorage: registra la hora de inicio
    applyStoredDarkMode();  // LocalStorage:  aplica el tema guardado
    initStarRating();       // Crea los 5 botones de estrellas en el modal
    initFilters();          // Registra eventos de búsqueda/filtro
    renderBooks(getAllBooks()); // Carga inicial de libros
    bindNavigation();
    bindModalTriggers();
    bindDarkModeToggle();
    bindMobileMenu();
    // Sincronizar y mostrar la vista activa tal como está en el DOM
    initSessionView();
  } catch (error) {
    console.error('[app] Error inicializando la app:', error);
  }
}

/* ═══════════════════════════════════════════════════════════════
   NAVEGACIÓN
═══════════════════════════════════════════════════════════════ */

function bindNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });
}

/**
 * Cambia la vista visible y actualiza los estados activos.
 * @param {'libros'|'dashboard'} viewName
 */
function showView(viewName) {
  currentView = viewName;

  /* Ocultar todas las vistas y desactivar todos los botones */
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
    b.removeAttribute('aria-current');
  });

  /* Mostrar la vista objetivo */
  const targetView = document.getElementById(`view-${viewName}`);
  const targetBtn  = document.querySelector(`.nav-btn[data-view="${viewName}"]`);

  if (targetView) targetView.classList.remove('hidden');
  if (targetBtn)  {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-current', 'page');
  }

  /* Lógica específica de cada vista */
  if (viewName === 'dashboard') {
    initDashboard();           // Crea el Worker y solicita stats
    if (!weatherLoaded) {
      initWeatherWidget();     // Solicita geolocalización + API clima (una sola vez)
      weatherLoaded = true;
    }
    updateSessionInfo();       // Actualiza el tiempo de sesión
  }
  else {
    // Si salimos del dashboard, detener el ticker de tiempo activo si existe
    if (typeof stopSessionTicker === 'function') stopSessionTicker();
  }

  /* Cerrar sidebar en móvil */
  closeMobileSidebar();
}

/* ═══════════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════════ */

function bindModalTriggers() {
  document.getElementById('btn-nuevo-libro')?.addEventListener('click', openCreateModal);
  document.getElementById('btn-empty-nuevo')?.addEventListener('click', openCreateModal);
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);
  document.getElementById('book-form')?.addEventListener('submit', handleFormSubmit);

  /* Cerrar al hacer clic en el overlay (fuera del modal) */
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  /* Cerrar con la tecla Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' &&
        !document.getElementById('modal-overlay')?.classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODO OSCURO
═══════════════════════════════════════════════════════════════ */

function bindDarkModeToggle() {
  document.getElementById('btn-dark-mode')?.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  saveDarkMode(isDark);
  updateDarkModeButton(isDark);
}

function applyStoredDarkMode() {
  const isDark = getDarkMode();
  if (isDark) document.body.classList.add('dark-mode');
  updateDarkModeButton(isDark);
}

function updateDarkModeButton(isDark) {
  const icon  = document.querySelector('#btn-dark-mode .toggle-icon');
  const label = document.querySelector('#btn-dark-mode .toggle-label');
  if (icon)  icon.textContent  = isDark ? '☀️' : '🌙';
  if (label) label.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
}

/* ═══════════════════════════════════════════════════════════════
   MENÚ MÓVIL
═══════════════════════════════════════════════════════════════ */

function bindMobileMenu() {
  const hamburger = document.getElementById('btn-hamburger');
  const overlay   = document.getElementById('sidebar-overlay');
  const sidebar   = document.getElementById('sidebar');

  hamburger?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('active');
}

/* ═══════════════════════════════════════════════════════════════
   ARRANQUE
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', initApp);

/* Al iniciar la app, sincronizar la vista inicialmente activa en el DOM */
function initSessionView() {
  const activeBtn = document.querySelector('.nav-btn.active');
  if (activeBtn && activeBtn.dataset && activeBtn.dataset.view) {
    showView(activeBtn.dataset.view);
  } else {
    showView(currentView);
  }
}