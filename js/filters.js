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
})();

