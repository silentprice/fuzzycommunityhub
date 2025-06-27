import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../components/UserProfile';


function Profile({ account }) {
  const { wallet } = useParams(); // Get wallet address from URL
  const [user, setUser] = useState({
    username: 'FuzzyFan',
    wallet: account || wallet || 'rXRP...1234',
    bio: 'XRP enthusiast and $FUZZY holder!',
  });

  useEffect(() => {
    // Update user data based on signed-in account or URL wallet
    if (account || wallet) {
      setUser((prev) => ({
        ...prev,
        wallet: account || wallet,
      }));
    }
  }, [account, wallet]);

  return (
    <div className="container">
      <div className="hero">
        <h1>User Profile</h1>
        <div className="user-info">
          <h3>{user.username}</h3>
          <p><strong>Wallet:</strong> {user.wallet}</p>
          <p><strong>Bio:</strong> {user.bio}</p>
          {account === user.wallet && (
            <button className="edit-button">Edit Profile</button>
          )}
        </div>
        <div className="xrp-stats">
          <h3>XRP Activity</h3>
          <UserProfile account={user.wallet} />
        </div>
      </div>
    </div>
  );
}

export default Profile;