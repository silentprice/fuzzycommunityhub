import { useState } from 'react';
import UserProfile from '../components/UserProfile';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState({
    username: 'FuzzyFan',
    wallet: 'rXRP...1234',
    bio: 'XRP enthusiast and FUZZY holder!',
  });

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="user-info">
        <h3>{user.username}</h3>
        <p>Wallet: {user.wallet}</p>
        <p>Bio: {user.bio}</p>
        <button className="edit-button">Edit Profile</button>
      </div>
      <div className="xrp-stats">
        <h3>My XRP Activity</h3>
        <UserProfile account={account} />
      </div>
    </div>
  );
}

export default Profile;