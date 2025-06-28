import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

function SearchBar({ posts, setFilteredPosts, keys = ['content', 'user.username'], placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');

  // Memoize Fuse instance to avoid re-creating on every render
  const fuse = useMemo(() => new Fuse(posts, { keys, threshold: 0.3 }), [posts, keys]);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const results = fuse.search(query).map(({ item }) => item);
      setFilteredPosts(results);
    }
  }, [query, fuse, posts, setFilteredPosts]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder={placeholder}
        className="search-input"
        autoComplete="off"
      />
    </div>
  );
}

export default SearchBar;
