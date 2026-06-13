(function () {
	function _matchQuery(book, query) {
		if (!query) return true;
		const q = String(query).toLowerCase();
		return (
			(book.titulo && book.titulo.toLowerCase().includes(q)) ||
			(book.autor && book.autor.toLowerCase().includes(q)) ||
			(book.notas && book.notas.toLowerCase().includes(q)) ||
			(book.title && book.title.toLowerCase().includes(q)) ||
			(book.author && book.author.toLowerCase().includes(q))
		);
	}

	function filterBooks(books = [], options = {}) {
		const { query, autor, author, yearFrom, yearTo, estado, genero, calificacion, readStatus } = options;
		return books.filter((b) => {
			if (!b) return false;
			if (query && !_matchQuery(b, query)) return false;
			const bookAuthor = b.autor || b.author || '';
			const bookYear = Number(b.anio || b.year);
			if ((autor || author) && String(bookAuthor).toLowerCase() !== String(autor || author).toLowerCase()) return false;
			if (yearFrom && bookYear && bookYear < Number(yearFrom)) return false;
			if (yearTo && bookYear && bookYear > Number(yearTo)) return false;
			if (estado && estado !== 'todos' && b.estado !== estado) return false;
			if (genero && genero !== 'todos' && b.genero !== genero) return false;
			if (calificacion && Number(b.calificacion) !== Number(calificacion)) return false;
			if (typeof readStatus !== 'undefined' && b.read !== undefined) {
				const want = readStatus === true || String(readStatus) === 'true';
				if (Boolean(b.read) !== want) return false;
			}
			return true;
		});
	}

	function sortBooks(books = [], sortBy = 'createdAt', order = 'desc') {
		const dir = order === 'asc' ? 1 : -1;
		return books.slice().sort((a, b) => {
			const va = a[sortBy];
			const vb = b[sortBy];
			if (va == null && vb == null) return 0;
			if (va == null) return -1 * dir;
			if (vb == null) return 1 * dir;
			if (va > vb) return 1 * dir;
			if (va < vb) return -1 * dir;
			return 0;
		});
	}

	function applyFiltersAndSort(books, options = {}, sort = { sortBy: 'createdAt', order: 'desc' }) {
		const filtered = filterBooks(books, options);
		return sortBooks(filtered, sort.sortBy, sort.order);
	}

	function readFilterOptions() {
		return {
			query: document.getElementById('search-input')?.value.trim() || '',
			estado: document.getElementById('filter-estado')?.value || 'todos',
			genero: document.getElementById('filter-genero')?.value || 'todos',
			yearFrom: document.getElementById('filter-year-from')?.value || '',
			yearTo: document.getElementById('filter-year-to')?.value || '',
			calificacion: document.getElementById('filter-calificacion')?.value || '',
		};
	}

	function triggerFilter() {
		try {
			const books = typeof getAllBooks === 'function' ? getAllBooks() : [];
			const filtered = applyFiltersAndSort(
				books,
				readFilterOptions(),
				{ sortBy: 'fechaCreacion', order: 'desc' }
			);

			if (typeof renderBooks === 'function') {
				renderBooks(filtered);
			}
		} catch (error) {
			console.error('[filters] Error aplicando filtros:', error);
		}
	}

	function refreshGeneroOptions() {
		try {
			const select = document.getElementById('filter-genero');
			if (!select) return;

			const currentValue = select.value || 'todos';
			const books = typeof getAllBooks === 'function' ? getAllBooks() : [];
			const genres = [...new Set(books.map(book => book.genero).filter(Boolean))]
				.sort((a, b) => a.localeCompare(b, 'es'));

			select.innerHTML = '<option value="todos">Todos los géneros</option>';
			genres.forEach(genre => {
				const option = document.createElement('option');
				option.value = genre;
				option.textContent = genre;
				select.appendChild(option);
			});

			select.value = genres.includes(currentValue) ? currentValue : 'todos';
		} catch (error) {
			console.error('[filters] Error actualizando géneros:', error);
		}
	}

	function clearFilters() {
		const search = document.getElementById('search-input');
		const estado = document.getElementById('filter-estado');
		const genero = document.getElementById('filter-genero');
		const yearFrom = document.getElementById('filter-year-from');
		const yearTo = document.getElementById('filter-year-to');
		const calificacion = document.getElementById('filter-calificacion');

		if (search) search.value = '';
		if (estado) estado.value = 'todos';
		if (genero) genero.value = 'todos';
		if (yearFrom) yearFrom.value = '';
		if (yearTo) yearTo.value = '';
		if (calificacion) calificacion.value = '';

		triggerFilter();
	}

	function initFilters() {
		try {
			const search = document.getElementById('search-input');
			const controls = [
				document.getElementById('filter-estado'),
				document.getElementById('filter-genero'),
				document.getElementById('filter-year-from'),
				document.getElementById('filter-year-to'),
				document.getElementById('filter-calificacion'),
			];

			search?.addEventListener('input', triggerFilter);
			controls.forEach(control => control?.addEventListener('change', triggerFilter));
			document.getElementById('btn-clear-filters')?.addEventListener('click', clearFilters);

			refreshGeneroOptions();
		} catch (error) {
			console.error('[filters] Error inicializando filtros:', error);
		}
	}

	window.Filters = {
		filterBooks,
		sortBooks,
		applyFiltersAndSort,
		readFilterOptions,
		triggerFilter,
		refreshGeneroOptions,
		initFilters,
	};

	window.initFilters = initFilters;
	window.triggerFilter = triggerFilter;
	window.refreshGeneroOptions = refreshGeneroOptions;
})();

