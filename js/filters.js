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

	window.Filters = {
		filterBooks,
		sortBooks,
		applyFiltersAndSort,
	};
})();

