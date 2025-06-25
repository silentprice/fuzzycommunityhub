// src/components/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client } from 'xrpl';
import fuzzyAvatar from '../assets/fuzzy5.png';
import './UserProfile.css';

function UserProfile({ account }) {
  const { wallet } = useParams();
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  // Placeholder user data
  // const currentUser = useAuth().user || { username: 'Guest', wallet: '' };
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
        setNfts(nftsResponse.result.account_nfts);

        await client.disconnect();
      } catch (err) {
        setError('Failed to fetch profile data: ' + err.message);
        console.error(err);
      }
    }
    fetchUserData();

    setUserPosts([
      {
        id: 1,
        content: 'Just joined the FUZZY/XRP pool!',
        timestamp: new Date().toLocaleString(),
        comments: [{ id: 1, user: 'OtherUser', content: 'Welcome!' }],
      },
    ]);
  }, [targetWallet]);

  if (error) {
    return (
      <div className="user-profile-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img src={fuzzyAvatar} alt="Avatar" className="profile-avatar" />
          <h2>{isOwnProfile ? 'Your Profile' : 'User Profile'}</h2>
        </div>
        {accountInfo ? (
          <div className="profile-details">
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Wallet:</strong> {targetWallet}</p>
            <p><strong>Balance:</strong> {(accountInfo.account_data.Balance / 1000000).toFixed(2)} XRP</p>
            <p><strong>Bio:</strong> XRP Fuzzy enthusiast!</p>
            {isOwnProfile && (
              <button className="edit-button">Edit Profile</button>
            )}
            <Link to="/nft-marketplace" className="marketplace-link">View NFT Marketplace</Link>
            <div className="nfts-section">
              <h3>NFTs</h3>
              {nfts.length > 0 ? (
                <ul className="nft-list">
                  {nfts.map((nft) => (
                    <li key={nft.NFTokenID} className="nft-item">
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