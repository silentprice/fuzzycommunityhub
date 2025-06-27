// src/components/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client } from 'xrpl';
//import fuzzyAvatar from '../assets/fuzzy5.png';
//import fuzzybear64 from '../assets/fuzzybear64.png'; // Placeholder NFT image
import './UserProfile.css';

function UserProfile({ account }) {
  const { wallet } = useParams();
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [bio, setBio] = useState('XRP Fuzzy enthusiast!'); // Default bio
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(null);

  const targetWallet = wallet || account;
  const currentUser = { username: 'CurrentUser', wallet: account || 'rXRP...9999' };
  const isOwnProfile = targetWallet === currentUser.wallet;

  useEffect(() => {
    async function fetchUserData() {
      if (!targetWallet) {
        setError('No wallet address provided.');
        return;
      }
      try {
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();
        const accountResponse = await client.request({
          command: 'account_info',
          account: targetWallet,
        });
        setAccountInfo(accountResponse.result);
        const nftsResponse = await client.request({
          command: 'account_nfts',
          account: targetWallet,
        });
        // Enhance NFTs with placeholder names/images
        const enhancedNfts = nftsResponse.result.account_nfts.map((nft, index) => ({
          ...nft,
          name: `Fuzzybear #${index + 64}`,
          image: fuzzybear64,
        }));
        setNfts(enhancedNfts);
        await client.disconnect();
      } catch (err) {
        setError('Failed to fetch profile data: ' + err.message);
        console.error(err);
      }
    }
    fetchUserData();

    // Placeholder posts
    setUserPosts([
      {
        id: 1,
        content: 'Just joined the FUZZY/XRP pool!',
        timestamp: new Date().toLocaleString(),
        comments: [{ id: 1, user: 'OtherUser', content: 'Welcome!', timestamp: new Date().toLocaleString() }],
      },
    ]);
  }, [targetWallet]);

  const handleBioSave = () => {
    if (!bio.trim()) {
      setError('Bio cannot be empty.');
      return;
    }
    setSuccess('Bio saved successfully!');
    setIsEditing(false);
    setTimeout(() => setSuccess(null), 3000); // Clear after 3s
  };

  const handleBioCancel = () => {
    setBio('XRP Fuzzy enthusiast!'); // Reset to default
    setIsEditing(false);
    setError(null);
  };

  if (error) {
    return (
      <div className="user-profile-container">
        <p className="error" role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img src={fuzzyAvatar} alt="User avatar" className="profile-avatar" />
          <h2>{isOwnProfile ? 'Your Profile' : 'User Profile'}</h2>
        </div>
        {accountInfo ? (
          <div className="profile-details">
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Wallet:</strong> {targetWallet}</p>
            <p><strong>Balance:</strong> {(accountInfo.account_data.Balance / 1000000).toFixed(2)} XRP</p>
            {isEditing ? (
              <div className="bio-edit">
                <label htmlFor="bio-input" className="sr-only">Edit bio</label>
                <textarea
                  id="bio-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter your bio..."
                  className="bio-input"
                  aria-describedby="bio-error"
                />
                <div className="bio-buttons">
                  <button
                    onClick={handleBioSave}
                    className="edit-button"
                    aria-label="Save bio"
                  >
                    Save Bio
                  </button>
                  <button
                    onClick={handleBioCancel}
                    className="cancel-button"
                    aria-label="Cancel bio edit"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p><strong>Bio:</strong> {bio}</p>
            )}
            {success && (
              <p className="success" role="alert">{success}</p>
            )}
            {isOwnProfile && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                  aria-label="Edit profile"
                >
                  Edit Profile
                </button>
                <Link to="/nft-marketplace" className="marketplace-link">
                  View NFT Marketplace
                </Link>
              </>
            )}
            <div className="nfts-section">
              <h3>NFTs</h3>
              {nfts.length > 0 ? (
                <ul className="nft-list">
                  {nfts.map((nft) => (
                    <li key={nft.NFTokenID} className="nft-item">
                      <img src={nft.image} alt={nft.name} className="nft-image" />
                      <p><strong>Name:</strong> {nft.name}</p>
                      <p><strong>ID:</strong> {nft.NFTokenID}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No NFTs found.</p>
              )}
            </div>
            <div className="posts-section">
              <h3>Posts</h3>
              {userPosts.length > 0 ? (
                <ul className="post-list">
                  {userPosts.map((post) => (
                    <li key={post.id} className="post-item">
                      <p>{post.content}</p>
                      <span className="post-time">{post.timestamp}</span>
                      <p><strong>Comments:</strong> {post.comments.length}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No posts yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;