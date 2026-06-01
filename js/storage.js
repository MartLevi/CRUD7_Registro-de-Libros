(function () {
	const STORAGE_KEY = 'crud7_books';

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
		const record	= Object.assign({ id, createdAt: new Date().toISOString() }, book);
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

	// Expose API
	window.StorageModule = {
		addBook,
		getAllBooks,
		getBookById,
		updateBook,
	};
})();

