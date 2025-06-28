import SearchBar from '../components/SearchBar';
import { useState, useEffect } from 'react';
import './Leaderboard.css';

function Leaderboard() {
  const [users, setUsers] = useState([
    { username: 'FuzzyKing', wallet: 'rXRP...1111', balance: 1000, nftCount: 5, postCount: 20 },
    { username: 'XRPFan', wallet: 'rXRP...2222', balance: 800, nftCount: 3, postCount: 15 },
    { username: 'CurrentUser', wallet: 'rXRP...9999', balance: 500, nftCount: 2, postCount: 10 },
  ]);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [sortBy, setSortBy] = useState('balance');

  // Apply sorting whenever sortBy or filteredUsers changes
  useEffect(() => {
    const sorted = [...filteredUsers].sort((a, b) => b[sortBy] - a[sortBy]);
    setFilteredUsers(sorted);
  }, [sortBy]);

  // Handle sorting button clicks
  const handleSort = (key) => {
    setSortBy(key);
  };

  // Handle search filtering from SearchBar
  const handleFilter = (filtered) => {
    // Filter from full users list, then sort
    const filteredSorted = filtered.sort((a, b) => b[sortBy] - a[sortBy]);
    setFilteredUsers(filteredSorted);
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Leaderboard</h1>
        <p>Check out the top $FUZZY holders and community contributors!</p>
        <SearchBar
          posts={users}
          setFilteredPosts={handleFilter}
          keys={['username', 'wallet']} // Search by username or wallet
        />
      </div>
      <div className="leaderboard-container">
        <div className="sort-controls">
          <button
            className={`sort-button ${sortBy === 'balance' ? 'active' : ''}`}
            onClick={() => handleSort('balance')}
          >
            Sort by Balance
          </button>
          <button
            className={`sort-button ${sortBy === 'nftCount' ? 'active' : ''}`}
            onClick={() => handleSort('nftCount')}
          >
            Sort by NFTs
          </button>
          <button
            className={`sort-button ${sortBy === 'postCount' ? 'active' : ''}`}
            onClick={() => handleSort('postCount')}
          >
            Sort by Posts
          </button>
        </div>
        <div className="leaderboard-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div key={user.wallet} className="leaderboard-card">
                <span className="rank">#{index + 1}</span>
                <a href={`/profile/${user.wallet}`} className="user-link">
                  {user.username}
                </a>
                <p>Wallet: {user.wallet}</p>
                <p>Balance: {user.balance} XRP</p>
                <p>NFTs: {user.nftCount}</p>
                <p>Posts: {user.postCount}</p>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
