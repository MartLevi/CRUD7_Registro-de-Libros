(function () {
	function _matchQuery(book, query) {
		if (!query) return true;
		const q = String(query).toLowerCase();
		return (
			(book.title && book.title.toLowerCase().includes(q)) ||
			(book.author && book.author.toLowerCase().includes(q)) ||
			(book.description && book.description.toLowerCase().includes(q))
		);
	}

	function filterBooks(books = [], options = {}) {
		const { query, author, yearFrom, yearTo, readStatus } = options;
		return books.filter((b) => {
			if (!b) return false;
			if (query && !_matchQuery(b, query)) return false;
			if (author && String(b.author).toLowerCase() !== String(author).toLowerCase()) return false;
			if (yearFrom && b.year && Number(b.year) < Number(yearFrom)) return false;
			if (yearTo && b.year && Number(b.year) > Number(yearTo)) return false;
			if (typeof readStatus !== 'undefined' && b.read !== undefined) {
				const want = readStatus === true || String(readStatus) === 'true';
				if (Boolean(b.read) !== want) return false;
			}
			return true;
		});
	}
	window.Filters = {
		filterBooks,
	};
})();

