import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from 'xrpl';
import fuzzyAvatar from '../assets/fuzzy5.png'; // Reuse fuzzy5.png
import './UserProfile.css';

function UserProfile() {
  const { wallet } = useParams(); // Get wallet from URL
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // Placeholder for posts

  // Placeholder user data; replace with auth/backend
  // const currentUser = useAuth().user || { username: 'Guest', wallet: '' };
  const currentUser = { username: 'CurrentUser', wallet: 'rXRP...9999' };
  const isOwnProfile = wallet === currentUser.wallet;

  useEffect(() => {
    async function fetchUserData() {
      if (!wallet) {
        setError('No wallet address provided.');
        return;
      }
      try {
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();

        const accountResponse = await client.request({
          command: 'account_info',
          account: wallet,
        });
        setAccountInfo(accountResponse.result);

        const nftsResponse = await client.request({
          command: 'account_nfts',
          account: wallet,
        });
        setNfts(nftsResponse.result.account_nfts);

        await client.disconnect();
      } catch (err) {
        setError('Failed to fetch profile data: ' + err.message);
        console.error(err);
      }
    }
    fetchUserData();

    // Simulate fetching user posts (replace with backend API)
    setUserPosts([
      {
        id: 1,
        content: 'Just joined the FUZZY/XRP pool!',
        timestamp: new Date().toLocaleString(),
        comments: [{ id: 1, user: 'OtherUser', content: 'Welcome!' }],
      },
    ]);
  }, [wallet]);

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
            <p><strong>Username:</strong> {currentUser.username}</p> {/* Replace with backend */}
            <p><strong>Wallet:</strong> {wallet}</p>
            <p><strong>Balance:</strong> {(accountInfo.account_data.Balance / 1000000).toFixed(2)} XRP</p>
            <p><strong>Bio:</strong> XRP Fuzzy enthusiast! {/* Placeholder */}</p>
            {isOwnProfile && (
              <button className="edit-button">Edit Profile</button>
            )}
            <div className="nfts-section">
              <h3>NFTs</h3>
              {nfts.length > 0 ? (
                <ul className="nft-list">
                  {nfts.map((nft) => (
                    <li key={nft.NFTokenID} className="nft-item">
                      <p><strong>ID:</strong> {nft.NFTokenID}</p>
                      {/* Add metadata/image when available */}
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