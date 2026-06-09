(function () {
	const STORAGE_KEY = 'crud7_books';
	const SESSION_START_KEY = 'crud7_session_start';

	function _getStore(useSession = false) {
		return useSession ? window.sessionStorage : window.localStorage;
	}

	function _read(useSession = false) {
		try {
			const raw = _getStore(useSession).getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch (e) {
			console.error('storage: read error', e);
			return [];
		}
	}

	function _write(items, useSession = false) {
		try {
			_getStore(useSession).setItem(STORAGE_KEY, JSON.stringify(items));
			return true;
		} catch (e) {
			console.error('storage: write error', e);
			return false;
		}
	}

	function _generateId() {
		return 'b_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
	}

	function addBook(book, useSession = false) {
		const items		= _read(useSession);
		const id		= _generateId();
		const now		= new Date().toISOString();
		const record	= Object.assign({ id, createdAt: now, fechaCreacion: now }, book);
		items.push(record);
		const ok 		= _write(items, useSession);
		return ok ? record : null;
	}

	function getAllBooks(useSession = false) {
		return _read(useSession);
	}

	function getBookById(id, useSession = false) {
		const items = _read(useSession);
		return items.find((b) => b.id === id) || null;
	}

	function updateBook(id, updates, useSession = false) {
		const items = _read(useSession);
		const idx = items.findIndex((b) => b.id === id);
		if (idx === -1) return null;
		items[idx] = Object.assign({}, items[idx], updates, { updatedAt: new Date().toISOString() });
		const ok = _write(items, useSession);
		return ok ? items[idx] : null;
	}

	function deleteBook(id, useSession = false) {
		const items = _read(useSession);
		const filtered = items.filter((b) => b.id !== id);
		if (filtered.length === items.length) return false;
		return _write(filtered, useSession);
	}

	function clearAll(useSession = false) {
		try {
			_getStore(useSession).removeItem(STORAGE_KEY);
			return true;
		} catch (e) {
			console.error('storage: clear error', e);
			return false;
		}
	}

	function getSessionStart() {
		try {
			let start = window.sessionStorage.getItem(SESSION_START_KEY);
			if (!start) {
				start = new Date().toISOString();
				window.sessionStorage.setItem(SESSION_START_KEY, start);
			}
			return start;
		} catch (e) {
			console.error('storage: session start error', e);
			return new Date().toISOString();
		}
	}

	// Expose API
	window.StorageModule = {
		addBook,
		getAllBooks,
		getBookById,
		updateBook,
		deleteBook,
		clearAll,
		getSessionStart,
	};

	// Backwards-compatible globals used by the existing dashboard module.
	window.addBook 			= addBook;
	window.getAllBooks 		= getAllBooks;
	window.getBookById 		= getBookById;
	window.updateBook 		= updateBook;
	window.deleteBook 		= deleteBook;
	window.getSessionStart 	= getSessionStart;
})();

