// src/components/SearchBar.jsx
import { useState } from 'react';
import Fuse from 'fuse.js';

function SearchBar({ posts, setFilteredPosts }) {
  const [query, setQuery] = useState('');

  const fuse = new Fuse(posts, {
    keys: ['content', 'user.username'], // Search post content and username
    threshold: 0.3, // Fuzziness (0 = exact, 1 = loose)
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === '') {
      setFilteredPosts(posts); // Show all posts if query is empty
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
        placeholder="Search Fuzzy posts..."
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;