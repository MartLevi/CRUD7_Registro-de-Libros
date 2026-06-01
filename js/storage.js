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

	
})();

