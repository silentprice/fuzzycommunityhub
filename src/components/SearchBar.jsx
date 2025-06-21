import { useState } from 'react';
import Fuse from 'fuse.js';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const data = [
    { title: 'XRP News' },
    { title: 'Community Update' },
    { title: 'XRP Ledger Guide' },
  ];

  const fuse = new Fuse(data, { keys: ['title'] });

  const handleSearch = (e) => {
    setQuery(e.target.value);
    const searchResults = fuse.search(e.target.value);
    setResults(searchResults.map((result) => result.item));
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search community content..."
        className="w-full p-2 border rounded"
      />
      <ul>
        {results.map((item, index) => (
          <li key={index} className="p-2">{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default SearchBar;