import { useState } from 'react';
import Fuse from 'fuse.js';

function SearchBar({ posts, setFilteredPosts, keys = ['content', 'user.username'] }) {
  const [query, setQuery] = useState('');

  const fuse = new Fuse(posts, {
    keys,
    threshold: 0.3,
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const results = fuse.search(value).map((result) => result.item);
      setFilteredPosts(results);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search users..."
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;