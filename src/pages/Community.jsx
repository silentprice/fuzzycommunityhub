import SearchBar from '../components/SearchBar';
import { useState } from 'react';
import './Community.css';

function Community() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});

  const currentUser = { username: 'CurrentUser', wallet: 'rXRP...9999' }; // Placeholder; replace with auth
// const currentUser = useAuth().user || { username: 'Guest', wallet: '' };
  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(), // Unique ID; replace with backend ID
      user: currentUser,
      content: newPost,
      timestamp: new Date().toLocaleString(),
      comments: [],
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

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
    setNewComment({ ...newComment, [postId]: '' });
  };

  return (
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
        {posts.map((post) => (
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
        ))}
      </div>
    </div>
  );
}

export default Community;