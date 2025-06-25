import SearchBar from '../components/SearchBar';
import { useState } from 'react';
import './NFTMarketplace.css';

function NFTMarketplace() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});

  const currentUser = { username: 'CurrentUser', wallet: 'rXRP...9999' }; // Placeholder

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      user: currentUser,
      content: newPost,
      timestamp: new Date().toLocaleString(),
      comments: [],
    };
    setPosts([post, ...posts]);
    setFilteredPosts([post, ...filteredPosts]);
    setNewPost('');
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    if (!newComment[postId]?.trim()) return;
    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            comments: [
              ...post.comments,
              {
                id: Date.now(),
                user: currentUser.username,
                content: newComment[postId],
                timestamp: new Date().toLocaleString(),
              },
            ],
          }
        : post
    );
    setPosts(updatedPosts);
    setFilteredPosts(updatedPosts);
    setNewComment({ ...newComment, [postId]: '' });
  };

  // Placeholder NFT data
  const nfts = [
    { id: 'NFT123', name: 'Fuzzybear #64', image: '/path/to/nft-image.png' },
    { id: 'NFT456', name: 'Fuzzybear #65', image: '/path/to/nft-image2.png' },
  ];

  return (
    <div className="container">
      <div className="hero">
        <h1>NFT Marketplace</h1>
        <p>Discuss and explore $FUZZY NFTs in the XRP Fuzzy community!</p>
        <SearchBar posts={posts} setFilteredPosts={setFilteredPosts} />
      </div>
      <div className="nft-marketplace-container">
        <div className="nft-gallery">
          <h2>Featured NFTs</h2>
          <div className="nft-list">
            {nfts.map((nft) => (
              <div key={nft.id} className="nft-card">
                <img src={nft.image} alt={nft.name} className="nft-image" />
                <p><strong>{nft.name}</strong></p>
                <p>ID: {nft.id}</p>
              </div>
            ))}
          </div>
        </div>
        <form className="post-form" onSubmit={handlePostSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your NFT thoughts..."
            className="post-input"
          />
          <button type="submit" className="post-button">Post</button>
        </form>
        <div className="posts-list">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <a href={`/profile/${post.user.wallet}`} className="user-link">
                    {post.user.username}
                  </a>
                  <span className="post-time">{post.timestamp}</span>
                </div>
                <p className="post-content">{post.content}</p>
                <div className="comments-section">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <span className="comment-user">{comment.user}</span>: {comment.content}
                      <span className="comment-time">{comment.timestamp}</span>
                    </div>
                  ))}
                  <form
                    className="comment-form"
                    onSubmit={(e) => handleCommentSubmit(post.id, e)}
                  >
                    <input
                      type="text"
                      value={newComment[post.id] || ''}
                      onChange={(e) =>
                        setNewComment({ ...newComment, [post.id]: e.target.value })
                      }
                      placeholder="Comment..."
                      className="comment-input"
                    />
                    <button type="submit" className="comment-button">Comment</button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p>No posts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default NFTMarketplace;