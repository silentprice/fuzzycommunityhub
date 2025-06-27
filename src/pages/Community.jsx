// src/pages/Community.jsx
import SearchBar from '../components/SearchBar';
import { useState } from 'react';
import Xumm from 'xumm-sdk';
import xrpl from 'xrpl';
import './Community.css';

function Community() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]); // For search results
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});

  const currentUser = { username: 'CurrentUser', wallet: 'rXRP...9999' };

   /* const handlePostSubmit = async (e) => {
  e.preventDefault();
  if (!newPost.trim()) return;
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: currentUser, content: newPost }),
  });
  const post = await res.json();
  setPosts([post, ...posts]);
  setNewPost('');
};*/
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
    setFilteredPosts([post, ...filteredPosts]); // Update filtered posts
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
    setFilteredPosts(updatedPosts); // Sync filtered posts
    setNewComment({ ...newComment, [postId]: '' });
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Community</h1>
        <p>Join the XRP Fuzzy community discussions and connect with fellow enthusiasts!</p>
        <SearchBar posts={posts} setFilteredPosts={setFilteredPosts} />
      </div>
      <div className="community-container">
        <form className="post-form" onSubmit={handlePostSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts..."
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

export default Community;